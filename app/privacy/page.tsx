"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useSession } from "@/hooks/use-session"
import AuthModal from "@/components/auth-modal"
import { useState } from "react"

export default function PrivacyPage() {
    const { session, logout } = useSession()
    const [showAuthModal, setShowAuthModal] = useState(false)

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar
                session={session}
                onLogout={logout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <main className="flex-1 container mx-auto px-4 py-12 pt-24 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy & Disclaimer</h1>

                    <div className="prose prose-red max-w-none text-gray-700 space-y-8">
                        {/* Disclaimer Section */}
                        <section className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <h2 className="text-xl font-bold text-red-700 mt-0 flex items-center gap-2">
                                Disclaimer
                            </h2>
                            <p className="font-medium">
                                By using our "Free OCR Tool," you acknowledge and agree that:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>
                                    We do <strong>not</strong> permanently store your uploaded files. All files are automatically deleted from our servers immediately after processing is complete.
                                </li>
                                <li>
                                    While we strive for the highest accuracy ("world's most accurate"), OCR results depend on the quality of the input image. We do not guarantee 100% accuracy for every document.
                                </li>
                                <li>
                                    This tool is provided "as is" without any warranties, express or implied.
                                </li>
                            </ul>
                        </section>

                        {/* Privacy Policy */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                            <p className="text-gray-500 text-sm mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                            <h3 className="text-xl font-semibold text-gray-800 mt-6">1. Information We Collect</h3>
                            <p>We collect minimal information to provide our service:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Google Profile Data:</strong> Name, Email, and Profile Picture (for authentication).</li>
                                <li><strong>Usage Data:</strong> We track the number of processed files to manage system load.</li>
                                <li><strong>Technical Logs:</strong> IP address and browser type for security and analytical purposes.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mt-6">2. Cookies</h3>
                            <p>
                                We use essential cookies to maintain your login session. These cookies are rigorous and secure, ensuring your account remains safe. By using our site, you consent to these necessary cookies.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mt-6">3. Data Security</h3>
                            <p>
                                Security is our top priority. We use industry-standard encryption (SSL/TLS) for data transmission. Your uploaded documents are processed in a secure environment and are deleted instantly after extraction.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mt-6">4. Third-Party Services</h3>
                            <p>
                                We use Google for secure authentication. Please review Google's privacy policy for details on how they handle your data during login.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mt-6">5. Contact Us</h3>
                            <p>
                                If you have any questions about this policy, please contact us at <a href="mailto:admin@ocr-extraction.com" className="text-red-600 hover:text-red-700 font-medium">admin@ocr-extraction.com</a>.
                            </p>
                        </section>
                    </div>
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
