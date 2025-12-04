"use client"

import { useState, useRef } from "react"
import { X } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"

interface AuthModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleGoogleLogin = async () => {
    if (!captchaVerified) {
      alert("Please verify you're not a robot")
      return
    }
    setLoading(true)
    window.location.href = "/api/auth/google"
  }

  const handleFacebookLogin = async () => {
    if (!captchaVerified) {
      alert("Please verify you're not a robot")
      return
    }
    setLoading(true)
    window.location.href = "/api/auth/facebook"
  }

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaVerified(!!value)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
          <p className="text-gray-600 text-sm">Sign in with your account to upload and process OCR documents.</p>
        </div>

        {/* reCAPTCHA */}
        <div className="flex justify-center mb-6">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
            onChange={handleCaptchaChange}
          />
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || !captchaVerified}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-blue-600 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Connecting..." : "Sign in with Google"}
          </button>

          {/* Facebook Button - Temporarily hidden */}
          {/* <button
            onClick={handleFacebookLogin}
            disabled={loading || !captchaVerified}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {loading ? "Connecting..." : "Facebook"}
          </button> */}
        </div>

        {/* Divider with "OR" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
          </div>
        </div>

        {/* Continue without signing in */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 text-gray-600 text-center text-sm hover:text-gray-900 transition-colors font-medium"
        >
          Continue without signing in
        </button>

        {/* Sign up link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have account? <button onClick={() => window.location.href = '/signup'} className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Sign-Up</button>
        </div>
      </div>
    </div>
  )
}
