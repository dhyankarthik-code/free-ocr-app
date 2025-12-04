"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, FileText, Search, ArrowLeft, Loader2 } from "lucide-react"
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

    useEffect(() => {
        const storedText = sessionStorage.getItem("ocr_result")
        if (!storedText) {
            router.push("/")
            return
        }
        setText(storedText)
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
        saveAs(blob, "ocr-result.txt")
    }

    const handleDownloadDocx = async () => {
        const doc = new Document({
            sections: [{
                properties: {},
                children: text.split("\n").map(line => new Paragraph({ children: [new TextRun(line)] })),
            }],
        })
        const blob = await Packer.toBlob(doc)
        saveAs(blob, "ocr-result.docx")
    }

    const handleDownloadPdf = async () => {
        const pdfDoc = await PDFDocument.create()
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        const pages = pdfDoc.addPage()
        const { width, height } = pages.getSize()
        const fontSize = 12
        const lines = text.split('\n')
        let y = height - 4 * fontSize
        let currentPage = pages

        for (const line of lines) {
            if (y < 40) {
                currentPage = pdfDoc.addPage()
                y = height - 4 * fontSize
            }
            currentPage.drawText(line, { x: 50, y, size: fontSize, font: timesRomanFont, color: rgb(0, 0, 0) })
            y -= fontSize + 2
        }
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
        saveAs(blob, "ocr-result.pdf")
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
            {/* Top Left Branding */}
            <div className="fixed top-4 left-4 z-50">
                <Link href="/" className="text-lg font-bold text-red-500 hover:text-red-600 transition-colors">
                    Infy Galaxy
                </Link>
            </div>

            {/* Floating Logout Button - Only show when logged in */}
            {session && (
                <button
                    onClick={logout}
                    className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                    title="Logout"
                >
                    <span className="font-medium">Logout</span>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            )}

            <Navbar
                session={session}
                onLogout={logout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Upload
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
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">Extracted Text</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search in text..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
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

                        <Card className="border-purple-100">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg">✨</span>
                                    </div>
                                    <CardTitle className="text-purple-900">AI Summary</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {!summary ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-3xl">🤖</span>
                                        </div>
                                        <p className="text-gray-600 mb-4 font-medium">Get an AI-powered summary</p>
                                        <p className="text-sm text-gray-500 mb-6">Instantly understand the key points of your document</p>
                                        <InteractiveHoverButton
                                            onClick={handleGenerateSummary}
                                            disabled={generatingSummary}
                                            text={generatingSummary ? "Generating..." : "Generate Summary"}
                                            className="w-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-white text-sm">📝</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-gray-700 leading-relaxed text-sm space-y-3">
                                                    {summary.split('\n').map((line, index) => {
                                                        // Check if line starts with **text:**
                                                        const boldMatch = line.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);
                                                        if (boldMatch) {
                                                            return (
                                                                <div key={index} className="mb-2">
                                                                    <h4 className="font-bold text-gray-900 mb-1">{boldMatch[1]}</h4>
                                                                    {boldMatch[2] && <p className="text-gray-700">{boldMatch[2]}</p>}
                                                                </div>
                                                            );
                                                        }
                                                        // Check if line starts with - (bullet point)
                                                        if (line.trim().startsWith('-')) {
                                                            return (
                                                                <p key={index} className="pl-4 text-gray-700">
                                                                    • {line.trim().substring(1).trim()}
                                                                </p>
                                                            );
                                                        }
                                                        // Regular paragraph
                                                        if (line.trim()) {
                                                            return <p key={index} className="text-gray-700">{line}</p>;
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <InteractiveHoverButton
                                            onClick={handleGenerateSummary}
                                            text={generatingSummary ? "Regenerating..." : "Regenerate Summary"}
                                            className="w-full mt-4"
                                            disabled={generatingSummary}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
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
