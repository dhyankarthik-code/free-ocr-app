"use client"

import { useState, useEffect } from "react"

export default function BlogBanner() {

    return (
        <div className="mb-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-red-700 p-8 md:p-10 shadow-xl border border-white/10 group flex flex-col items-center justify-center text-center">
                {/* Glassmorphism/Decorative elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-black/5 rounded-full blur-2xl" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-4">
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight min-h-[3rem] md:min-h-[4rem] flex items-center justify-center whitespace-nowrap">
                        Welcome to AI Technologies and Tech Blog
                    </h2>

                    <div className="text-lg md:text-xl font-normal mt-2 text-white/90">
                        Shaping AI tools
                    </div>
                </div>
            </div>
        </div>
    )
}
