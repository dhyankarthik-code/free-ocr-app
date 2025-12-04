import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, country, mobile, message } = body

        // Google Sheets Web App URL (You'll need to replace this with your deployed Google Apps Script URL)
        const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || ""

        if (!GOOGLE_SHEET_URL) {
            console.error("GOOGLE_SHEET_WEBHOOK_URL not configured")
            return NextResponse.json({ error: "Configuration error" }, { status: 500 })
        }

        // Send data to Google Sheets
        const response = await fetch(GOOGLE_SHEET_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                country,
                mobile,
                message,
                timestamp: new Date().toISOString(),
            }),
        })

        if (!response.ok) {
            throw new Error("Failed to submit to Google Sheets")
        }

        return NextResponse.json({ success: true, message: "Form submitted successfully" })
    } catch (error) {
        console.error("Contact form API error:", error)
        return NextResponse.json(
            { error: "Failed to submit form" },
            { status: 500 }
        )
    }
}
