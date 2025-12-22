"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { useSession } from "@/hooks/use-session"
import ChatWidget from "@/components/chat-widget"

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [showAuthModal, setShowAuthModal] = useState(false)
    const { session, logout } = useSession()

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar
                session={session}
                onLogout={logout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            {children}

            <Footer />

            <ChatWidget />

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
