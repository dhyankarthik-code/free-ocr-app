import GenericTool, { ToolConfig } from "@/components/tools/generic-tool"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Image to Excel Converter - Free Galaxy OCR',
    description: 'Convert Images to Excel spreadsheets using OCR. Extract text from photos/scans into Excel rows. Free online tool.',
    alternates: {
        canonical: '/tools/image-to-excel',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Image to Excel Converter - Free Galaxy OCR',
        description: 'Convert Images to Excel instantly using OCR. Free online tool.',
    },
}

const config: ToolConfig = {
    id: 'image-to-excel',
    title: 'Image to Excel Converter',
    description: 'Extract text from images using OCR and save as Excel. Supports PNG, JPG, WEBP.',
    fromFormat: 'Image',
    toFormat: 'Excel',
    type: 'ocr', // Uses the standard OCR pipeline
    accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp']
    }
}

export default function Page() {
    return <GenericTool config={config} />
}
