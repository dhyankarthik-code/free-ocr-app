"use client"

import { X } from "lucide-react"

interface SummaryModalProps {
  summary: string[] | null
  onClose: () => void
}

export default function SummaryModal({ summary, onClose }: SummaryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">AI Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {summary ? (
          <ul className="space-y-3">
            {summary.map((item, index) => (
              <li key={index} className="flex gap-3 text-sm text-gray-700">
                <span className="text-red-500 font-bold flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin mb-2">⏳</div>
            <p className="text-sm text-gray-600">Generating summary...</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
