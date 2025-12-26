import GenericTool, { ToolConfig } from "@/components/tools/generic-tool"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PPT to Excel Converter - Free Galaxy OCR',
    description: 'Convert PowerPoint presentations (.pptx) to Excel spreadsheets. Extract text from slides into rows. Free online tool.',
    alternates: {
        canonical: '/tools/ppt-to-excel',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PPT to Excel Converter - Free Galaxy OCR',
        description: 'Convert PowerPoint slides to Excel instantly. Free online tool.',
    },
}

const config: ToolConfig = {
    id: 'ppt-to-excel',
    title: 'PPT to Excel Converter',
    description: 'Extract text content from PowerPoint slides into Excel rows.',
    fromFormat: 'PPT',
    toFormat: 'Excel',
    type: 'office-to-excel',
    accept: {
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'application/vnd.ms-powerpoint': ['.ppt']
    }
}

export default function Page() {
    return <GenericTool config={config} />
}
