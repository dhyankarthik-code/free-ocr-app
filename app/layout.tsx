import type React from "react"
import type { Metadata, Viewport } from "next"
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Geist } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import ClientConsentWrapper from "@/components/client-consent-wrapper"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Free OCR to Text | Convert Image to Text & Excel | 100% Accurate",
    template: "%s | Free OCR Extraction"
  },
  description: "Best Free OCR tool to convert images, PDFs, and screenshots to editable text or Excel. Supports handwriting recognition, batch processing, and multi-language extraction. No sign-up needed.",
  keywords: [
    "free ocr",
    "image to text",
    "pdf to text",
    "online ocr",
    "ai ocr",
    "extract text from image",
    "ocr to excel",
    "handwriting recognition",
    "batch image to text",
    "scanned document to text",
    "convert screenshot to text",
    "text scanner online"
  ],
  authors: [{ name: "Infy Galaxy Team" }],
  creator: "Infy Galaxy",
  publisher: "Infy Galaxy",
  metadataBase: new URL('https://www.ocr-extraction.com'),
  alternates: {
    canonical: './', // Self-referencing canonical
  },
  openGraph: {
    title: "Free OCR to Text | Convert Image/PDF to Text & Excel",
    description: "Convert images to text, PDF, and Excel for free. No limits, 100% accurate AI extraction (Mistral/VLM). Try the best OCR tool online today.",
    type: 'website',
    url: 'https://www.ocr-extraction.com/',
    images: [
      {
        url: 'https://www.ocr-extraction.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Free OCR Extraction Tool Interface',
      }
    ],
    siteName: 'Free OCR Extraction',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Best Free OCR: Image to Text Converter",
    description: "Extract text from generic images, screenshots, and PDFs instantly. 100% Free & Accurate.",
    images: ['https://www.ocr-extraction.com/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} font-sans antialiased bg-white text-gray-900`}>
        {children}
        <ClientConsentWrapper />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-230FBSCTMJ" />
        <GoogleTagManager gtmId="GTM-K9SH3TBW" />
      </body>
    </html>
  )
}
