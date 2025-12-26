"use client"

import { useState, useEffect } from 'react'
import { Upload, FileText, ArrowRight, Download, CheckCircle, AlertCircle, Loader2, Archive, FileStack } from 'lucide-react'
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import UploadZone from "@/components/upload-zone"
import { toast } from "sonner"
import {
    generateWord,
    generateExcel,
    generatePPT,
    generatePDF,
    generatePDFFromImage,
    generateMergedPDF,
    downloadBlob,
    generateMergedWord,
    generateMergedExcel,
    generateMergedPPT,
    generateImageFromText,
    generatePDFFromExcel,
    generatePDFFromWord,
    generatePDFFromPPT,
    generateMergedPDFFromExcel,
    generateMergedPDFFromWord,
    generateMergedPDFFromPPT,
    generateImagesFromPDF,
    generateImagesFromWord,
    generateImagesFromExcel,
    generateImagesFromPPT,
    generateExcelFromPDF,
    generateExcelFromWord,
    generateExcelFromPPT
} from "@/lib/client-generator"
import JSZip from 'jszip'

export type ToolType =
    | 'ocr' // Use main OCR API
    | 'client-convert' // Use client-side logic
    | 'office-to-pdf' // Direct Office file to PDF conversion
    | 'office-to-image' // Convert document to images (one per page)
    | 'office-to-excel' // Convert document to Excel
    | 'coming-soon'

export interface ToolConfig {
    id: string
    title: string
    description: string
    fromFormat: string
    toFormat: string
    accept: Record<string, string[]>
    type: ToolType
    apiEndpoint?: string
}

