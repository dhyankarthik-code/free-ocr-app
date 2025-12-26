import GenericTool, { ToolConfig } from "@/components/tools/generic-tool"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Word to PDF Converter - Free Galaxy OCR',
    description: 'Convert Word documents (.docx, .doc) to PDF format. Free online tool with client-side processing for privacy.',
    alternates: {
        canonical: '/tools/word-to-pdf',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Word to PDF Converter - Free Galaxy OCR',
        description: 'Convert Word documents to PDF format. Free online tool.',
    },
}

const config: ToolConfig = {
    id: 'word-to-pdf',
    title: 'Word to PDF Converter',
    description: 'Convert Word documents (.docx, .doc) to clean, professional PDF files.',
    fromFormat: 'Word',
    toFormat: 'PDF',
    type: 'office-to-pdf',
    accept: {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc']
    }
}

export default function Page() {
    return <GenericTool config={config} />
}
