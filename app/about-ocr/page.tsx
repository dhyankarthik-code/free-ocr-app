"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useSession } from "@/hooks/use-session"
import { useState } from "react"
import AuthModal from "@/components/auth-modal"

export default function AboutOCRPage() {
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
                <article className="prose prose-lg max-w-none bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">About OCR</h1>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">What is Infy Galaxy OCR - Absolutely Free</h2>
                        <h3 className="text-xl font-semibold text-gray-800">Infy Galaxy OCR – Free Version: Smart, Fast & Accurate AI-Powered Text Extraction</h3>
                        <p className="text-gray-700">
                            Infy Galaxy OCR – Free Version is a very powerful, free online OCR (Optical Character Recognition) solution / tool designed to extract text from images with exceptional accuracy. This tool's speciality is that it has the ability to extract data even from blurred or difficult images. Built on advanced AI and Vision Large Language Model (VLM) technology, it effortlessly converts scanned documents, photos, screenshots, PDFs, and handwritten notes into editable, reportable, and searchable text with the feature where the extracted content can be downloaded in the format required by the user such as Word or PDF or Text. Artificial Intelligence based summary is also available and other value addition where reports can be generated from the extracted data or text.
                        </p>
                        <p className="text-gray-700">
                            The system supports major international languages and a wide range of file formats such as PNG, WebP, JPEG, JPG, PDF, TIFF, and other formats as well making it a versatile choice for students, professionals, researchers, fiance executives, sales executives, doctors, and any businesses. Infy Galaxy OCR intelligently preserves the original formatting—including line breaks, spacing, and structure—ensuring clean, ready-to-use output every time.
                        </p>
                        <p className="text-gray-700">
                            With ultra-fast processing, cloud-based performance, and industry-leading accuracy, Infy Galaxy OCR – Free Version gives users a simple and reliable way to digitize content without installing any software. Whether you're digitizing documents, extracting text for translations, or converting images into editable content, Infy Galaxy OCR provides unmatched quality at zero cost.
                        </p>
                    </div>

                    <div className="mt-12 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Ease of Use:</h2>
                        <p className="text-gray-700">
                            Anyone who has a basic internet can use our service from any part of the world, people from all walks of life can use our service whether it is students, researchers, housewives, financial executives, sales executives, or any one who wants to get their data from their image.
                        </p>
                    </div>

                    <div className="mt-12 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900">How to Use Infy Galaxy OCR - Absolutely Free (Step-by-Step Guide)</h2>
                        <p className="text-gray-700">
                            Infy Galaxy OCR is designed for greater accuracy or near precise text extraction. Whether you're converting scanned documents, photos, PDFs, handwritten notes or from any image, the process takes only a few seconds. Follow this simple guide to get high-accuracy OCR results instantly.
                        </p>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">1. Upload Your Image File</h3>
                                <p className="text-gray-700">Start by uploading the file you want to convert. You can either:</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                                    <li>Click the upload dropzone, or</li>
                                    <li>Drag and drop your image directly into the box</li>
                                </ul>
                                <p className="mt-3 text-sm text-gray-600">
                                    Infy Galaxy OCR supports multiple formats including JPG, PNG, JPEG, BMP, TIFF, PDF, and more, ensuring maximum flexibility for different types of documents and images.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">2. Click "Extract Text" Or Use Summarize or Search Content or "Generate Report"</h3>
                                <p className="text-gray-700">
                                    After the upload, hit the Extract Text button. Our advanced Vision Large Language Model (VLM) instantly analyzes your file, recognizes characters with exceptional precision, and converts the content into editable text. The processing takes only a few seconds even for complex layouts or multilingual information.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">3. Copy or Download Your OCR Output</h3>
                                <p className="text-gray-700">Once the text extraction is complete, your results will be displayed on the screen. You can:</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                                    <li>Copy the extracted text to your clipboard, or</li>
                                    <li>Download the text as a .txt file or other formats for offline use.</li>
                                </ul>
                                <p className="mt-3 text-sm text-gray-600">
                                    Once the converted file is downloaded, you can share it through apps, documents, emails or use the extracted information for research and for any other purpose.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">The Engine Behind the Accuracy</h2>
                        <p className="text-gray-700">
                            At its core, Infy Galaxy OCR utilizes a multi-layered approach to Optical Character Recognition. Unlike traditional tools that rely solely on pattern matching, our platform integrates <strong>Vision Large Language Models (VLMs)</strong>. This means the system doesn't just "see" shapes; it "understands" the context of the document.
                        </p>
                        <p className="text-gray-700">
                            By leveraging advanced AI models and tailored deep-learning algorithms, we achieve high accuracy even on challenging inputs like low-resolution scans, handwritten notes, and skewed images. This semantic understanding allows the tool to correct common OCR errors based on the surrounding sentence structure.
                        </p>
                    </div>

                    <div className="mt-12 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Step-by-Step Processing Pipeline</h2>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">1. Intelligent Pre-processing</h3>
                                <p className="text-gray-700">
                                    Before recognition begins, your image undergoes optimization:
                                </p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700 text-sm">
                                    <li><strong>Binarization:</strong> Isolating text from noisy backgrounds for clean recognition.</li>
                                    <li><strong>Contrast Normalization:</strong> Adjusting lighting imbalances common in mobile photos.</li>
                                    <li><strong>Skew Correction:</strong> Automatically straightening documents scanned at an angle.</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">2. Text Detection & Segmentation</h3>
                                <p className="text-gray-700">
                                    The AI identifies "Regions of Interest" (ROI), distinguishing between headers, paragraphs, and tables. This spatial awareness ensures that the layout is preserved when you export results.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">3. Contextual Recognition</h3>
                                <p className="text-gray-700">
                                    The core engine extracts characters while the LLM layer reviews the output. This dual-pass system allows the system to probabilistically correct characters based on the surrounding words—the reason why our handwriting recognition is so effective.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Data Safety & Privacy Architecture</h2>
                        <p className="text-gray-700">
                            We operate on a <strong>"Strictly Ephemeral"</strong> data policy to ensure your documents remain private:
                        </p>
                        <ul className="list-disc pl-6 space-y-3 text-gray-700">
                            <li><strong>Encryption:</strong> All uploads are encrypted via SSL/TLS (HTTPS) during transit.</li>
                            <li><strong>Memory-Only Processing:</strong> Files are processed in secure, isolated memory containers.</li>
                            <li><strong>Instant Deletion:</strong> Once text is extracted, the original file and the extracted data are permanently erased. We do not store, index, or learn from your private documents.</li>
                        </ul>
                    </div>

                    <div className="mt-12 bg-red-50 p-8 rounded-2xl border border-red-100 text-center">
                        <h2 className="text-2xl font-bold text-red-900 mb-4">Start Your First Extraction</h2>
                        <p className="text-red-800 mb-6">
                            Experience the power of AI-driven OCR with Infy Galaxy. Fast, secure, and completely free.
                        </p>
                        <a href="/" className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200">
                            Go to OCR Tool
                        </a>
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
