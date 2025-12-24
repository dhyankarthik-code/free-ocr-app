"use client"

import { useRouter, usePathname } from "next/navigation"

interface CtaSectionProps {
    title?: string
    description?: string
    subDescription?: string
}

export default function CtaSection({
    title = "Try It Now",
    description = "Upload your file, click convert, and experience the most accurate OCR tool available online in 2025.",
    subDescription = "Your data stays secure, your results stay precise, and your workflow becomes effortless."
}: CtaSectionProps) {
    const router = useRouter()
    const pathname = usePathname()

    const handleCtaClick = () => {
        if (pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" })
        } else {
            router.push("/")
        }
    }

    return (
        <section className="w-full max-w-3xl mb-12 px-4 text-center mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {title}
            </h3>
            {description && (
                <p className="text-gray-600 mb-6">
                    {description}
                </p>
            )}
            {subDescription && (
                <p className="text-gray-500 text-sm">
                    {subDescription}
                </p>
            )}
            <button
                onClick={handleCtaClick}
                className="mt-6 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Your File
            </button>
        </section>
    )
}
