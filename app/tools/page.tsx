"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "@/hooks/use-session"
import AuthModal from "@/components/auth-modal"
import { ImageIcon, Crop, Maximize, Palette, Eraser, Sparkles } from "lucide-react"

export default function ImageToolsPage() {
    const { session, logout } = useSession()
    const [showAuthModal, setShowAuthModal] = useState(false)

    const tools = [
        {
            icon: Crop,
            title: "Image Cropper",
            description: "Crop images to your desired dimensions with precision",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            icon: Maximize,
            title: "Image Resizer",
            description: "Resize images while maintaining quality",
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            icon: Palette,
            title: "Color Adjuster",
            description: "Adjust brightness, contrast, and saturation",
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            icon: Eraser,
            title: "Background Remover",
            description: "Remove backgrounds from images automatically",
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        {
            icon: Sparkles,
            title: "Image Enhancer",
            description: "Enhance image quality with AI",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50"
        },
        {
            icon: ImageIcon,
            title: "Format Converter",
            description: "Convert between different image formats",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar
                session={session}
                onLogout={logout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <main className="flex-1 container mx-auto px-4 py-12 pt-24">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Image Tools
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Professional image editing tools to enhance, modify, and optimize your images
                    </p>

                    {/* Work in Progress Banner */}
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-8 text-center shadow-md">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🚧</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Work in Progress</h3>
                            <p className="text-lg text-gray-700">
                                All the below tools are work in progress, Will be launched soon
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tools Grid - Grayed Out */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto opacity-40 pointer-events-none">
                    {tools.map((tool, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg ${tool.bgColor} flex items-center justify-center mb-4`}>
                                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                                </div>
                                <CardTitle className="text-xl">{tool.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">{tool.description}</p>
                                <Button className="w-full bg-red-500 hover:bg-red-600">
                                    Use Tool
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

            <Footer />

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => {
                        setShowAuthModal(false)
                        window.location.reload()
                    }}
                />
            )}
        </div>
    )
}
