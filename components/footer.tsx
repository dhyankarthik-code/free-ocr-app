"use client"

import Link from "next/link"
import { Heart, FileText, Wrench, BookOpen, Info, Mail } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-white">Infy Galaxy</span>
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                            Free OCR Extraction and Report Generation Tool
                        </p>
                        <p className="text-xs text-gray-500">
                            The Necessary Tool For OCR Data Extraction – Go Beyond Extraction and Generate Reports, AI Summary, and Download in Various Formats
                        </p>
                    </div>

                    {/* OCR & Tools */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            OCR & Tools
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about-ocr" className="hover:text-red-500 transition-colors">
                                    About OCR
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-red-500 transition-colors">
                                    Blog
                                </Link>
                            </li>

                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Company
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/mission" className="hover:text-red-500 transition-colors">
                                    Our Mission
                                </Link>
                            </li>
                            <li>
                                <Link href="/company-profile" className="hover:text-red-500 transition-colors">
                                    Company Profile
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-red-500 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faqs" className="hover:text-red-500 transition-colors">
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support / Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Support
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="hover:text-red-500 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-red-500 transition-colors">
                                    Terms and Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-red-500 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Infy Galaxy. All rights reserved.
                    </p>
                    {/* Privacy Policy and Terms of Service removed */}
                </div>
            </div>
        </footer>
    )
}
