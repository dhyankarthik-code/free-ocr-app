import GenericTool, { ToolConfig } from "@/components/tools/generic-tool"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Word to Excel Converter - Free Galaxy OCR',
    description: 'Convert Word documents (.docx) to Excel spreadsheets. Extract text content into rows. Free and secure.',
    alternates: {
        canonical: '/tools/word-to-excel',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Word to Excel Converter - Free Galaxy OCR',
        description: 'Convert Word documents to Excel instantly. Free online tool.',
    },
}

const config: ToolConfig = {
    id: 'word-to-excel',
    title: 'Word to Excel Converter',
    description: 'Convert text from Word documents into Excel rows. Useful for list conversion.',
    fromFormat: 'Word',
    toFormat: 'Excel',
    type: 'office-to-excel',
    accept: {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc']
    }
}

export default function Page() {
    return <GenericTool config={config} />
}
