"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useSession } from "@/hooks/use-session"
import { useState } from "react"
import AuthModal from "@/components/auth-modal"

interface BlogLayoutProps {
    children: React.ReactNode
}

export default function BlogLayout({ children }: BlogLayoutProps) {
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
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Our Blog</h1>
                    <p className="text-lg text-gray-600">Latest updates, guides, and news from the Infy Galaxy team.</p>
                </div>

                {children}
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
