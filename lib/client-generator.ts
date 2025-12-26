
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { utils, write, read } from 'xlsx'
import PptxGenJS from 'pptxgenjs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import mammoth from 'mammoth'
import JSZip from 'jszip'

// Helper to load pdfjs-dist dynamically to avoid SSR issues
async function getPdfJs() {
    const pdfjs = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
    return pdfjs;
}

export const generateWord = async (text: string): Promise<Blob> => {
    const doc = new Document({
        sections: [{
            properties: {},
            children: text.split('\n').map((line: string) => new Paragraph({
                children: [new TextRun(line)],
            })),
        }],
    });

    return await Packer.toBlob(doc);
}

export const generateMergedWord = async (fileStates: Array<{ file: File, result: any }>): Promise<Blob> => {
    const children: Paragraph[] = [];

    fileStates.forEach((fs, index) => {
        const text = fs.result?.text || "";
        const lines = text.split('\n');

        lines.forEach((line: string, lineIndex: number) => {
            children.push(new Paragraph({
                children: [new TextRun(line)],
                // Add page break before the first paragraph of each file (except the first one)
                pageBreakBefore: index > 0 && lineIndex === 0
            }));
        });
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children
        }],
    });

    return await Packer.toBlob(doc);
}

export const generateExcel = (text: string): Blob => {
    const wb = utils.book_new();
    const rows = text.split('\n').map((line: string) => [line]);
    const ws = utils.aoa_to_sheet(rows);
    utils.book_append_sheet(wb, ws, "Sheet1");
    // Auto-width column
    ws['!cols'] = [{ wch: 100 }];
    const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/octet-stream' });
}

export const generateMergedExcel = (fileStates: Array<{ file: File, result: any }>): Blob => {
    const wb = utils.book_new();

    fileStates.forEach((fs, index) => {
        const text = fs.result?.text || "";
        const rows = text.split('\n').map((line: string) => [line]);
        const ws = utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 100 }];
        utils.book_append_sheet(wb, ws, `File ${index + 1}`);
    });

    const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/octet-stream' });
}

export const generatePPT = async (text: string): Promise<Blob> => {
    const pres = new PptxGenJS();
    const lines = text.split('\n');
    const linesPerSlide = 15;

    for (let i = 0; i < lines.length; i += linesPerSlide) {
        const slide = pres.addSlide();
        const slideText = lines.slice(i, i + linesPerSlide).join('\n');
        slide.addText(slideText, { x: 0.5, y: 0.5, w: '90%', h: '90%', fontSize: 14, color: '363636' });
    }

    return (await pres.write({ outputType: 'blob' })) as unknown as Blob;
}

export const generateMergedPPT = async (fileStates: Array<{ file: File, result: any }>): Promise<Blob> => {
    const pres = new PptxGenJS();

    for (const fs of fileStates) {
        const text = fs.result?.text || "";
        const lines = text.split('\n');
        const linesPerSlide = 15;

        for (let i = 0; i < lines.length; i += linesPerSlide) {
            const slide = pres.addSlide();
            const slideText = lines.slice(i, i + linesPerSlide).join('\n');
            slide.addText(slideText, { x: 0.5, y: 0.5, w: '90%', h: '90%', fontSize: 14, color: '363636' });
        }
    }

    return (await pres.write({ outputType: 'blob' })) as unknown as Blob;
}

export const generatePDF = (text: string): Blob => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);

    let y = 10;
    const pageHeight = doc.internal.pageSize.height;

    splitText.forEach((line: string) => {
        if (y > pageHeight - 10) {
            doc.addPage();
            y = 10;
        }
        doc.text(line, 10, y);
        y += 7;
    });

    return doc.output('blob');
}

export const generatePDFFromImage = async (imageFile: File): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });

    // Calculate dimensions based on aspect ratio, ensuring it fits on the page
    let pdfWidth = pageWidth;
    let pdfHeight = (img.height * pdfWidth) / img.width;

    if (pdfHeight > pageHeight) {
        pdfHeight = pageHeight;
        pdfWidth = (img.width * pdfHeight) / img.height;
    }

    // Center the image
    const x = (pageWidth - pdfWidth) / 2;
    const y = (pageHeight - pdfHeight) / 2;

    let format = 'JPEG';
    if (imageFile.type.includes('png')) format = 'PNG';
    else if (imageFile.type.includes('webp')) format = 'WEBP';

    doc.addImage(img, format, x, y, pdfWidth, pdfHeight);

    URL.revokeObjectURL(url);
    return doc.output('blob');
}

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

