"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/hooks/use-session"
import AuthModal from "@/components/auth-modal"
import { BookOpen, Video, FileText, HelpCircle, Lightbulb, Code } from "lucide-react"
import Link from "next/link"

export default function ResourcesPage() {
    const { session, logout } = useSession()
    const [showAuthModal, setShowAuthModal] = useState(false)

    const resources = [
        {
            category: "Tutorials", icon: Video, color: "text-red-600", bgColor: "bg-red-50", items: [
                { title: "Getting Started with OCR", link: "#" },
                { title: "How to Extract Text from Images", link: "#" },
                { title: "Batch Processing Guide", link: "#" },
                { title: "Advanced OCR Techniques", link: "#" }
            ]
        },
        {
            category: "Documentation", icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50", items: [
                { title: "API Documentation", link: "#" },
                { title: "Supported File Formats", link: "#" },
                { title: "Feature Overview", link: "#" },
                { title: "Integration Guide", link: "#" }
            ]
        },
        {
            category: "Guides & Tips", icon: Lightbulb, color: "text-yellow-600", bgColor: "bg-yellow-50", items: [
                { title: "Best Practices for OCR", link: "#" },
                { title: "Image Quality Tips", link: "#" },
                { title: "Accuracy Improvement", link: "#" },
                { title: "Troubleshooting Common Issues", link: "#" }
            ]
        },
        {
            category: "FAQs", icon: HelpCircle, color: "text-green-600", bgColor: "bg-green-50", items: [
                { title: "How accurate is the OCR?", link: "#" },
                { title: "What languages are supported?", link: "#" },
                { title: "Is my data secure?", link: "#" },
                { title: "Can I process PDFs?", link: "#" }
            ]
        },
        {
            category: "Blog Posts", icon: BookOpen, color: "text-purple-600", bgColor: "bg-purple-50", items: [
                { title: "The Future of OCR Technology", link: "#" },
                { title: "AI in Document Processing", link: "#" },
                { title: "Use Cases for OCR", link: "#" },
                { title: "Industry Applications", link: "#" }
            ]
        },
        {
            category: "Developer Resources", icon: Code, color: "text-indigo-600", bgColor: "bg-indigo-50", items: [
                { title: "REST API Reference", link: "#" },
                { title: "Code Examples", link: "#" },
                { title: "SDKs and Libraries", link: "#" },
                { title: "Webhooks Guide", link: "#" }
            ]
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar session={session} onLogout={logout} onLoginClick={() => setShowAuthModal(true)} />
            <main className="flex-1 container mx-auto px-4 py-12 pt-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Resources</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to get the most out of Infy Galaxy – OCR</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {resources.map((resource, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg ${resource.bgColor} flex items-center justify-center mb-4`}>
                                    <resource.icon className={`w-6 h-6 ${resource.color}`} />
                                </div>
                                <CardTitle className="text-xl">{resource.category}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {resource.items.map((item, idx) => (
                                        <li key={idx}>
                                            <Link href={item.link} className="text-sm text-gray-600 hover:text-red-500 transition-colors flex items-center gap-2 group">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full group-hover:bg-red-500 transition-colors"></span>
                                                {item.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="mt-16 max-w-4xl mx-auto">
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-2xl font-bold mb-3">Need More Help?</h2>
                            <p className="text-gray-600 mb-6">Can't find what you're looking for? Our support team is here to help!</p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Link href="/contact" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">Contact Us</Link>
                                <Link href="/contact" className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium border-2 border-gray-200 transition-colors">Join Community</Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
            {showAuthModal && (<AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => { setShowAuthModal(false); window.location.reload(); }} />)}
        </div>
    )
}