export default function GenericTool({ config }: { config: ToolConfig }) {
    // State for multiple files
    const [files, setFiles] = useState<File[]>([])

    type FileState = {
        file: File
        id: string
        status: 'idle' | 'processing' | 'success' | 'error'
        progress: number
        result: any | null // { text: string } or { image: true }
        error: string | null
        previewUrl: string | null
    }

    const [fileStates, setFileStates] = useState<FileState[]>([])

    // Sync preview URLs clean up
    useEffect(() => {
        return () => {
            fileStates.forEach(fs => {
                if (fs.previewUrl) URL.revokeObjectURL(fs.previewUrl)
            })
        }
    }, []) // Cleanup on unmount, or we could track diffs if needed but unmount is safer for now

    const handleDrop = async (droppedFiles: File[]) => {
        if (droppedFiles.length === 0) return

        // Initialize states for new files
        const newStates: FileState[] = droppedFiles.map(f => ({
            file: f,
            id: Math.random().toString(36).substring(7),
            status: 'idle',
            progress: 0,
            result: null,
            error: null,
            previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null
        }))

        setFiles(prev => [...prev, ...droppedFiles])
        setFileStates(prev => [...prev, ...newStates])

        // Process each new file
        newStates.forEach(state => processFileItem(state))
    }

    const updateFileState = (id: string, updates: Partial<FileState>) => {
        setFileStates(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
    }

    // Validate file type based on expected format
    const validateFileType = (file: File, expectedFormat: string): boolean => {
        const type = file.type.toLowerCase()
        const name = file.name.toLowerCase()

        switch (expectedFormat) {
            case 'Image':
                return type.startsWith('image/')
            case 'PDF':
                return type === 'application/pdf' || name.endsWith('.pdf')
            case 'Text':
                return type.startsWith('text/') || name.endsWith('.txt')
            case 'Word':
                return type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')
            case 'Excel':
                return type.includes('sheet') || type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')
            case 'PPT':
                return type.includes('presentation') || type.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')
            default:
                return true // Allow if format not recognized
        }
    }

    const processFileItem = async (fileState: FileState) => {
        const { file, id } = fileState
        updateFileState(id, { status: 'processing', progress: 10 })

        try {
            // Validate file type based on expected input format
            const isValidType = validateFileType(file, config.fromFormat)
            if (!isValidType) {
                updateFileState(id, {
                    status: 'error',
                    progress: 100,
                    error: `Invalid file type. Expected ${config.fromFormat} file.`
                })
                toast.error(`${file.name}: Invalid file type`)
                return
            }

            if (config.type === 'ocr') {
                const formData = new FormData()
                formData.append('file', file)

                const interval = setInterval(() => {
                    setFileStates(current => {
                        return current.map(s => {
                            if (s.id === id && s.progress < 80) return { ...s, progress: s.progress + 5 }
                            return s
                        })
                    })
                }, 500)

                const response = await fetch('/api/ocr', {
                    method: 'POST',
                    body: formData
                })

                clearInterval(interval)

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error || 'Conversion failed')
                }

                const data = await response.json()
                let extractedText = ""
                if (data.pages) {
                    extractedText = data.pages.map((p: any) => p.text).join('\n\n')
                } else if (data.text) {
                    extractedText = data.text
                }

                updateFileState(id, { status: 'success', progress: 100, result: { text: extractedText } })
                toast.success(`${file.name} processed!`)

            } else if (config.type === 'client-convert') {
                if (file.type.startsWith('image/')) {
                    updateFileState(id, { status: 'success', progress: 100, result: { image: true } })
                } else {
                    const text = await file.text()
                    updateFileState(id, { status: 'success', progress: 100, result: { text } })
                }
                toast.success(`${file.name} ready!`)
            } else if (config.type === 'office-to-pdf') {
                // Direct Office file to PDF conversion
                updateFileState(id, { progress: 50 })

                let pdfBlob: Blob
                if (config.fromFormat === 'Excel') {
                    pdfBlob = await generatePDFFromExcel(file)
                } else if (config.fromFormat === 'Word') {
                    pdfBlob = await generatePDFFromWord(file)
                } else if (config.fromFormat === 'PPT') {
                    pdfBlob = await generatePDFFromPPT(file)
                } else {
                    throw new Error(`Unsupported format: ${config.fromFormat}`)
                }

                updateFileState(id, { status: 'success', progress: 100, result: { pdfBlob, officeFile: true } })
                toast.success(`${file.name} converted!`)
            } else if (config.type === 'office-to-image') {
                // Document to Image conversion
                updateFileState(id, { progress: 50 })

                let images: Blob[]
                if (config.fromFormat === 'PDF') {
                    images = await generateImagesFromPDF(file)
                } else if (config.fromFormat === 'Word') {
                    images = await generateImagesFromWord(file)
                } else if (config.fromFormat === 'Excel') {
                    images = await generateImagesFromExcel(file)
                } else if (config.fromFormat === 'PPT') {
                    images = await generateImagesFromPPT(file)
                } else {
                    throw new Error(`Unsupported format: ${config.fromFormat}`)
                }

                updateFileState(id, { status: 'success', progress: 100, result: { images } })
                toast.success(`${file.name} converted!`)
            } else if (config.type === 'office-to-excel') {
                // Document to Excel conversion
                updateFileState(id, { progress: 50 })

                let excelBlob: Blob
                if (config.fromFormat === 'PDF') {
                    excelBlob = await generateExcelFromPDF(file)
                } else if (config.fromFormat === 'Word') {
                    excelBlob = await generateExcelFromWord(file)
                } else if (config.fromFormat === 'PPT') {
                    excelBlob = await generateExcelFromPPT(file)
                } else {
                    throw new Error(`Unsupported format: ${config.fromFormat}`)
                }

                updateFileState(id, { status: 'success', progress: 100, result: { excelBlob, officeFile: true } })
                toast.success(`${file.name} converted!`)
            } else {
                updateFileState(id, { status: 'error', progress: 100, error: "This feature is coming soon" })
            }

        } catch (err: any) {
            console.error(err)
            updateFileState(id, { status: 'error', error: err.message })
            toast.error(`Failed to process ${file.name}`)
        }
    }

    const handleDownload = async (fileState: FileState) => {
        if (!fileState.result) return

        try {
            const { file, result } = fileState
            let blob: Blob | null = null
            const filename = file.name.split('.')[0] + `_converted.${config.toFormat.toLowerCase()}`


            // Handle office-to-pdf conversion result
            if (result.officeFile && result.pdfBlob) {
                downloadBlob(result.pdfBlob, filename)
                return
            }

            // Handle office-to-excel conversion result
            if (result.officeFile && result.excelBlob) {
                downloadBlob(result.excelBlob, filename.replace('pdf', 'xlsx').replace('docx', 'xlsx').replace('pptx', 'xlsx'))
                return
            }

            // Handle office-to-image conversion result
            if (result.images && Array.isArray(result.images)) {
                if (result.images.length === 1) {
                    downloadBlob(result.images[0], filename.replace('pdf', 'png').replace('docx', 'png').replace('xlsx', 'png').replace('pptx', 'png'))
                } else {
                    const zip = new JSZip()
                    result.images.forEach((blob: Blob, index: number) => {
                        zip.file(`page_${index + 1}.png`, blob)
                    })
                    const content = await zip.generateAsync({ type: "blob" })
                    downloadBlob(content, `${file.name.split('.')[0]}_images.zip`)
                }
                return
            }

            if (result.image && config.toFormat === 'PDF') {
                blob = await generatePDFFromImage(file)
                downloadBlob(blob, filename.replace('image', 'pdf'))
                return
            }

            if (!result.text) {
                return
            }

            switch (config.toFormat) {
                case 'Word':
                    blob = await generateWord(result.text)
                    await downloadBlob(blob, filename.replace('word', 'docx'))
                    break
                case 'Excel':
                    blob = generateExcel(result.text)
                    downloadBlob(blob, filename.replace('excel', 'xlsx'))
                    break
                case 'PPT':
                    blob = await generatePPT(result.text)
                    downloadBlob(blob, filename.replace('ppt', 'pptx'))
                    break
                case 'PDF':
                    blob = generatePDF(result.text)
                    downloadBlob(blob, filename.replace('pdf', 'pdf'))
                    break
                case 'Text':
                    blob = new Blob([result.text], { type: 'text/plain' })
                    downloadBlob(blob, filename.replace('text', 'txt'))
                    break
                case 'Image':
                    blob = await generateImageFromText(result.text)
                    downloadBlob(blob, filename.replace('image', 'png'))
                    break
            }

        } catch (e: any) {
            console.error(e)
            toast.error("Failed to generate file")
        }
    }

    const handleDownloadAll = async () => {
        const successfulFiles = fileStates.filter(fs => fs.status === 'success' && fs.result)
        if (successfulFiles.length === 0) return

        try {
            // Office-to-PDF merged mode - use specialized merge functions
            if (config.type === 'office-to-pdf' && config.toFormat === 'PDF') {
                const files = successfulFiles.map(fs => fs.file)
                let blob: Blob

                if (config.fromFormat === 'Excel') {
                    blob = await generateMergedPDFFromExcel(files)
                } else if (config.fromFormat === 'Word') {
                    blob = await generateMergedPDFFromWord(files)
                } else if (config.fromFormat === 'PPT') {
                    blob = await generateMergedPDFFromPPT(files)
                } else {
                    throw new Error(`Unsupported format: ${config.fromFormat}`)
                }

                downloadBlob(blob, `${config.title.toLowerCase().replace(/\s+/g, '_')}_merged.pdf`)
                toast.success("Merged PDF Downloaded!")
                return
            }

            // Office-to-Image merged mode (ZIP)
            if (config.type === 'office-to-image') {
                const zip = new JSZip()

                successfulFiles.forEach((fs) => {
                    const filenameBase = fs.file.name.split('.')[0]
                    if (Array.isArray(fs.result.images)) {
                        fs.result.images.forEach((blob: Blob, index: number) => {
                            zip.file(`${filenameBase}_page_${index + 1}.png`, blob)
                        })
                    }
                })

                const content = await zip.generateAsync({ type: "blob" })
                downloadBlob(content, `${config.title.toLowerCase().replace(/\s+/g, '_')}_images.zip`)
                toast.success("All Images Downloaded!")
                return
            }

            // Merged PDF Mode - for image/text to PDF outputs
            if (config.toFormat === 'PDF') {
                const blob = await generateMergedPDF(successfulFiles)
                downloadBlob(blob, `${config.title.toLowerCase().replace(/\s+/g, '_')}_merged.pdf`)
                toast.success("Merged PDF Downloaded!")
                return
            }

            // Merged Word Mode
            if (config.toFormat === 'Word') {
                const blob = await generateMergedWord(successfulFiles)
                downloadBlob(blob, `${config.title.toLowerCase().replace(/\s+/g, '_')}_merged.docx`)
                toast.success("Merged Word Document Downloaded!")
                return
            }

            // Merged Excel Mode
            if (config.toFormat === 'Excel') {
                const blob = generateMergedExcel(successfulFiles)
                downloadBlob(blob, `${config.title.toLowerCase().replace(/\s+/g, '_')}_merged.xlsx`)
                toast.success("Merged Excel Spreadsheet Downloaded!")
                return
            }

            // Merged PPT Mode
            if (config.toFormat === 'PPT') {
                const blob = await generateMergedPPT(successfulFiles)
                downloadBlob(blob, `${config.title.toLowerCase().replace(/\s+/g, '_')}_merged.pptx`)
                toast.success("Merged Presentation Downloaded!")
                return
            }

            // Merged Text Mode
            if (config.toFormat === 'Text') {
                const mergedText = successfulFiles.map(fs => `--- ${fs.file.name} ---\n\n${fs.result.text}`).join('\n\n\n')
                const blob = new Blob([mergedText], { type: 'text/plain' })
                downloadBlob(blob, `${config.title.toLowerCase().replace(/\s+/g, '_')}_merged.txt`)
                toast.success("Merged Text File Downloaded!")
                return
            }

            // Standard ZIP Mode for non-document outputs (e.g. Image output)
            const zip = new JSZip()
            let count = 0

            for (const fs of successfulFiles) {
                const { file, result } = fs
                const filename = file.name.split('.')[0] + `_converted.${config.toFormat.toLowerCase()}`
                let blob: Blob | null = null

                if (result.text) {
                    switch (config.toFormat) {
                        case 'Image': blob = await generateImageFromText(result.text); break;
                    }
                }

                if (blob) {
                    zip.file(filename, blob)
                    count++
                }
            }

            if (count > 0) {
                const content = await zip.generateAsync({ type: "blob" })
                downloadBlob(content, `${config.title.toLowerCase().replace(/\s+/g, '_')}_batch.zip`)
                toast.success("Batch download started!")
            } else {
                toast.error("No valid files to zip.")
            }

        } catch (e) {
            console.error(e)
            toast.error("Failed to create download")
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 pb-2">
                    {config.title}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {config.description}
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10">
                <UploadZone
                    onDrop={handleDrop}
                    uploading={false}
                    progress={0}
                    accept={config.accept}
                />

                {/* File List */}
                {fileStates.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                            <h3 className="font-bold text-gray-900">Your Files ({fileStates.length})</h3>
                            <div className="flex gap-2">
                                {fileStates.some(fs => fs.status === 'success') && (
                                    <button
                                        onClick={handleDownloadAll}
                                        className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold flex items-center gap-2 transition-all hover:scale-[1.05] shadow-md shadow-red-500/20"
                                    >
                                        {config.toFormat === 'PDF' ? (
                                            <>
                                                <FileStack className="w-4 h-4" /> Download Merged PDF
                                            </>
                                        ) : config.toFormat === 'Image' ? (
                                            <>
                                                <Archive className="w-4 h-4" /> Download All (ZIP)
                                            </>
                                        ) : (
                                            <>
                                                <FileStack className="w-4 h-4" /> Download Merged {config.toFormat}
                                            </>
                                        )}
                                    </button>
                                )}
                                <button onClick={() => { setFiles([]); setFileStates([]); }} className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors">Clear All</button>
                            </div>
                        </div>

                        {fileStates.map((fs) => (
                            <div key={fs.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                {/* Header / Status */}
                                <div className="p-4 bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                            {fs.previewUrl ? (
                                                <img src={fs.previewUrl} className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{fs.file.name}</p>
                                            <p className="text-xs text-gray-500">{(fs.file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2">
                                        {fs.status === 'processing' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                                        {fs.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                        {fs.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {fs.status === 'processing' && (
                                    <div className="h-1 w-full bg-gray-100">
                                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${fs.progress}%` }}></div>
                                    </div>
                                )}

                                {/* Content / Actions */}
                                {fs.status === 'success' && (
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        {/* Text Preview Snippet */}
                                        {fs.result?.text && (
                                            <div className="mb-2 p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 max-h-24 overflow-hidden relative">
                                                {fs.result.text.slice(0, 300)}...
                                                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent"></div>
                                            </div>
                                        )}

                                        {/* Individual download button only for Image output, others are merged */}
                                        {config.toFormat === 'Image' ? (
                                            <button
                                                onClick={() => handleDownload(fs)}
                                                className="w-full py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download {config.toFormat}
                                            </button>
                                        ) : (
                                            <div className="text-center text-xs text-gray-400 italic">
                                                Will be included in the merged document
                                            </div>
                                        )}
                                    </div>
                                )}

                                {fs.status === 'error' && (
                                    <div className="p-4 bg-red-50 text-red-600 text-sm">
                                        {fs.error || "Unknown error occurred"}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-8 text-center bg-gray-50 p-8 rounded-2xl">
                <h2 className="sr-only">Key Features</h2>
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-900">Fast Extraction</h3>
                    <p className="text-sm text-gray-600">Powered by advanced AI for quick and accurate results.</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-900">Secure Processing</h3>
                    <p className="text-sm text-gray-600">All files are processed securely and deleted automatically.</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-900">High Quality</h3>
                    <p className="text-sm text-gray-600">Maintains formatting and structure of your documents.</p>
                </div>
            </div>
        </div>
    )
}
