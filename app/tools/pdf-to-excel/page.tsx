import GenericTool, { ToolConfig } from "@/components/tools/generic-tool"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PDF to Excel Converter - Free Galaxy OCR',
    description: 'Convert PDF files to editable Excel spreadsheets. Extract text and data into rows. Client-side processing for privacy.',
    alternates: {
        canonical: '/tools/pdf-to-excel',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF to Excel Converter - Free Galaxy OCR',
        description: 'Convert PDF files to Excel instantly. Free online tool.',
    },
}

const config: ToolConfig = {
    id: 'pdf-to-excel',
    title: 'PDF to Excel Converter',
    description: 'Convert text content from PDF files into Excel rows. Perfect for extracting lists and data.',
    fromFormat: 'PDF',
    toFormat: 'Excel',
    type: 'office-to-excel',
    accept: {
        'application/pdf': ['.pdf']
    }
}

export default function Page() {
    return <GenericTool config={config} />
}
