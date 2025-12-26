import GenericTool, { ToolConfig } from "@/components/tools/generic-tool"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PPT to PDF Converter - Free Galaxy OCR',
    description: 'Convert PowerPoint presentations (.pptx, .ppt) to PDF format. Free online tool with client-side processing for privacy.',
    alternates: {
        canonical: '/tools/ppt-to-pdf',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PPT to PDF Converter - Free Galaxy OCR',
        description: 'Convert PowerPoint presentations to PDF format. Free online tool.',
    },
}

const config: ToolConfig = {
    id: 'ppt-to-pdf',
    title: 'PPT to PDF Converter',
    description: 'Convert PowerPoint presentations (.pptx, .ppt) to PDF documents.',
    fromFormat: 'PPT',
    toFormat: 'PDF',
    type: 'office-to-pdf',
    accept: {
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'application/vnd.ms-powerpoint': ['.ppt']
    }
}

export default function Page() {
    return <GenericTool config={config} />
}
