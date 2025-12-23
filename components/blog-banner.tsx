"use client"

import { useState, useEffect } from "react"
import TextType from "@/components/text-type"
import ShinyText from "@/components/ui/shiny-text"

export default function BlogBanner() {
    const [showTagline, setShowTagline] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTagline(true)
        }, 2300)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="mb-16">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-red-700 p-12 md:p-16 shadow-2xl border border-white/10 group flex flex-col items-center justify-center text-center">
                {/* Glassmorphism/Decorative elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-black/5 rounded-full blur-2xl" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold uppercase tracking-wider border border-white/20 mb-4">
                        AI-Powered Tool
                    </span>

                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight min-h-[3rem] md:min-h-[4.5rem] flex items-center justify-center whitespace-nowrap">
                        <TextType
                            text={["Welcome to AI technologies blog"]}
                            typingSpeed={50}
                            showCursor={true}
                            cursorCharacter="|"
                            loop={false}
                            className="inline-block"
                        />
                    </h2>

                    <div className={`text-xl md:text-2xl font-bold mt-4 transition-opacity duration-1000 ${showTagline ? 'opacity-100' : 'opacity-0'}`}>
                        <ShinyText
                            text="Shaping AI tools"
                            disabled={false}
                            speed={3}
                            className="font-medium tracking-wide scale-110 md:scale-125 origin-center"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
