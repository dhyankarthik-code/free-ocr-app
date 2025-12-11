import type React from "react"
import type { Metadata, Viewport } from "next"
import { GoogleAnalytics } from '@next/third-parties/google'
import { Geist } from "next/font/google"
import "./globals.css"
import ClientConsentWrapper from "@/components/client-consent-wrapper"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Infy Galaxy – Free OCR Tool | AI-Powered Text Extraction & Report Generation",
    template: "%s | Infy Galaxy OCR"
  },
  description: "Free AI-Powered OCR Tool for instant text extraction from images and PDFs. Generate reports, AI summaries, and download in multiple formats. Fast, accurate, and secure document digitization.",
  keywords: ["OCR", "text extraction", "free OCR tool", "PDF to text", "image to text", "AI OCR", "document digitization", "OCR online", "free text recognition", "Infy Galaxy"],
  authors: [{ name: "Infy Galaxy" }],
  creator: "Infy Galaxy",
  publisher: "Infy Galaxy",
  metadataBase: new URL('https://www.ocr-extraction.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.ocr-extraction.com',
    title: 'Infy Galaxy – Free OCR Tool | AI-Powered Text Extraction',
    description: 'Extract text from images and PDFs instantly with our free AI-powered OCR tool. Generate reports and download in various formats.',
    siteName: 'Infy Galaxy OCR',
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
        <GoogleAnalytics gaId="G-230FBSCTMJ" />
      </body>
    </html>
  )
}
