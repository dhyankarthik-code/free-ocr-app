import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
// PDF processing handled natively by Mistral OCR - no pdfjs needed

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
    const errors: string[] = [];
    let mistralError: any = null;
    let googleError: any = null;

    console.log(`[OCR Debug] Mistral key present: ${!!mistralKey}, Google key present: ${!!googleKey}`);

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
        } catch (error: any) {
            console.error("⚠️ Mistral OCR failed:", error.message);
            mistralError = error;
            errors.push(`Mistral: ${error.message}`);
        }
    } else {
        console.log('⚠️ Mistral API key not configured');
        errors.push('Mistral: API key not configured');
    }

    // Fallback to Google Vision
    if (!rawText) {
        if (googleKey) {
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

            } catch (error: any) {
                console.error("❌ Google Vision failed:", error.message);
                googleError = error;
                errors.push(`Google: ${error.message}`);
            }
        } else {
            console.log('⚠️ Google API key not configured');
            errors.push('Google: API key not configured');
        }
    }

    if (!rawText) {
        // Construct detailed error message
        const errorMessage = `OCR failed. ${errors.join(' | ')}`;
        const error: any = new Error(errorMessage);
        // Attach debug info to the error object so it can be sent to client
        error.debug = {
            mistralKeyConfigured: !!mistralKey,
            googleKeyConfigured: !!googleKey,
            mistralError: mistralError?.message,
            googleError: googleError?.message
        };
        throw error;
    }

    return { rawText, usedMethod };
}

export async function POST(request: NextRequest) {
    try {
        console.log('Received OCR request');

        const mistralApiKey = process.env.MISTRAL_API_KEY;
        const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;

        const sessionCookie = request.cookies.get("session")?.value
        let userEmail: string | null = null
        let userGoogleId: string | null = null

        let userName: string | null = null
        let userPicture: string | null = null

        if (sessionCookie) {
            try {
                const session = JSON.parse(sessionCookie)
                userEmail = session.email
                userGoogleId = session.id.replace("google_", "")
                userName = session.name || "User"
                userPicture = session.picture || ""
            } catch (e) {
                console.error("Session parse error", e)
            }
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileSizeMB = file.size / (1024 * 1024)
        const FILE_SIZE_LIMIT_MB = 10

        // Check Quota for Logged In Users + Lazy Creation
        if (userGoogleId && userEmail) {
            try {
                const { default: prisma } = await import("@/lib/db")

                // Ensure user exists using upsert (Lazy Creation)
                // This handles cases where auth callback failed to create the user
                const user = await prisma.user.upsert({
                    where: { googleId: userGoogleId },
                    update: {}, // No update needed if exists
                    create: {
                        googleId: userGoogleId,
                        email: userEmail,
                        name: userName || "User",
                        picture: userPicture,
                        usagebytes: 0
                    }
                })

                if (user) {
                    const currentUsageMB = (user.usagebytes || 0) / (1024 * 1024)
                    const userTimezone = user.timezone || 'UTC'


                    // Check if usage needs to be reset (Daily reset at 00:00 User Time) using shared logic
                    const { checkAndResetUsage } = await import("@/lib/usage-limit")

                    // This updates the DB if needed and returns the correct usage
                    const currentUsageBytes = await checkAndResetUsage(user as any, prisma as any)

                    // Update user object locally for the check below
                    user.usagebytes = currentUsageBytes

                    const updatedUsageMB = (user.usagebytes || 0) / (1024 * 1024)

                    if (updatedUsageMB + fileSizeMB > FILE_SIZE_LIMIT_MB) {
                        return NextResponse.json({
                            error: 'Daily Quota exceeded',
                            details: `You have reached the 10MB daily upload limit. Resets at 00:00 (${userTimezone}). Used: ${updatedUsageMB.toFixed(2)}MB`
                        }, { status: 403 });
                    }
                }
            } catch (dbError) {
                console.error("Quota/User Check Failed:", dbError)
                // We don't block if DB fails, to allow usage, or we could block. 
                // Given the issue, logging is key.
            }
        }

        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Check if PDF
        const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPDF) {
            console.log('📄 PDF detected, sending directly to Mistral OCR...');

            if (!mistralApiKey) {
                return NextResponse.json({
                    error: 'PDF processing requires Mistral API key',
                    details: 'Mistral OCR is required for PDF processing'
                }, { status: 500 });
            }

            try {
                const client = new Mistral({ apiKey: mistralApiKey });

                // Step 1: Upload PDF file to Mistral
                console.log('Uploading PDF to Mistral...');
                const uploadedFile = await client.files.upload({
                    file: {
                        fileName: file.name || 'document.pdf',
                        content: buffer,
                    },
                    purpose: 'ocr'
                });

                console.log(`Uploaded PDF with file ID: ${uploadedFile.id}`);

                // Step 2: Process OCR with uploaded file
                console.log('Processing OCR on uploaded PDF...');
                const response = await client.ocr.process({
                    model: "mistral-ocr-latest",
                    document: {
                        type: "file",
                        fileId: uploadedFile.id
                    }
                });

                if (!response.pages || response.pages.length === 0) {
                    throw new Error('Mistral OCR returned no pages');
                }

                console.log(`✅ Mistral extracted ${response.pages.length} pages from PDF`);

                // Format response for multi-page display
                const pageResults = response.pages.map((page: any, index: number) => {
                    const rawText = page.markdown || '';
                    const cleanedText = cleanOCROutput(rawText);

                    return {
                        pageNumber: index + 1,
                        text: cleanedText,
                        rawText: rawText,
                        characters: cleanedText.length,
                        warnings: [],
                        method: 'mistral_ocr'
                    };
                });

                if (userGoogleId) {
                    try {
                        const { default: prisma } = await import("@/lib/db")
                        await prisma.user.update({
                            where: { googleId: userGoogleId },
                            data: { usagebytes: { increment: file.size } }
                        })
                    } catch (e) {
                        console.error("Failed to update usage stats", e)
                    }
                }

                return NextResponse.json({
                    success: true,
                    isPDF: true,
                    pages: pageResults,
                    totalPages: response.pages.length
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

            if (userGoogleId) {
                try {
                    const { default: prisma } = await import("@/lib/db")
                    await prisma.user.update({
                        where: { googleId: userGoogleId },
                        data: { usagebytes: { increment: file.size } }
                    })
                } catch (e) {
                    console.error("Failed to update usage stats", e)
                }
            }

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
