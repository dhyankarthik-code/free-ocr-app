
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "404 - Page Not Found",
    description: "The page you are looking for does not exist."
}


export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <h1 className="text-9xl font-bold text-red-500 mb-4">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    Oops! The page you are looking for seems to have vanished into thin air (or doesn't exist).
                </p>
                <Link
                    href="/"
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-md"
                >
                    Go Back Home
                </Link>
            </main>
            <Footer />
        </div>
    )
}
