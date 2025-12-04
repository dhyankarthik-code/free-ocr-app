"use client"

import { useState, useRef } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSession } from "@/hooks/use-session"
import AuthModal from "@/components/auth-modal"
import ReCAPTCHA from "react-google-recaptcha"
import { Loader2, CheckCircle2, Mail, User, Globe, Phone, MessageSquare } from "lucide-react"

export default function ContactPage() {
    const { session, logout } = useSession()
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        country: "",
        mobile: "",
        message: ""
    })
    const [captchaVerified, setCaptchaVerified] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const recaptchaRef = useRef<ReCAPTCHA>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleCaptchaChange = (value: string | null) => {
        setCaptchaVerified(!!value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!captchaVerified) {
            alert("Please verify you're not a robot")
            return
        }

        setSubmitting(true)

        try {
            // Submit to Google Sheets via API route
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error("Failed to submit form")
            }

            setSubmitted(true)
            setFormData({
                name: "",
                email: "",
                country: "",
                mobile: "",
                message: ""
            })
            setCaptchaVerified(false)
            recaptchaRef.current?.reset()
        } catch (error) {
            console.error("Contact form error:", error)
            alert("Failed to submit form. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

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
                        Contact Us
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have a question or need support? We're here to help!
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    {submitted ? (
                        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                            <CardContent className="p-12 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                                <p className="text-lg text-gray-700 mb-6">
                                    Your message has been submitted successfully. We'll get back to you soon!
                                </p>
                                <Button
                                    onClick={() => setSubmitted(false)}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    Send Another Message
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Get in Touch</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Name *
                                        </label>
                                        <Input
                                            name="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email *
                                        </label>
                                        <Input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            Country *
                                        </label>
                                        <Input
                                            name="country"
                                            type="text"
                                            required
                                            value={formData.country}
                                            onChange={handleChange}
                                            placeholder="Enter your country"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Mobile */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Mobile *
                                        </label>
                                        <Input
                                            name="mobile"
                                            type="tel"
                                            required
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="+1 234 567 8900"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Message *
                                        </label>
                                        <Textarea
                                            name="message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="How can we help you?"
                                            className="w-full min-h-[120px]"
                                        />
                                    </div>

                                    {/* reCAPTCHA */}
                                    <div className="flex justify-center">
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                                            onChange={handleCaptchaChange}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={!captchaVerified || submitting}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-lg font-semibold disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
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
