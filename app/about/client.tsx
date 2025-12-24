"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useSession } from "@/hooks/use-session"
import { useState } from "react"
import AuthModal from "@/components/auth-modal"
import CtaSection from "@/components/cta-section"


export default function AboutPage() {
    const { session, logout } = useSession()
    const [showAuthModal, setShowAuthModal] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
            <Navbar
                session={session}
                onLogout={logout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <CtaSection />
                <article className="prose prose-lg max-w-none bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">About Us</h1>

                    <div className="space-y-6 text-gray-700">
                        <p className="lead text-xl">
                            Infy Galaxy is a global technology company specializing in advanced AI solutions, OCR technology, and intelligent automation tools designed to help people across all walks of life to work smarter and faster. Our mission is to make powerful and user-friendly artificial intelligence tools and solutions which are accessible to all walks of life by transforming complex digital tasks into simple, accurate, and efficient workflows.
                        </p>

                        <p>
                            We are best known for our high-accuracy AI OCR platforms powered by cutting-edge Vision Large Language Models (VLMs). These tools enable users to extract text from images, PDFs, scanned documents, and handwritten notes with exceptional precision or accuracy. By combining machine learning, deep learning, cloud computing, and user-focused design, Infy Galaxy delivers fast, reliable, and secure digital productivity solutions for individuals, professionals, startups, MSME, and enterprises across all business domains and verticals.
                        </p>

                        <p>
                            At Infy Galaxy, innovation drives everything we build. Our team of engineers, AI researchers, AI workflow analysts, AI orchestrators, and product designers/engineers work together to develop next-generation tools and solutions that improve document processing, automate repetitive tasks, and enhance overall productivity. We are dedicated and committed to provide the best user experiences, power-packed performance, and scalability ensuring our technology adapts to the growing needs of a global audience. We don't compromise on quality at any stage of our processes.
                        </p>

                        <p>
                            We are committed to transparency, data security, and continuous improvement. As AI evolves, Infy Galaxy continues to push boundaries by delivering smarter, faster, and more intuitive digital solutions and tools that make everyday work easier.
                        </p>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mt-8">
                            <p className="text-blue-900 font-semibold mb-0">
                                Infy Galaxy is now part of the AI revolution and AI future and with Infy Galaxy, it is now easy for you to enter into the world of AI as we handhold our customers to achieve their expectations with far more importance given to accuracy and quality.
                            </p>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
    )
}
