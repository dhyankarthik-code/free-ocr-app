import GenericTool, { ToolConfig } from "@/components/tools/generic-tool"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Excel to PDF Converter - Free Galaxy OCR',
    description: 'Convert Excel spreadsheets (.xlsx, .xls) to PDF documents. Free online tool with client-side processing for privacy.',
    alternates: {
        canonical: '/tools/excel-to-pdf',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Excel to PDF Converter - Free Galaxy OCR',
        description: 'Convert Excel spreadsheets to PDF documents. Free online tool.',
    },
}

const config: ToolConfig = {
    id: 'excel-to-pdf',
    title: 'Excel to PDF Converter',
    description: 'Convert Excel spreadsheets (.xlsx, .xls) to beautifully formatted PDF documents.',
    fromFormat: 'Excel',
    toFormat: 'PDF',
    type: 'office-to-pdf',
    accept: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls']
    }
}

export default function Page() {
    return <GenericTool config={config} />
}
