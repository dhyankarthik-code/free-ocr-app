"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

interface ConsentPopupProps {
    session: any
}

export default function ConsentPopup({ session }: ConsentPopupProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const checkConsent = async () => {
            if (!session?.email) return

            try {
                // Check consent status from dedicated API or pass it in session
                // For now, we'll fetch a simple status check endpoint
                const response = await fetch(`/api/user/status?email=${session.email}`)
                if (response.ok) {
                    const data = await response.json()
                    // If user hasn't accepted terms yet, show popup
                    if (!data.acceptedTerms) {
                        setOpen(true)
                    }
                }
            } catch (error) {
                console.error("Failed to check consent:", error)
            }
        }

        checkConsent()
    }, [session])

    const handleAccept = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/user/consent", {
                method: "POST"
            })

            if (response.ok) {
                setOpen(false)
            } else {
                alert("Failed to save consent. Please try again.")
            }
        } catch (error) {
            console.error("Consent error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            {/* Prevent closing by clicking outside by passing empty onOpenChange and not exposing close button in content */}
            <DialogContent className="sm:max-w-md [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">Privacy Policy Updates</DialogTitle>
                </DialogHeader>

                <div className="text-gray-600 text-sm space-y-4 my-2">
                    <p>
                        We've updated our policies to ensure your data safety and transparency.
                        Before you proceed to upload files, please review and accept our terms.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-xs text-gray-500">
                        <h4 className="font-semibold text-gray-700 mb-1">Disclaimer Summary:</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>We do <strong>not</strong> permanently store your files. They are deleted immediately after processing.</li>
                            <li>We use secure cookies to maintain your session.</li>
                            <li>OCR accuracy depends on image quality and is provided "as is".</li>
                        </ul>
                    </div>

                    <p>
                        By clicking "I Accept", you agree to our{" "}
                        <Link href="/privacy" target="_blank" className="text-red-600 hover:underline font-medium">
                            Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" target="_blank" className="text-red-600 hover:underline font-medium">
                            Terms of Service
                        </Link>.
                    </p>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button
                        onClick={handleAccept}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5"
                    >
                        {loading ? "Processing..." : "I Accept & Continue"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
