import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { extractPDFPages } from '@/lib/pdf-processor';

// Configure Vercel Serverless Function timeout (seconds)
export const maxDuration = 60;

// Helper function to log detailed error information
function logError(error: any, context: string = '') {
    console.error(`[${new Date().toISOString()}] Error${context ? ' in ' + context : ''}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
    });
}

function cleanOCROutput(text: string): string {
    if (!text) return '';
    let cleaned = text;
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    return cleaned.trim();
}

function isValidOCROutput(text: string): boolean {
    if (!text || text.trim().length === 0) return false;
    const alphanumeric = (text.match(/[a-zA-Z0-9]/g) || []).length;
    const special = (text.match(/[^\w\s]/g) || []).length;
    if (alphanumeric < special) return false;
    return true;
}

async function performOCR(base64Image: string, dataUrl: string, mistralKey?: string, googleKey?: string) {
    let rawText = '';
    let usedMethod = '';
    let processingError = null;

    // Try Mistral first
    if (mistralKey) {
        try {
            console.log('Attempting Mistral OCR...');
            const client = new Mistral({ apiKey: mistralKey });

            const response = await client.ocr.process({
                model: "mistral-ocr-latest",
                document: {
                    type: "image_url",
                    imageUrl: dataUrl
                }
            });

            if (response.pages && response.pages.length > 0) {
                rawText = response.pages.map(p => p.markdown).join('\n\n');
                usedMethod = 'mistral_ocr';
                console.log('✅ Mistral OCR success!');
            } else {
                throw new Error("Mistral response contained no pages");
            }
        } catch (mistralError: any) {
            console.error("⚠️ Mistral OCR failed:", mistralError.message);
            processingError = mistralError;
        }
    }

    // Fallback to Google Vision
    if (!rawText && googleKey) {
        try {
            console.log('Falling back to Google Cloud Vision API...');

            const visionResponse = await fetch(
                `https://vision.googleapis.com/v1/images:annotate?key=${googleKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requests: [{
                            image: { content: base64Image },
                            features: [{ type: 'TEXT_DETECTION' }]
                        }]
                    })
                }
            );

            const visionData = await visionResponse.json();

            if (visionData.error) {
                throw new Error(`Google Vision API Error: ${visionData.error.message}`);
            }

            if (visionData.responses?.[0]?.textAnnotations?.[0]?.description) {
                rawText = visionData.responses[0].textAnnotations[0].description;
                usedMethod = 'google_vision';
                console.log('✅ Google Vision success!');
            } else {
                throw new Error("Google Vision found no text");
            }

        } catch (googleError: any) {
            console.error("❌ Google Vision failed:", googleError.message);
            throw new Error(`Both OCR engines failed. Mistral: ${processingError?.message || 'N/A'}, Google: ${googleError.message}`);
        }
    }

    if (!rawText) {
        throw new Error('No OCR engine available or all engines failed');
    }

    return { rawText, usedMethod };
}

export async function POST(request: NextRequest) {
    try {
        console.log('Received OCR request');

        const mistralApiKey = process.env.MISTRAL_API_KEY;
        const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Check if PDF
        const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPDF) {
            console.log('📄 PDF detected, extracting pages...');
            try {
                const pdfPages = await extractPDFPages(buffer);
                console.log(`✅ Extracted ${pdfPages.length} pages from PDF`);

                const pageResults = [];
                for (const pdfPage of pdfPages) {
                    const base64 = pdfPage.imageBase64;
                    const dataUrl = `data:image/png;base64,${base64}`;

                    const { rawText, usedMethod } = await performOCR(base64, dataUrl, mistralApiKey, googleApiKey);
                    const cleanedText = cleanOCROutput(rawText);

                    if (isValidOCROutput(cleanedText)) {
                        const { validateAndCorrectOCR } = await import('@/lib/ocr-validator');
                        const { correctedText, warnings } = validateAndCorrectOCR(cleanedText);

                        pageResults.push({
                            pageNumber: pdfPage.pageNumber,
                            text: correctedText,
                            rawText: rawText,
                            characters: correctedText.length,
                            warnings: warnings.map(w => w.message),
                            method: usedMethod
                        });
                    } else {
                        pageResults.push({
                            pageNumber: pdfPage.pageNumber,
                            text: '',
                            rawText: '',
                            characters: 0,
                            warnings: ['No valid text found on this page'],
                            method: usedMethod
                        });
                    }
                }

                return NextResponse.json({
                    success: true,
                    isPDF: true,
                    pages: pageResults,
                    totalPages: pdfPages.length
                });

            } catch (pdfError: any) {
                logError(pdfError, 'PDF Processing');
                return NextResponse.json({
                    error: 'Failed to process PDF',
                    details: pdfError.message
                }, { status: 500 });
            }
        } else {
            // Single image processing
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${file.type};base64,${base64}`;

            const { rawText, usedMethod } = await performOCR(base64, dataUrl, mistralApiKey, googleApiKey);
            const cleanedText = cleanOCROutput(rawText);

            if (!isValidOCROutput(cleanedText) || cleanedText.length < 5) {
                return NextResponse.json({
                    success: false,
                    error: 'Could not extract valid text. Image might be unclear.',
                }, { status: 400 });
            }

            const { validateAndCorrectOCR } = await import('@/lib/ocr-validator');
            const { correctedText, warnings } = validateAndCorrectOCR(cleanedText);

            return NextResponse.json({
                success: true,
                isPDF: false,
                text: correctedText,
                rawText: rawText,
                characters: correctedText.length,
                warnings: warnings.map(w => w.message),
                method: usedMethod
            });
        }

    } catch (error: any) {
        logError(error, 'OCR Route');
        return NextResponse.json(
            {
                error: 'Processing failed',
                details: error.message
            },
            { status: 500 }
        );
    }
}
