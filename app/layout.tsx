import type React from "react"
import type { Metadata, Viewport } from "next"
import { GoogleAnalytics } from '@next/third-parties/google'
import { Geist } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import ClientConsentWrapper from "@/components/client-consent-wrapper"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Most Accurate OCR to Text | Convert Image to Text | Free OCR Image Conversion",
    template: "%s | Most Accurate OCR to Text"
  },
  description: "Use the most accurate AI-powered OCR to convert images to text instantly. Free online OCR image conversion with high accuracy for text extraction, reports, summaries, and document processing.",
  keywords: ["OCR", "accurate OCR", "OCR to text", "image to text", "OCR image conversion", "free OCR", "online OCR", "convert image to text", "OCR image to text", "AI OCR", "best OCR", "OCR converter", "OCR image converter", "OCR to PDF", "OCR to Excel", "OCR report", "OCR summary"],
  authors: [{ name: "Infy Galaxy" }],
  creator: "Infy Galaxy",
  publisher: "Infy Galaxy",
  metadataBase: new URL('https://www.ocr-extraction.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Most Accurate OCR to Text | Convert Image to Text",
    description: "Free and highly accurate AI OCR for converting images to text, PDF, and Excel. Fast, secure, and easy online OCR conversion.",
    type: 'website',
    url: 'https://www.ocr-extraction.com/',
    images: [
      {
        url: 'https://www.ocr-extraction.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Most Accurate OCR to Text',
      }
    ],
    siteName: 'Most Accurate OCR to Text',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Most Accurate OCR to Text",
    description: "Convert images to text using the most accurate AI-powered OCR online. Fast and free OCR image conversion.",
    images: ['https://www.ocr-extraction.com/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
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
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-K9SH3TBW');
            `,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K9SH3TBW"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
      </body>
    </html>
  )
}
