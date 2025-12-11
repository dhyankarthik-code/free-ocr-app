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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy & Terms</h1>

                    <div className="prose prose-red max-w-none text-gray-700 space-y-8">

                        {/* Limitation of Liability Section - Highlighted */}
                        <section className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <h2 className="text-xl font-bold text-red-700 mt-0">Limitation of Liability</h2>
                            <p>
                                The online tool is provided on an “as-is” and “as-available” basis. To the maximum extent permitted by applicable law, we make no warranties or representations, express or implied, regarding the accuracy, reliability, performance, or suitability of the tool or any output it generates.
                            </p>
                            <p className="font-semibold mb-2">We do not accept any liability for:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>errors, omissions, or inaccuracies in the tool’s output;</li>
                                <li>loss of data, revenue, profits, or business opportunities or any other damage;</li>
                                <li>any direct, indirect, incidental, consequential, or special damages arising from the use of, or inability to use, the tool;</li>
                                <li>actions taken based on the information, insights, or results produced by the tool.</li>
                            </ul>
                            <p className="mt-4 font-semibold">
                                Your use of the tool is entirely at your own discretion, and you are responsible for independently verifying any information or output before relying on it for decision-making or for any use.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy Policy</h3>
                            <p>
                                The visitors/users/subscribers using the ocr-extraction.com service is subject to your consent to the Terms of Use and this Privacy Policy.
                                This Privacy Policy becomes effective upon your first use of the service. You acknowledge that you have read and understood the terms of this Privacy Policy and agree to be bound thereby. If you disagree with this Privacy Policy, do not use the ocr-extraction.com or any materials and resources available on this service.
                            </p>

                            <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">1. Information We Collect</h4>

                            <h5 className="font-semibold text-gray-700 mt-4">Personal data</h5>
                            <p>
                                When you register with ocr-extraction.com you will be asked to provide your login name, e-mail ID and password. Your password will be stored in encrypted form not readable by members of staff. If you forget your password, you can use the" forgot password feature" and you will be emailed a new one which you can then change at your discretion. We are not liable for any kind of password breach.
                            </p>
                            <p>
                                The email address collected will be used to send a sign up confirmation message and any requested new passwords or mail items relating to use of ocr-extraction.com.
                                We will not sell or market the email addresses of registered Users to third parties.
                            </p>
                            <p>
                                We will not view the files that you upload using the ocr-extraction.com service. We may view your file`s information (file extensions, sizes etc. but not your file contents) to provide technical support. We are not liable for any kind of content that you upload and download.
                            </p>

                            <h5 className="font-semibold text-gray-700 mt-4">Cookies</h5>
                            <p>
                                ocr-extraction.com uses a feature of your browser called a cookie to store your member ID and state information about where you are in the site, ocr-extraction.com uses cookies to keep track of where you are in the site since the Internet is a stateless environment. ocr-extraction.com does not store any of your personal information in cookies. A cookie is simply a small data file that the web site writes to your hard drive. A cookie can't read any other data off your hard drive, pass on a virus, or read cookie files created by other sites. You can refuse cookies by turning them off in your browser. ocr-extraction.com will not operate properly without cookies enabled.
                            </p>

                            <h5 className="font-semibold text-gray-700 mt-4">Technical Information</h5>
                            <p>The technical details logged are confined to the following types of information:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>The Internet Protocol address or gateway of the visitor's web server</li>
                                <li>The previous website address from which the visitor reached us</li>
                                <li>Clickstream data which shows the traffic of visitors around this web site (for example pages accessed and documents downloaded)</li>
                                <li>The type of web browser used by the visitor</li>
                                <li>The operating system of the visitor's computer</li>
                                <li>The screen resolution of the visitor's computer monitor</li>
                                <li>Information on potential security risks, URLs of websites visited that we deem potentially fraudulent and executable files that are identified as potential malware</li>
                                <li>Metadata regarding uploaded files such as file size, file name, file format, and other relevant parameters</li>
                            </ul>

                            <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">2. Collection of Information</h4>
                            <p>
                                You have a right to be given a copy of any personal data which you may have supplied to ocr-extraction.com in connection with any service. You also have the right to opt out of all our data collection initiatives. To exercise either of these rights, please contact us through the methods described above. If you are contacting us by mail, you should include any personal identifiers which you supplied earlier (e.g. name, address, phone number, e-mail address). Your request will be dealt with as soon as possible and will take not more than 40 days to process. You also have a right to have any inaccurate information corrected. If you discover that PDF Pro does hold inaccurate information about you, you have a right to instruct us to correct that information. Such instruction must be in writing or via our ticketing system. Your request will be dealt with as soon as possible and will take not more than 40 days to process. We will retain your information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. In certain circumstances you may also request that data which you have supplied to us be deleted. To exercise this right you would generally be expected to identify some contravention of data protection law in the manner in which we processes the data concerned. Please note that we may from time to time delete data which it holds about you or other persons where we consider it appropriate to do so.
                            </p>

                            <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">3. Location of the Servers of the Portal</h4>
                            <p>
                                Your information may be stored and processed in any country in which ocr-extraction.com maintain facilities. In this regard, or for purposes of sharing or disclosing, ocr-extraction.com reserves the right to transfer information outside of your country. By using the resources, you consent to any such transfer of information outside of your country for the purpose of enabling you to use the resources. ocr-extraction.com, alone, has the right and sole discretion to determine the location of the servers of the Portal and resources.
                            </p>

                            <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">4. Changes to the privacy policy</h4>
                            <p>
                                This Privacy Statement may be modified from time to time. Any change, update or modification we make will be effective immediately upon posting or not posting on our site. Continued access of our sites by you will constitute your acceptance of any changes or revisions to the Privacy Statement.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Generated Output Disclaimer</h3>
                            <p>
                                The tool uses artificial intelligence and machine-learning models to generate responses, predictions, or recommendations. Since AI is still evolving, the AI-generated output may be inaccurate, incomplete, outdated, or contextually inappropriate, and we absolve ourselves from any liability in any situation or scenario or any case. Users are responsible for independently validating all AI-generated information before relying on it.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Disclaimer</h3>
                            <p>
                                This site and the materials and products in this site are provided "as is" and without warranties of any kind, whether express or implied. To the fullest extent permissible pursuant to applicable law, ocr-extraction.com disclaims all warranties, express or implied, including, but not limited to, implied warranties of merchantability and fitness for a particular purpose and non-infringement. ocr-extraction.com does not represent or warrant that the functions contained in the site will be uninterrupted or error-free, that defects will be corrected, or that this site or the server that makes the site available are free of viruses or other harmful components. ocr-extraction.com does not make any warranties or representations regarding the use of the materials in this site in terms of their correctness, accuracy, adequacy, usefulness, timeliness, reliability or otherwise. The above limitations may not apply to you.
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
