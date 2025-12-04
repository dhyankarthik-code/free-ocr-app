"use client"

import { useState, useCallback } from "react"
import Navbar from "@/components/navbar"
import UploadZone from "@/components/upload-zone"
import AuthModal from "@/components/auth-modal"
import Footer from "@/components/footer"
import { useSession } from "@/hooks/use-session"

export default function Home() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [processingSteps, setProcessingSteps] = useState<string[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { session, logout } = useSession()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit")
        return
      }

      setUploading(true)
      setProgress(0)
      setProcessingSteps(["Starting upload..."])

      try {
        // 1. Preprocess image (Client-side)
        setProcessingSteps(prev => [...prev, "Optimizing image quality (Grayscale, Contrast)..."])
        setStatus("Optimizing image for better accuracy...")

        // Small delay to let user see the step
        await new Promise(r => setTimeout(r, 800))

        const { quickPreprocess } = await import('@/lib/image-preprocessing')
        const preprocessedBlob = await quickPreprocess(file)

        // Create form data with the preprocessed image
        const formData = new FormData()
        // Append with original filename but potentially different type/content
        formData.append('file', preprocessedBlob, file.name)

        console.log('Sending optimized image to OCR API...')
        setProcessingSteps(prev => [...prev, "Sending to AI OCR engine..."])
        setStatus("Processing with AI...")

        // Call our OCR API endpoint
        setProgress(30)
        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        })

        console.log('API Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API Error:', errorData)
          throw new Error(errorData.error || `OCR API failed: ${response.statusText}`)
        }

        setProcessingSteps(prev => [...prev, "Extracting text from response..."])
        const data = await response.json()
        console.log('OCR Response:', data)

        const text = String(data?.text || "")
        console.log('Extracted text length:', text.length)

        if (!text || text.trim().length === 0) {
          throw new Error('No text extracted from image')
        }

        setProcessingSteps(prev => [...prev, "Finalizing results..."])
        setProgress(100)
        sessionStorage.setItem("ocr_result", text)

        // Small delay before redirect
        await new Promise(r => setTimeout(r, 500))

        console.log('Redirecting to results page...')
        window.location.href = "/result/local"

      } catch (error) {
        console.error("OCR Error:", error)
        alert(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setUploading(false)
        setProgress(0)
        setProcessingSteps([])
      }
    },
    [session],
  )

  return (
    <div className="min-h-screen bg-white flex flex-col pt-16">
      <Navbar
        session={session}
        onLogout={logout}
        onLoginClick={() => setShowAuthModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-center text-balance">Infy Galaxy – OCR</h1>

          <p className="text-base md:text-lg text-gray-600 text-center mb-2 text-balance font-semibold">
            Free OCR Extraction and Report Generation Tool
          </p>
          <p className="text-sm md:text-base text-gray-500 text-center mb-8 text-balance">
            The Necessary Tool For OCR Data Extraction – Go Beyond Extraction and Generate Reports, AI Summary, and Download in Various Formats
          </p>

          <UploadZone
            onDrop={onDrop}
            uploading={uploading}
            progress={progress}
            processingSteps={processingSteps}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false)
            // Trigger new upload attempt
          }}
        />
      )}
    </div>
  )
}
