import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js
if (typeof window === 'undefined') {
    // Server-side
    pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.min.js');
}

export interface PDFPageResult {
    pageNumber: number;
    imageBase64: string;
}

/**
 * Extract pages from PDF as base64-encoded PNG images
 */
export async function extractPDFPages(pdfBuffer: Buffer): Promise<PDFPageResult[]> {
    try {
        const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
        const pageResults: PDFPageResult[] = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality

            // Create canvas for rendering
            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            // Render page to canvas
            await page.render({
                canvasContext: context as any,
                viewport: viewport,
            }).promise;

            // Convert canvas to base64 PNG
            const imageBase64 = canvas.toDataURL('image/png').split(',')[1];

            pageResults.push({
                pageNumber: pageNum,
                imageBase64,
            });
        }

        return pageResults;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`Failed to extract PDF pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Create a canvas element (works in Node.js with 'canvas' package)
 */
function createCanvas(width: number, height: number) {
    if (typeof window !== 'undefined') {
        // Browser environment
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    } else {
        // Node.js environment - use 'canvas' package
        const { createCanvas: nodeCreateCanvas } = require('canvas');
        return nodeCreateCanvas(width, height);
    }
}
