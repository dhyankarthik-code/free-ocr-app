"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Download, Settings, CheckCircle2, Loader2 } from "lucide-react"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"

interface UploadZoneProps {
  onDrop: (files: File[]) => void
  uploading: boolean
  progress: number
  processingSteps?: string[]
}

export default function UploadZone({ onDrop, uploading, progress, processingSteps = [] }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxFiles: 5,
    disabled: uploading,
  })

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-2xl p-8 md:p-12
          transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center
          ${isDragActive ? "border-red-500 bg-red-50 scale-[1.02]" : "border-gray-300 hover:border-red-400 hover:bg-gray-50"}
          ${uploading ? "opacity-50 pointer-events-none border-gray-200" : ""}
        `}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <input {...getInputProps()} />

        {/* Icon & Text */}
        <div className={`
          w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6
          transition-transform duration-300 group-hover:scale-110
          ${isDragActive ? "bg-red-100" : ""}
        `}>
          <Upload className={`w-10 h-10 text-red-500 ${isDragActive ? "animate-bounce" : ""}`} />
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
          {isDragActive ? "Drop files here!" : "Select or Drop Files"}
        </h3>

        <p className="text-gray-500 text-center max-w-sm mb-8">
          Upload images or PDFs to extract text. Max 5 files, 10MB each.
        </p>

        {/* Button-like visual */}
        <div className="pointer-events-none">
          <InteractiveHoverButton
            text="Browse Files"
            className="pointer-events-auto w-48"
          />
        </div>
      </div>

      {/* Processing Overlay / Steps */}
      {uploading && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center p-8 border border-gray-200 shadow-xl">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Image</h3>
              <p className="text-gray-500 text-sm">Please wait while we work our magic...</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps Log */}
            <div className="space-y-3 mt-4">
              {processingSteps.map((step, index) => {
                const isCompleted = index < processingSteps.length - 1;
                const isCurrent = index === processingSteps.length - 1;

                return (
                  <div key={index} className="flex items-center gap-3 text-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-red-500 animate-spin flex-shrink-0" />
                    )}
                    <span className={`${isCurrent ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
