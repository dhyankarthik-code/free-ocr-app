"use client"

import { TypeAnimation } from 'react-type-animation';
import Navbar from "@/components/navbar"
import SmartUploadZone from "@/components/smart-upload-zone"
import Footer from "@/components/footer"
import { useSession } from "@/hooks/use-session"
import ChatWidget from "@/components/chat-widget"
import CtaSection from "@/components/cta-section"

export default function Home() {
  const { session, logout } = useSession()

  return (
    <div className="min-h-screen bg-white flex flex-col pt-16">
      <Navbar
        session={session}
        onLogout={logout}
        onLoginClick={() => { }}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-2xl">
          <div className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-center text-balance min-h-[4rem] flex items-center justify-center">
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

          <SmartUploadZone />

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
        <CtaSection />
      </main>

      {/* Footer */}
      <Footer />

      <ChatWidget />


    </div>
  )
}
