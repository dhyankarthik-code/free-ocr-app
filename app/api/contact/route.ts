import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, country, mobile, message } = body

        // Get user's IP address
        const forwarded = request.headers.get("x-forwarded-for")
        const realIp = request.headers.get("x-real-ip")
        const ipAddress = forwarded ? forwarded.split(",")[0] : realIp || "Unknown"

        // Google Sheets Web App URL - UPDATED
        const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || ""

        if (!GOOGLE_SHEET_URL) {
            console.error("GOOGLE_SHEET_WEBHOOK_URL not configured")
            return NextResponse.json({ error: "Configuration error" }, { status: 500 })
        }

        // Save to Supabase (Non-blocking or parallel preferred, but sequential for simplicity)
        try {
            await prisma.contactSubmission.create({
                data: {
                    name,
                    email,
                    country,
                    mobile,
                    message,
                    ipAddress
                }
            })
        } catch (dbError) {
            console.error("Failed to save contact submission to Supabase:", dbError)
            // Continue execution to still send to Google Sheets
        }

        // Send data to Google Sheets
        const response = await fetch(GOOGLE_SHEET_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
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

        // Return success regardless of response (no-cors workaround)
        return NextResponse.json({ success: true, message: "Form submitted successfully" })
    } catch (error) {
        console.error("Contact form API error:", error)
        return NextResponse.json(
            { error: "Failed to submit form" },
            { status: 500 }
        )
    }
}
