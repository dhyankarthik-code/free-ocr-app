"use client"

import { useState, useCallback, useEffect } from "react"
import { TypeAnimation } from 'react-type-animation';
import Navbar from "@/components/navbar"
import UploadZone from "@/components/upload-zone"
import EmailCaptureModal from "@/components/email-capture-modal"
import Footer from "@/components/footer"
import { useSession } from "@/hooks/use-session"
import TextType from "@/components/text-type"
import ChatWidget from "@/components/chat-widget"

export default function Home() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [processingSteps, setProcessingSteps] = useState<string[]>([])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [visitorEmail, setVisitorEmail] = useState<string | null>(null)
  const { session, logout } = useSession()

  // Check for stored visitor email on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('visitor_email')
    if (storedEmail) {
      setVisitorEmail(storedEmail)
    }
  }, [])

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
        sessionStorage.setItem("ocr_result", JSON.stringify({ ...data, fileName: file.name }))

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
      sessionStorage.setItem("ocr_result", JSON.stringify({ text, fileName: file.name }))

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

      // Image validation: Max 5 images (REMOVED)
      // if (imageFiles.length > 5) {
      //   setValidationError("Maximum 5 images allowed per upload. Please select fewer files.")
      //   return
      // }

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
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

      // Check if user has provided email (replaces login requirement)
      const hasEmail = localStorage.getItem('visitor_email')

      if (!hasEmail) {
        setPendingFile(file)
        setShowEmailModal(true)
        return
      }

      // Single PDF or single image - use standard upload
      if (isPDF || imageFiles.length === 1) {
        await handleUpload(file)
        return
      }

      // Multiple images - batch process
      setUploading(true)
      setProgress(0)
      setProcessingSteps(["Starting batch upload..."])

      try {
        const pageResults: Array<{ pageNumber: number; text: string; imageName: string }> = []

        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i]
          setProcessingSteps(prev => [...prev, `Processing image ${i + 1} of ${imageFiles.length}: ${imageFile.name}...`])
          setProgress(Math.round(((i) / imageFiles.length) * 80))

          // Preprocess image
          const { quickPreprocess } = await import('@/lib/image-preprocessing')
          const preprocessedBlob = await quickPreprocess(imageFile)

          // Call OCR API
          const formData = new FormData()
          formData.append('file', preprocessedBlob, imageFile.name)

          const response = await fetch('/api/ocr', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.details || errorData.error || `Failed to process ${imageFile.name}`)
          }

          const data = await response.json()
          const extractedText = String(data?.text || "")

          pageResults.push({
            pageNumber: i + 1,
            text: extractedText,
            imageName: imageFile.name
          })
        }

        setProcessingSteps(prev => [...prev, "Finalizing batch results..."])
        setProgress(100)

        // Store as multi-page format for carousel
        sessionStorage.setItem("ocr_result", JSON.stringify({
          isPDF: false,
          isBatch: true,
          fileName: imageFiles[0].name, // Use first image name as reference
          pages: pageResults,
          totalPages: pageResults.length
        }))

        await new Promise(r => setTimeout(r, 500))
        window.location.href = "/result/local"

      } catch (error) {
        console.error("Batch OCR Error:", error)
        setValidationError(`Failed to process images: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        onLoginClick={() => setShowEmailModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-2xl">
          <div className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-center text-balance min-h-[4rem] flex items-center justify-center">
            {/* SEO H1 (Visually Hidden but accessible to crawlers) */}
            {/* SEO H1 (Visually Hidden but accessible to crawlers) */}
            <h1 className="text-gray-900 text-center">
              <TypeAnimation
                sequence={[
                  'Free OCR Extraction tool',
                  1000,
                  'Free OCR Extraction tool and Report Generation Tool',
                  1000,
                ]}
                wrapper="span"
                speed={50}
                style={{ display: 'inline-block' }}
                repeat={Infinity}
              />
            </h1>
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

        {/* Welcome Section */}
        <section className="w-full max-w-5xl mt-20 px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-red-500">OCR-Extraction.com</span>
            </h2>
            <div className="mt-8 text-center text-sm text-gray-500">
              {/* <p>© {new Date().getFullYear()} Free OCR Tool. All rights reserved.</p> */}
            </div>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
              The World's "Most Accurate OCR" Tool for Free
            </p>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Convert your images, scanned documents, and PDFs into clean, editable text in seconds.
              OCR-Extraction.com is engineered with advanced AI technology to deliver <strong>95–100% accuracy</strong>,
              lightning-fast processing, and zero data loss — all completely free.
            </p>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              Whether you're a student, professional, or business user, our powerful OCR engine helps you
              extract text instantly without the need for any installations or subscriptions.
            </p>
          </div>
        </section>

        {/* Why Users Trust Us */}
        <section className="w-full max-w-6xl mt-16 px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Why Users Trust OCR-Extraction.com
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Exceptional Accuracy</h4>
              <p className="text-gray-600 text-sm">
                Our AI-powered optical character recognition engine is trained on millions of samples to ensure
                unmatched detail, clarity, and precision. From printed text to complex documents, you get
                near-perfect extraction every time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Instant Results</h4>
              <p className="text-gray-600 text-sm">
                Upload your file and watch it convert within seconds. Thanks to our optimized backend and
                fast cloud processing, your workflow stays smooth and effortless.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">100% Free to Use</h4>
              <p className="text-gray-600 text-sm">
                No hidden fees, no limits, no sign-ups. Access all features without worrying about
                subscriptions or trials.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">AI Summary Included</h4>
              <p className="text-gray-600 text-sm">
                Go beyond text extraction. Our built-in AI Summary tool instantly creates a clean,
                readable summary of the extracted content — perfect for students, researchers, and professionals.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Export to Excel</h4>
              <p className="text-gray-600 text-sm">
                Need structured data? Download your results in Excel format with auto-column formatting.
                Ideal for analysts, finance teams, logistics departments, and anyone working with tabular data.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Works on Any Device</h4>
              <p className="text-gray-600 text-sm">
                Desktop, laptop, tablet, or smartphone — OCR-Extraction.com adapts to every screen
                for a seamless user experience.
              </p>
            </div>
          </div>
        </section>

        {/* What You Can Do */}
        <section className="w-full max-w-4xl mt-20 px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
            What You Can Do With OCR-Extraction.com
          </h3>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
            <ul className="grid md:grid-cols-2 gap-4">
              {[
                "Convert images (.jpg, .png, .jpeg) to text",
                "Extract text from PDFs and scanned documents",
                "Convert tables and structured data into Excel",
                "Summarize long or complex documents instantly",
                "Digitize notes, invoices, medical reports, legal papers",
                "Create searchable document archives",
                "Use it for education, business, research, analytics"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Built by Experts */}
        <section className="w-full max-w-4xl mt-20 px-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 md:p-12 rounded-2xl text-white text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Built by Industry Experts</h3>
            <p className="text-white/90 mb-4 max-w-2xl mx-auto">
              OCR-Extraction.com is developed by <strong>Infy Galaxy</strong>, a team of AI professionals
              dedicated to building reliable and user-centric tools.
            </p>
            <p className="text-white/80 italic">
              "Make digital text extraction fast, accurate, and accessible to everyone."
            </p>
          </div>
        </section>

        {/* Try It Now CTA */}
        <section className="w-full max-w-3xl mt-20 mb-12 px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Try It Now
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your file, click convert, and experience the most accurate OCR tool available online in 2025.
          </p>
          <p className="text-gray-500 text-sm">
            Your data stays secure, your results stay precise, and your workflow becomes effortless.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Your File
          </button>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      <ChatWidget />

      {/* Email Capture Modal */}
      {showEmailModal && (
        <EmailCaptureModal
          onClose={() => {
            setShowEmailModal(false)
            setPendingFile(null)
          }}
          onSubmit={(email) => {
            setVisitorEmail(email)
            setShowEmailModal(false)
            if (pendingFile) {
              handleUpload(pendingFile)
              setPendingFile(null)
            }
          }}
        />
      )}
    </div>
  )
}
