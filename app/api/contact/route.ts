import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, country, mobile, message } = body

        // Get user's IP address
        const forwarded = request.headers.get("x-forwarded-for")
        const realIp = request.headers.get("x-real-ip")
        const ipAddress = forwarded ? forwarded.split(",")[0] : realIp || "Unknown"

        // Google Sheets Web App URL
        const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || ""

        console.log("=== Contact Form Submission ===")
        console.log("Environment variable exists:", !!GOOGLE_SHEET_URL)
        console.log("Form data:", { name, email, country, mobile, message, ipAddress })

        if (!GOOGLE_SHEET_URL) {
            console.error("GOOGLE_SHEET_WEBHOOK_URL not configured")
            return NextResponse.json({ error: "Configuration error: GOOGLE_SHEET_WEBHOOK_URL not set" }, { status: 500 })
        }

        console.log("Attempting to send to Google Sheets...")

        // Send data to Google Sheets including IP address
        const response = await fetch(GOOGLE_SHEET_URL, {
            method: "POST",
            mode: "no-cors", // Add this to bypass CORS
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                country,
                mobile,
                message,
                ipAddress,
                timestamp: new Date().toISOString(),
            }),
        })

        console.log("Google Sheets response status:", response.status)
        console.log("Google Sheets response ok:", response.ok)

        // With no-cors mode, we can't read the response, so we assume success
        if (response.type === "opaque") {
            console.log("Request sent successfully (no-cors mode)")
            return NextResponse.json({ success: true, message: "Form submitted successfully" })
        }

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Google Sheets response error:", errorText)
            throw new Error(`Failed to submit to Google Sheets: ${response.status} ${errorText}`)
        }

        const result = await response.json()
        console.log("Google Sheets response:", result)

        return NextResponse.json({ success: true, message: "Form submitted successfully" })
    } catch (error) {
        console.error("Contact form API error:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json(
            { error: "Failed to submit form", details: errorMessage },
            { status: 500 }
        )
    }
}