export const generateMergedPDFFromImages = async (imageFiles: File[]): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        if (i > 0) doc.addPage();

        const url = URL.createObjectURL(imageFile);
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });

        let pdfWidth = pageWidth;
        let pdfHeight = (img.height * pdfWidth) / img.width;

        if (pdfHeight > pageHeight) {
            pdfHeight = pageHeight;
            pdfWidth = (img.width * pdfHeight) / img.height;
        }

        const x = (pageWidth - pdfWidth) / 2;
        const y = (pageHeight - pdfHeight) / 2;

        let format = 'JPEG';
        if (imageFile.type.includes('png')) format = 'PNG';
        else if (imageFile.type.includes('webp')) format = 'WEBP';

        doc.addImage(img, format, x, y, pdfWidth, pdfHeight);
        URL.revokeObjectURL(url);
    }

    return doc.output('blob');
}

export const generateMergedPDF = async (fileStates: Array<{ file: File, result: any }>): Promise<Blob> => {
    const doc = new jsPDF();
    let isFirstPage = true;

    for (const fs of fileStates) {
        const { file, result } = fs;

        if (file.type.startsWith('image/')) {
            if (!isFirstPage) doc.addPage();

            const url = URL.createObjectURL(file);
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = (e) => {
                    console.error('Image load error:', e);
                    reject(new Error('Failed to load image'));
                };
                img.src = url;
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            let pdfWidth = pageWidth;
            let pdfHeight = (img.height * pdfWidth) / img.width;

            if (pdfHeight > pageHeight) {
                pdfHeight = pageHeight;
                pdfWidth = (img.width * pdfHeight) / img.height;
            }

            const x = (pageWidth - pdfWidth) / 2;
            const y = (pageHeight - pdfHeight) / 2;

            let format = 'JPEG';
            if (file.type.includes('png')) format = 'PNG';
            else if (file.type.includes('webp')) format = 'WEBP';

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL(`image/${file.type.split('/')[1]}`);
                doc.addImage(dataUrl, format, x, y, pdfWidth, pdfHeight);
            }

            URL.revokeObjectURL(url);
            isFirstPage = false;
        }
        else if (result?.text) {
            if (!isFirstPage) doc.addPage();

            const splitText = doc.splitTextToSize(result.text, 180);
            let y = 10;
            const pageHeight = doc.internal.pageSize.height;

            splitText.forEach((line: string) => {
                if (y > pageHeight - 10) {
                    doc.addPage();
                    y = 10;
                }
                doc.text(line, 10, y);
                y += 7;
            });
            isFirstPage = false;
        }
    }

    return doc.output('blob');
}

export const generateImageFromText = (text: string): Promise<Blob> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(new Blob());
            return;
        }

        const lines = text.split('\n');
        const fontSize = 16;
        const lineHeight = 20;
        const padding = 40;

        ctx.font = `${fontSize}px Arial`;
        let maxWidth = 400;
        lines.forEach((line: string) => {
            const metrics = ctx.measureText(line);
            if (metrics.width > maxWidth) maxWidth = metrics.width;
        });

        canvas.width = Math.min(maxWidth + padding * 2, 2000); // Reasonably max width
        canvas.height = lines.length * lineHeight + padding * 2;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'black';
        ctx.font = `${fontSize}px Arial`;
        lines.forEach((line: string, i: number) => {
            ctx.fillText(line, padding, padding + (i + 1) * lineHeight);
        });

        canvas.toBlob((blob) => {
            resolve(blob || new Blob());
        }, 'image/png');
    });
}

/**
 * Convert Excel file to PDF
 * Uses xlsx to parse and jspdf-autotable for table rendering
 */
