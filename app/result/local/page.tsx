"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, FileText, Search, ArrowLeft, Loader2, Upload } from "lucide-react"
import { saveAs } from "file-saver"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { useSession } from "@/hooks/use-session"
import AuthModal from "@/components/auth-modal"
import DocumentChat from "@/components/document-chat"
import Footer from "@/components/footer"

export default function LocalResultPage() {
    const router = useRouter()
    const { session, logout } = useSession()
    const [text, setText] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<Array<{ text: string, similarity: number }>>([])
    const [searching, setSearching] = useState(false)
    const [summary, setSummary] = useState("")
    const [generatingSummary, setGeneratingSummary] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [isMultiPage, setIsMultiPage] = useState(false)
    const [isBatch, setIsBatch] = useState(false)
    const [pages, setPages] = useState<Array<{ pageNumber: number, text: string, imageName?: string }>>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [fileName, setFileName] = useState<string>("document")
    const [reportFormatModal, setReportFormatModal] = useState(false)

    useEffect(() => {
        const storedData = sessionStorage.getItem("ocr_result")
        if (!storedData) {
            router.push("/")
            return
        }

        try {
            const parsed = JSON.parse(storedData)
            const baseName = parsed.fileName?.split('.').slice(0, -1).join('.') || "document"
            setFileName(baseName)

            if ((parsed.isPDF || parsed.isBatch) && parsed.pages) {
                setIsMultiPage(true)
                setIsBatch(parsed.isBatch === true)
                setPages(parsed.pages)
                setCurrentPage(1)
                setText(parsed.pages[0]?.text || "")
            } else if (parsed.text) {
                setText(parsed.text)
            } else if (typeof parsed === 'string') {
                setText(parsed)
            } else {
                setText(storedData)
            }
        } catch {
            setText(storedData)
        }
        setLoading(false)
    }, [router])

    // Debounced semantic search
    useEffect(() => {
        if (!searchTerm || searchTerm.trim().length < 3) {
            setSearchResults([])
            return
        }

        console.log('Triggering search for:', searchTerm)

        const timeoutId = setTimeout(async () => {
            setSearching(true)
            console.log('Calling semantic search API...')
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: searchTerm, text }),
                })

                console.log('API Response status:', response.status)

                if (response.ok) {
                    const data = await response.json()
                    console.log('Search results:', data)
                    setSearchResults(data.results || [])
                } else {
                    const errorData = await response.json()
                    console.error('Search API error:', errorData)
                    alert(`Search failed: ${errorData.error || 'Unknown error'}`)
                }
            } catch (error) {
                console.error('Search failed:', error)
                alert(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`)
            } finally {
                setSearching(false)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(timeoutId)
    }, [searchTerm, text])

    const handleDownloadTxt = () => {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
        saveAs(blob, `${fileName} ocr result.txt`)
    }

    const handleDownloadDocx = async () => {
        const doc = new Document({
            sections: [{
                properties: {},
                children: text.split("\n").map(line => new Paragraph({ children: [new TextRun(line)] })),
            }],
        })
        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${fileName} ocr result.docx`)
    }

    const handleDownloadPdf = async () => {
        const pdfDoc = await PDFDocument.create()
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        const pdfPage = pdfDoc.addPage()
        const { width, height } = pdfPage.getSize()
        const fontSize = 12
        const lines = text.split('\n')
        let y = height - 4 * fontSize
        let activePdfPage = pdfPage

        for (const line of lines) {
            if (y < 40) {
                activePdfPage = pdfDoc.addPage()
                y = height - 4 * fontSize
            }
            activePdfPage.drawText(line, { x: 50, y, size: fontSize, font: timesRomanFont, color: rgb(0, 0, 0) })
            y -= fontSize + 2
        }
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
        saveAs(blob, `${fileName} ocr result.pdf`)
    }

    const handleDownloadReport = async (format: 'txt' | 'docx' | 'pdf') => {
        if (format === 'txt') {
            const blob = new Blob([summary], { type: "text/plain;charset=utf-8" })
            saveAs(blob, `${fileName} AI Report.txt`)
        } else if (format === 'docx') {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: summary.split("\n").map(line => new Paragraph({ children: [new TextRun(line)] })),
                }],
            })
            const blob = await Packer.toBlob(doc)
            saveAs(blob, `${fileName} AI Report.docx`)
        } else if (format === 'pdf') {
            const pdfDoc = await PDFDocument.create()
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
            let page = pdfDoc.addPage()
            const { width, height } = page.getSize()
            const fontSize = 11
            const lineHeight = fontSize + 4
            let y = height - 50

            const lines = summary.split('\n')
            for (const line of lines) {
                if (y < 50) {
                    page = pdfDoc.addPage()
                    y = height - 50
                }

                const isBold = line.match(/^\*\*(.+?)\*\*:?/)
                const text = isBold ? isBold[1] : line.replace(/^[•\-]\s*/, '')
                const useFont = isBold ? boldFont : font
                const useFontSize = isBold ? fontSize + 2 : fontSize

                if (text.trim()) {
                    page.drawText(text, {
                        x: line.startsWith('-') || line.startsWith('•') ? 70 : 50,
                        y,
                        size: useFontSize,
                        font: useFont,
                        color: rgb(0, 0, 0)
                    })
                }
                y -= lineHeight
            }

            const pdfBytes = await pdfDoc.save()
            const blob = new Blob([pdfBytes as Uint8Array], { type: "application/pdf" })
            saveAs(blob, `${fileName} AI Report.pdf`)
        }
        setReportFormatModal(false)
    }

    const handleGenerateSummary = async () => {
        setGeneratingSummary(true)
        const start = Date.now()
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

            const response = await fetch("/api/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text.slice(0, 4000) }),
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to generate summary")
            const summaryValue = typeof data.summary === "string"
                ? data.summary
                : Array.isArray(data.summary)
                    ? data.summary.map((v: any) => (typeof v === "string" ? v : (v?.content ?? JSON.stringify(v)))).join("")
                    : (data?.summary?.content ?? JSON.stringify(data.summary))
            setSummary(summaryValue)
        } catch (error) {
            console.error("Summary generation failed", error)
            alert("Failed to generate summary. Please try again.")
        } finally {
            // Ensure at least 1s of loading state to avoid flicker
            const elapsed = Date.now() - start
            setTimeout(() => setGeneratingSummary(false), Math.max(0, 1000 - elapsed))
        }
    }

    const highlightedText = () => {
        // If no search or semantic results, show full text
        if (!searchTerm || (searchResults.length === 0 && !searching)) {
            return text
        }

        // If searching, show loading
        if (searching) {
            return text
        }

        // Highlight semantic search results
        if (searchResults.length > 0) {
            let highlightedContent = text

            // Highlight each result chunk
            searchResults.forEach((result, index) => {
                const escapedChunk = result.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                const regex = new RegExp(`(${escapedChunk})`, 'gi')
                highlightedContent = highlightedContent.replace(
                    regex,
                    `<mark class="bg-yellow-200 font-bold" data-similarity="${Math.round(result.similarity * 100)}%">$1</mark>`
                )
            })

            return <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
        }

        return text
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
            <Navbar
                session={session}
                onLogout={logout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        onClick={() => router.push("/")}
                        className="gap-2 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 hover:scale-[1.02]"
                    >
                        <Upload className="w-4 h-4" /> Upload More Files
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownloadTxt}>
                            <FileText className="w-4 h-4 mr-2" /> TXT
                        </Button>
                        <Button variant="outline" onClick={handleDownloadDocx}>
                            <FileText className="w-4 h-4 mr-2" /> Word
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPdf}>
                            <FileText className="w-4 h-4 mr-2" /> PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-col space-y-3 pb-4">
                                {/* Page Indicator for Multi-page Documents */}
                                {isMultiPage && (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md">
                                            <span className="text-lg font-bold">
                                                {isBatch
                                                    ? `🖼️ Image ${currentPage} of ${pages.length}: ${pages[currentPage - 1]?.imageName || ''}`
                                                    : `📄 Page ${currentPage} of ${pages.length}`
                                                }
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newPage = Math.max(1, currentPage - 1);
                                                    setCurrentPage(newPage);
                                                    setText(pages[newPage - 1]?.text || "");
                                                }}
                                                disabled={currentPage === 1}
                                                className="px-4"
                                            >
                                                ◀ Prev
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newPage = Math.min(pages.length, currentPage + 1);
                                                    setCurrentPage(newPage);
                                                    setText(pages[newPage - 1]?.text || "");
                                                }}
                                                disabled={currentPage === pages.length}
                                                className="px-4"
                                            >
                                                Next ▶
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between w-full">
                                    <CardTitle className="text-xl font-bold">
                                        {isMultiPage ? `Extracted Text - Page ${currentPage}` : 'Extracted Text'}
                                    </CardTitle>
                                    {!isMultiPage && (
                                        <div className="relative w-64">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Search in text..."
                                                className="pl-8"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="min-h-[500px] max-h-[700px] overflow-y-auto p-4 bg-gray-50 rounded-md border font-mono text-sm whitespace-pre-wrap">
                                    {highlightedText()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* AI Document Chat */}
                        <div className="h-[600px]">
                            <DocumentChat documentText={text} />
                        </div>
                    </div>
                </div>

                {/* Floating AI Report Button */}
                {!summary && (
                    <button
                        onClick={handleGenerateSummary}
                        disabled={generatingSummary}
                        className="fixed bottom-6 right-6 z-[1000] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generate AI Report"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-xl">✨</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="font-semibold text-sm">AI Report</span>
                            <span className="text-xs opacity-90">{generatingSummary ? "Generating..." : "Click to generate"}</span>
                        </div>
                    </button>
                )}

                {/* AI Report Modal */}
                {summary && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1001] p-4 backdrop-blur-sm" onClick={() => setSummary("")}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-purple-100 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xl">✨</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-purple-900">AI Report</h2>
                                    </div>
                                    <button
                                        onClick={() => setSummary("")}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="text-gray-700 leading-relaxed space-y-4">
                                    {summary.split('\n').map((line, index) => {
                                        const boldMatch = line.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);
                                        if (boldMatch) {
                                            return (
                                                <div key={index} className="mb-3">
                                                    <h4 className="font-bold text-gray-900 text-base mb-2">{boldMatch[1]}</h4>
                                                    {boldMatch[2] && <p className="text-gray-700 text-sm leading-relaxed">{boldMatch[2]}</p>}
                                                </div>
                                            );
                                        }
                                        if (line.trim().startsWith('-')) {
                                            return (
                                                <p key={index} className="pl-6 text-gray-700 text-sm leading-relaxed mb-2">
                                                    • {line.trim().substring(1).trim()}
                                                </p>
                                            );
                                        }
                                        if (line.trim()) {
                                            return <p key={index} className="text-gray-700 text-sm leading-relaxed mb-3">{line}</p>;
                                        }
                                        return <div key={index} className="h-2"></div>;
                                    })}
                                </div>
                                <div className="mt-8 flex flex-col gap-4">
                                    {!reportFormatModal ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setReportFormatModal(true)}
                                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-4 h-4" /> Download Report
                                            </button>
                                            <button
                                                onClick={handleGenerateSummary}
                                                disabled={generatingSummary}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                                            >
                                                {generatingSummary ? "Regenerating..." : "Regenerate"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 animate-in fade-in zoom-in-95 duration-200">
                                            <p className="text-sm font-bold text-purple-900 mb-3 text-center">Select Download Format</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button
                                                    onClick={() => handleDownloadReport('txt')}
                                                    className="bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                                >
                                                    <FileText className="w-3 h-3" /> Text File (.txt)
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReport('docx')}
                                                    className="bg-white hover:bg-purple-100 text-blue-700 border border-blue-200 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                                >
                                                    <FileText className="w-3 h-3" /> Word Doc (.docx)
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReport('pdf')}
                                                    className="bg-white hover:bg-purple-100 text-red-700 border border-red-200 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                                >
                                                    <FileText className="w-3 h-3" /> PDF File (.pdf)
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setReportFormatModal(false)}
                                                className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => setShowAuthModal(false)}
                />
            )}
        </div>
    )
}
