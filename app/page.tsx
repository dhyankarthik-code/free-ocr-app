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
  const [validationError, setValidationError] = useState<string | null>(null)
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
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const formData = new FormData()

      if (isPDF) {
        console.log('PDF detected, skipping client-side optimization...')
        formData.append('file', file)
      } else {
        // 1. Preprocess image (Client-side)
        setProcessingSteps(prev => [...prev, "Optimizing image quality (Grayscale, Contrast)..."])
        setStatus("Optimizing image for better accuracy...")

        // Small delay to let user see the step
        await new Promise(r => setTimeout(r, 800))

        const { quickPreprocess } = await import('@/lib/image-preprocessing')
        const preprocessedBlob = await quickPreprocess(file)

        // Append with original filename but potentially different type/content
        formData.append('file', preprocessedBlob, file.name)
      }

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
      setValidationError(null) // Clear previous errors

      if (!acceptedFiles || acceptedFiles.length === 0) return

      // Check for PDFs
      const pdfFiles = acceptedFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
      const imageFiles = acceptedFiles.filter(f => !f.type.includes('pdf') && !f.name.toLowerCase().endsWith('.pdf'))

      // PDF validation: Only one PDF at a time
      if (pdfFiles.length > 1) {
        setValidationError("Only one PDF file can be uploaded at a time.")
        return
      }

      // If PDF is included, it must be the only file
      if (pdfFiles.length === 1 && imageFiles.length > 0) {
        setValidationError("Please upload either a PDF or images, not both.")
        return
      }

      // PDF size check (max 10MB)
      if (pdfFiles.length === 1 && pdfFiles[0].size > 10 * 1024 * 1024) {
        setValidationError(`PDF "${pdfFiles[0].name}" exceeds 10MB limit.`)
        return
      }

      // Image validation: Max 5 images
      if (imageFiles.length > 5) {
        setValidationError("Maximum 5 images allowed per upload. Please select fewer files.")
        return
      }

      // Validation: Individual file size (10MB each)
      const oversizedFile = acceptedFiles.find(file => file.size > 10 * 1024 * 1024)
      if (oversizedFile) {
        setValidationError(`File "${oversizedFile.name}" exceeds 10MB limit.`)
        return
      }

      // Validation: Total batch size (10MB for multiple images)
      if (imageFiles.length > 1) {
        const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0)
        if (totalSize > 10 * 1024 * 1024) {
          setValidationError(`Total file size (${(totalSize / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit for batch uploads.`)
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

          {/* Validation Error Display */}
          {validationError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{validationError}</span>
              </div>
              <button
                onClick={() => setValidationError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}
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
