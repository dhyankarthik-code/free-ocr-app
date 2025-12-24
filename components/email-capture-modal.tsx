"use client"

import { useState } from "react"
import { X, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EmailCaptureModalProps {
    onSubmit: (email: string) => void
    onClose: () => void
}

export default function EmailCaptureModal({ onSubmit, onClose }: EmailCaptureModalProps) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
        return emailRegex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email.trim()) {
            setError("Please enter your email address")
            return
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address")
            return
        }

        setLoading(true)

        try {
            // Call visitor API to store the data
            const response = await fetch('/api/visitor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            if (!response.ok) {
                throw new Error('Failed to save visitor data')
            }

            // Store email in localStorage
            localStorage.setItem('visitor_email', email)

            onSubmit(email)
        } catch (err) {
            console.error('Email capture error:', err)
            // Still proceed even if API fails (graceful degradation)
            localStorage.setItem('visitor_email', email)
            onSubmit(email)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Enter Your Email</h2>
                    <p className="text-gray-600 mt-2">
                        Please provide your email to use our free OCR tool
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full text-lg py-3 ${error ? 'border-red-500' : ''}`}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-lg font-semibold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Continue to OCR Tool"
                        )}
                    </Button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                    By continuing, you agree to our Privacy Policy
                </p>
            </div>
        </div>
    )
}
