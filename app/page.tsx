"use client"

import { useState, useCallback } from "react"
import Navbar from "@/components/navbar"
import UploadZone from "@/components/upload-zone"
import AuthModal from "@/components/auth-modal"
import Footer from "@/components/footer"
import { useSession } from "@/hooks/use-session"
import TextType from "@/components/text-type"
import ChatWidget from "@/components/chat-widget"

export default function Home() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [processingSteps, setProcessingSteps] = useState<string[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const { session, logout } = useSession()

  const handleUpload = async (file: File) => {
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
        // Prefer 'details' to show the specific underlying error (e.g. from Mistral), fall back to 'error'
        const specificError = errorData.details || errorData.error || `OCR API failed: ${response.statusText}`
        throw new Error(specificError)
      }

      setProcessingSteps(prev => [...prev, "Extracting text from response..."])
      const data = await response.json()
      console.log('OCR Response:', data)

      // Handle PDF multi-page response
      if (data.isPDF && data.pages) {
        console.log(`PDF processed: ${data.totalPages} pages`)
        setProcessingSteps(prev => [...prev, "Finalizing PDF results..."])
        setProgress(100)
        sessionStorage.setItem("ocr_result", JSON.stringify(data))

        await new Promise(r => setTimeout(r, 500))
        console.log('Redirecting to results page...')
        window.location.href = "/result/local"
        return
      }

      // Handle single image response
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
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return

      // Validation: Max 5 files
      if (acceptedFiles.length > 5) {
        alert("Maximum 5 files allowed per upload. Please select fewer files.")
        return
      }

      // Validation: Individual file size (10MB each)
      const oversizedFile = acceptedFiles.find(file => file.size > 10 * 1024 * 1024)
      if (oversizedFile) {
        alert(`File "${oversizedFile.name}" exceeds 10MB limit. Please select a smaller file.`)
        return
      }

      // Validation: Total batch size (10MB for multiple files)
      if (acceptedFiles.length > 1) {
        const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0)
        if (totalSize > 10 * 1024 * 1024) {
          alert(`Total file size (${(totalSize / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit for batch uploads. Please select smaller files.`)
          return
        }
      }

      const file = acceptedFiles[0]

      // Skip login requirement for local development
      const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

      if (!session && !isLocalhost) {
        setPendingFile(file)
        setShowAuthModal(true)
        return
      }

      await handleUpload(file)
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
          <div className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-center text-balance min-h-[4rem] flex items-center justify-center">
            <TextType
              text={["Free OCR Extraction tool", "and Report Generation Tool", "Free OCR Extraction tool and Report Generation Tool"]}
              typingSpeed={50}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              loop={false}
              onSentenceComplete={(sentence, index) => {
                // Keep the final sentence
              }}
            />
          </div>


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

      <ChatWidget />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false)
            setPendingFile(null)
          }}
          onSuccess={() => {
            setShowAuthModal(false)
            if (pendingFile) {
              handleUpload(pendingFile)
              setPendingFile(null)
            } else {
              window.location.reload()
            }
          }}
        />
      )}
    </div>
  )
}
