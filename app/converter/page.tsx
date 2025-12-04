"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "@/hooks/use-session"
import AuthModal from "@/components/auth-modal"
import { FileImage, FileText, File, FolderArchive } from "lucide-react"

export default function ConverterPage() {
    const { session, logout } = useSession()
    const [showAuthModal, setShowAuthModal] = useState(false)

    const converters = [
        { icon: FileImage, title: "Image to PDF", description: "Convert JPG, PNG, and other images to PDF format", fromFormats: ["JPG", "PNG", "WEBP", "GIF"], toFormat: "PDF", color: "text-red-600", bgColor: "bg-red-50" },
        { icon: FileText, title: "PDF to Images", description: "Extract images from PDF or convert PDF pages to images", fromFormats: ["PDF"], toFormat: "JPG/PNG", color: "text-blue-600", bgColor: "bg-blue-50" },
        { icon: FileImage, title: "Image Format Converter", description: "Convert between different image formats", fromFormats: ["JPG", "PNG", "WEBP", "BMP"], toFormat: "Any Format", color: "text-green-600", bgColor: "bg-green-50" },
        { icon: File, title: "OCR to Text", description: "Extract text from images and save as TXT or DOCX", fromFormats: ["JPG", "PNG", "PDF"], toFormat: "TXT/DOCX", color: "text-purple-600", bgColor: "bg-purple-50" },
        { icon: FolderArchive, title: "Batch Converter", description: "Convert multiple files at once", fromFormats: ["Multiple"], toFormat: "Various", color: "text-orange-600", bgColor: "bg-orange-50" }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar session={session} onLogout={logout} onLoginClick={() => setShowAuthModal(true)} />
            <main className="flex-1 container mx-auto px-4 py-12 pt-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Format Converter</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">Convert your files between different formats quickly and easily</p>
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-8 text-center shadow-md">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🚧</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Work in Progress</h3>
                            <p className="text-lg text-gray-700">All the below tools are work in progress, Will be launched soon</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto opacity-40 pointer-events-none">
                    {converters.map((converter, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg ${converter.bgColor} flex items-center justify-center mb-4`}>
                                    <converter.icon className={`w-6 h-6 ${converter.color}`} />
                                </div>
                                <CardTitle className="text-xl">{converter.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">{converter.description}</p>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-700">From:</span>
                                        <div className="flex gap-1 flex-wrap">
                                            {converter.fromFormats.map((format: string, idx: number) => (
                                                <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{format}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-700">To:</span>
                                        <span className="bg-blue-100 px-2 py-0.5 rounded text-xs font-medium">{converter.toFormat}</span>
                                    </div>
                                </div>
                                <Button className="w-full bg-red-500 hover:bg-red-600">Start Converting</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
            <Footer />
            {showAuthModal && (<AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => { setShowAuthModal(false); window.location.reload(); }} />)}
        </div>
    )
}