export const generatePDFFromExcel = async (file: File): Promise<Blob> => {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);
    const doc = new jsPDF();

    let isFirstSheet = true;

    for (const sheetName of workbook.SheetNames) {
        if (!isFirstSheet) {
            doc.addPage();
        }
        isFirstSheet = false;

        const worksheet = workbook.Sheets[sheetName];
        let jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        // Filter out completely empty rows
        jsonData = jsonData.filter(row =>
            Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
        );

        if (jsonData.length === 0) continue;

        // Add sheet name as title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(sheetName, 14, 15);

        // Extract headers and body
        const headers = jsonData[0] || [];
        const body = jsonData.slice(1);

        // Use autoTable for nice table rendering
        autoTable(doc, {
            head: [headers.map(h => String(h || ''))],
            body: body.map(row =>
                Array.isArray(row)
                    ? row.map(cell => String(cell ?? ''))
                    : [String(row ?? '')]
            ),
            startY: 22,
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [220, 53, 69], // Brand red color
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250],
            },
            margin: { top: 22 },
        });
    }

    return doc.output('blob');
};

/**
 * Convert Word document to PDF
 * Uses mammoth to extract text/HTML and jsPDF for rendering
 */
export const generatePDFFromWord = async (file: File): Promise<Blob> => {
    const buffer = await file.arrayBuffer();

    // Extract raw text from DOCX using mammoth
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = result.value;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Split text into paragraphs
    const paragraphs = text.split(/\n\n+/);
    let y = margin;

    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;

        const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);

        for (const line of lines) {
            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += lineHeight;
        }

        // Add paragraph spacing
        y += 4;
    }

    return doc.output('blob');
};

/**
 * Convert PowerPoint to PDF
 * Uses JSZip to parse PPTX and extract slide content
 */
export const generatePDFFromPPT = async (file: File): Promise<Blob> => {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const doc = new jsPDF('landscape'); // PPT is usually landscape
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Find all slide XML files
    const slideFiles: string[] = [];
    zip.forEach((relativePath) => {
        if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
            slideFiles.push(relativePath);
        }
    });

    // Sort slides numerically
    slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
        return numA - numB;
    });

    let isFirstSlide = true;
    let slideNumber = 1;

    for (const slidePath of slideFiles) {
        if (!isFirstSlide) {
            doc.addPage('landscape');
        }
        isFirstSlide = false;

        const slideFile = zip.file(slidePath);
        if (!slideFile) continue;

        const slideXml = await slideFile.async('text');

        // Parse XML to extract text content
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideXml, 'text/xml');

        // Extract all text elements (a:t tags contain text in PPTX)
        const textElements = xmlDoc.getElementsByTagName('a:t');
        const texts: string[] = [];

        for (let i = 0; i < textElements.length; i++) {
            const text = textElements[i].textContent?.trim();
            if (text) texts.push(text);
        }

        // Draw slide background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Draw slide border
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

        // Add slide number
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Slide ${slideNumber}`, pageWidth - 25, pageHeight - 8);

        // Render text content
        doc.setTextColor(0, 0, 0);
        let y = 25;
        let isTitle = true;

        for (const text of texts) {
            if (isTitle) {
                // First text is usually the title
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                const titleLines = doc.splitTextToSize(text, pageWidth - 40);
                doc.text(titleLines, 20, y);
                y += titleLines.length * 12 + 15;
                isTitle = false;
            } else {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'normal');
                const contentLines = doc.splitTextToSize(text, pageWidth - 40);

                if (y + contentLines.length * 8 > pageHeight - 20) {
                    // Text overflow - just stop for this slide
                    break;
                }

                doc.text(contentLines, 20, y);
                y += contentLines.length * 8 + 5;
            }
        }

        slideNumber++;
    }

    return doc.output('blob');
};

/**
 * Generate merged PDF from multiple Excel files
 */
export const generateMergedPDFFromExcel = async (files: File[]): Promise<Blob> => {
    const doc = new jsPDF();
    let isFirstPage = true;

    for (const file of files) {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer);

        for (const sheetName of workbook.SheetNames) {
            if (!isFirstPage) {
                doc.addPage();
            }
            isFirstPage = false;

            const worksheet = workbook.Sheets[sheetName];
            let jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1 });

            // Filter out completely empty rows
            jsonData = jsonData.filter(row =>
                Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
            );

            if (jsonData.length === 0) continue;

            // Add file and sheet name as title
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${file.name} - ${sheetName}`, 14, 15);

            const headers = jsonData[0] || [];
            const body = jsonData.slice(1);

            autoTable(doc, {
                head: [headers.map(h => String(h || ''))],
                body: body.map(row =>
                    Array.isArray(row)
                        ? row.map(cell => String(cell ?? ''))
                        : [String(row ?? '')]
                ),
                startY: 22,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 249, 250] },
                margin: { top: 22 },
            });
        }
    }

    return doc.output('blob');
};

