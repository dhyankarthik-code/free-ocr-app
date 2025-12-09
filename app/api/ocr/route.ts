import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

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
    // Clean up excessive whitespace but preserve line structure
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    // Trim each line
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
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        let rawText = '';
        let usedMethod = '';
        let processingError = null;

        // --- 1. Try Mistral OCR First ---
        if (mistralApiKey) {
            try {
                console.log('Attempting Mistral OCR...');
                const client = new Mistral({ apiKey: mistralApiKey });

                const response = await client.ocr.process({
                    model: "mistral-ocr-latest",
                    document: {
                        type: "image_url",
                        imageUrl: dataUrl
                    }
                });

                if (response.pages && response.pages.length > 0) {
                    // Combine markdown from all pages
                    rawText = response.pages.map(p => p.markdown).join('\n\n');
                    usedMethod = 'mistral_ocr';
                    console.log('✅ Mistral OCR success!');
                } else {
                    throw new Error("Mistral response contained no pages");
                }
            } catch (mistralError: any) {
                console.error("⚠️ Mistral OCR failed:", mistralError.message);
                processingError = mistralError; // Store to report if fallback also fails
            }
        } else {
            console.log("ℹ️ Mistral API Key missing, skipping...");
        }

        // --- 2. Fallback to Google Cloud Vision ---
        if (!rawText && googleApiKey) {
            try {
                console.log('Falling back to Google Cloud Vision API...');

                const visionResponse = await fetch(
                    `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            requests: [{
                                image: { content: base64 },
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
                // If both failed, we throw the original error or a combined one
                throw new Error(`Both OCR engines failed. Mistral: ${processingError?.message || 'N/A'}, Google: ${googleError.message}`);
            }
        }

        if (!rawText) {
            return NextResponse.json({
                error: 'Failed to extract text from image.',
                details: processingError?.message || 'No explicit error returned.'
            }, { status: 500 });
        }

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
            text: correctedText,
            rawText: rawText,
            characters: correctedText.length,
            warnings: warnings.map(w => w.message),
            method: usedMethod
        });

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
