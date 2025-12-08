import { Mistral } from '@mistralai/mistralai';
import { NextRequest, NextResponse } from 'next/server';

// Configure Vercel Serverless Function timeout (seconds)
// Hobby plan: 10s (limit), Pro: 300s. We set 60s hoping for best effort or Pro upgrade.
export const maxDuration = 60;

// Helper function to log detailed error information
function logError(error: any, context: string = '') {
    console.error(`[${new Date().toISOString()}] Error${context ? ' in ' + context : ''}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
    });
}

/**
 * Clean garbage patterns from OCR output
 */
function cleanOCROutput(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove markdown image patterns like ![img-0.jpeg](img-0.jpeg)
    cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '');
    cleaned = cleaned.replace(/\(img-\d+\.[a-z]+\)/gi, '');
    cleaned = cleaned.replace(/<img[^>]*>/gi, '');
    cleaned = cleaned.replace(/data:image\/[^;]+;base64,[^\s]+/g, '');

    // Clean up excessive whitespace but preserve line structure
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    // Trim each line but preserve structure
    cleaned = cleaned.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

    return cleaned.trim();
}

/**
 * Check if the extracted text is valid (not garbage)
 */
function isValidOCROutput(text: string): boolean {
    if (!text || text.trim().length === 0) return false;

    // Count actual text characters vs special characters
    const alphanumeric = (text.match(/[a-zA-Z0-9]/g) || []).length;
    const special = (text.match(/[^\w\s]/g) || []).length;

    // If mostly special characters, it's likely garbage
    if (alphanumeric < special) return false;

    // If contains mostly markdown image patterns, it's garbage
    const imagePatterns = (text.match(/!\[.*?\]\(.*?\)/g) || []).length;
    const lines = text.split('\n').filter(l => l.trim().length > 0).length;
    if (imagePatterns > lines * 0.5) return false;

    return true;
}

export async function POST(request: NextRequest) {
    try {
        console.log('Received OCR request');

        const apiKey = process.env.MISTRAL_API_KEY;

        if (!apiKey) {
            const error = new Error('Mistral API key not configured');
            logError(error, 'API key check');
            return NextResponse.json(
                { error: 'Mistral API key not configured. Please check your environment variables.' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            const error = new Error('No file provided in the request');
            logError(error, 'File validation');
            return NextResponse.json(
                { error: 'No file provided. Please upload an image file.' },
                { status: 400 }
            );
        }

        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

        try {
            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            const imageUrl = `data:${file.type};base64,${base64}`;

            console.log('Initializing Mistral client...');
            const client = new Mistral({ apiKey });

            // User requested specific model: Switching to latest stable
            console.log('Using model: mistral-ocr-latest...');
            const ocrResponse = await client.ocr.process({
                model: "mistral-ocr-latest",
                document: {
                    type: "image_url",
                    imageUrl: imageUrl,
                },
                includeImageBase64: false,
            });

            let rawText = '';
            if ((ocrResponse as any)?.pages?.length) {
                rawText = (ocrResponse as any).pages
                    .map((p: any) => p?.markdown || '')
                    .filter((s: string) => s && s.trim().length > 0)
                    .join('\n\n');
            }
            if (!rawText && (ocrResponse as any)?.documentAnnotation) {
                rawText = String((ocrResponse as any).documentAnnotation);
            }

            const cleanedText = cleanOCROutput(rawText);

            if (!isValidOCROutput(cleanedText) || cleanedText.length < 5) {
                return NextResponse.json({
                    success: false,
                    error: 'Could not extract text from this image. Please ensure the image is clear, well-lit, and the text is readable.',
                }, { status: 400 });
            }

            // Apply validation
            const { validateAndCorrectOCR } = await import('@/lib/ocr-validator');
            const { correctedText, warnings } = validateAndCorrectOCR(cleanedText);

            return NextResponse.json({
                success: true,
                text: correctedText,
                rawText: rawText,
                characters: correctedText.length,
                warnings: warnings.map(w => w.message),
                method: 'standard_ocr'
            });

        } catch (apiError: any) {
            logError(apiError, 'Mistral API call');
            throw new Error(`Mistral API Error: ${apiError.message}`);
        }

    } catch (error: any) {
        logError(error, 'OCR processing');
        return NextResponse.json(
            {
                error: 'Failed to process image',
                details: error.message,
                code: error.code || 'UNKNOWN_ERROR'
            },
            { status: 500 }
        );
    }
}

/**
 * Enhanced Vision OCR with detailed instructions for layout preservation
 */
async function tryEnhancedVisionOCR(client: Mistral, imageUrl: string): Promise<string> {
    try {
        console.log('Starting enhanced Pixtral Vision OCR...');

        const response = await client.chat.complete({
            model: "pixtral-12b-2409",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `You are a professional OCR system. Extract ALL text from this image with MAXIMUM ACCURACY.

CRITICAL INSTRUCTIONS:
1. Read the image REGARDLESS of rotation or orientation
2. Extract EVERY piece of text EXACTLY as written - preserve all:
   - Numbers, letters, punctuation exactly as shown
   - Spellings (including business names, personal names)
   - Formatting and layout structure
   - Line breaks and spacing
3. For document cards/business cards:
   - Preserve the visual top-to-bottom, left-to-right order
   - Separate sections with blank lines
4. Pay EXTRA attention to:
   - Phone numbers (all digits exactly)
   - Registration numbers
   - Addresses (including abbreviations like "No." vs "No")
   - Names (spell exactly as shown)
   - Dates and times
5. Do NOT:
   - Add commentary or descriptions
   - Correct assumed errors
   - Translate or interpret
   - Skip any visible text

OUTPUT ONLY THE EXTRACTED TEXT, NOTHING ELSE.`
                        },
                        {
                            type: "image_url",
                            imageUrl: imageUrl
                        }
                    ]
                }
            ],
            temperature: 0.1, // Low temperature for deterministic output
            maxTokens: 4000,
        });

        const content = (response.choices?.[0]?.message?.content || '') as string;
        console.log('Pixtral extracted:', content.length, 'chars');

        return cleanOCROutput(content);
    } catch (e) {
        console.error('Vision OCR failed:', e);
        return '';
    }
}