/**
 * Generate merged PDF from multiple Word files
 */
export const generateMergedPDFFromWord = async (files: File[]): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = pageWidth - margin * 2;
    let isFirstPage = true;

    for (const file of files) {
        if (!isFirstPage) {
            doc.addPage();
        }
        isFirstPage = false;

        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        const text = result.value;

        // Add file name as header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(file.name, margin, margin);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const paragraphs = text.split(/\n\n+/);
        let y = margin + 12;

        for (const paragraph of paragraphs) {
            if (!paragraph.trim()) continue;

            const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);

            for (const line of lines) {
                if (y + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += lineHeight;
            }
            y += 4;
        }
    }

    return doc.output('blob');
};

/**
 * Generate merged PDF from multiple PPT files
 */
export const generateMergedPDFFromPPT = async (files: File[]): Promise<Blob> => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let isFirstSlide = true;
    let slideNumber = 1;

    for (const file of files) {
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);

        const slideFiles: string[] = [];
        zip.forEach((relativePath) => {
            if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
                slideFiles.push(relativePath);
            }
        });

        slideFiles.sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
            const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
            return numA - numB;
        });

        for (const slidePath of slideFiles) {
            if (!isFirstSlide) {
                doc.addPage('landscape');
            }
            isFirstSlide = false;

            const slideFile = zip.file(slidePath);
            if (!slideFile) continue;

            const slideXml = await slideFile.async('text');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
            const textElements = xmlDoc.getElementsByTagName('a:t');
            const texts: string[] = [];

            for (let i = 0; i < textElements.length; i++) {
                const text = textElements[i].textContent?.trim();
                if (text) texts.push(text);
            }

            // Draw slide
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

            // File indicator
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(file.name, 10, pageHeight - 8);
            doc.text(`Slide ${slideNumber}`, pageWidth - 25, pageHeight - 8);

            doc.setTextColor(0, 0, 0);
            let y = 25;
            let isTitle = true;

            for (const text of texts) {
                if (isTitle) {
                    doc.setFontSize(24);
                    doc.setFont('helvetica', 'bold');
                    const titleLines = doc.splitTextToSize(text, pageWidth - 40);
                    doc.text(titleLines, 20, y);
                    y += titleLines.length * 12 + 15;
                    isTitle = false;
                } else {
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'normal');
                    const contentLines = doc.splitTextToSize(text, pageWidth - 40);
                    if (y + contentLines.length * 8 > pageHeight - 20) break;
                    doc.text(contentLines, 20, y);
                    y += contentLines.length * 8 + 5;
                }
            }

            slideNumber++;
        }
    }

    return doc.output('blob');
};

/**
 * Convert PDF to Images (PNG)
 * Uses pdfjs-dist to render each page to canvas
 */
export const generateImagesFromPDF = async (file: File): Promise<Blob[]> => {
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const images: Blob[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
        }).promise;

        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
        });

        images.push(blob);
    }

    return images;
};

/**
 * Convert Word document to Images
 * Converts to PDF first, then to images
 */
export const generateImagesFromWord = async (file: File): Promise<Blob[]> => {
    const pdfBlob = await generatePDFFromWord(file);
    const pdfFile = new File([pdfBlob], 'temp.pdf', { type: 'application/pdf' });
    return await generateImagesFromPDF(pdfFile);
};

/**
 * Convert Excel spreadsheet to Images
 * Converts to PDF first, then to images
 */
export const generateImagesFromExcel = async (file: File): Promise<Blob[]> => {
    const pdfBlob = await generatePDFFromExcel(file);
    const pdfFile = new File([pdfBlob], 'temp.pdf', { type: 'application/pdf' });
    return await generateImagesFromPDF(pdfFile);
};

/**
 * Convert PowerPoint to Images
 * Converts to PDF first, then to images
 */
export const generateImagesFromPPT = async (file: File): Promise<Blob[]> => {
    const pdfBlob = await generatePDFFromPPT(file);
    const pdfFile = new File([pdfBlob], 'temp.pdf', { type: 'application/pdf' });
    return await generateImagesFromPDF(pdfFile);
};
