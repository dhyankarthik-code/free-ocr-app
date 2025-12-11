import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
    try {
        const cookieStore = cookies()
        const sessionCookie = cookieStore.get("session")

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized - No session cookie" }, { status: 401 })
        }

        let user
        try {
            user = JSON.parse(sessionCookie.value)
        } catch (parseError) {
            return NextResponse.json({ error: "Invalid session cookie format" }, { status: 400 })
        }

        if (!user.email) {
            return NextResponse.json({ error: "No email in session" }, { status: 400 })
        }

        const { default: prisma } = await import("@/lib/db")

        // Check if user exists first
        const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
        })

        if (!existingUser) {
            return NextResponse.json({
                error: `User not found: ${user.email}`,
                hint: "The user may need to log in again to create their record."
            }, { status: 404 })
        }

        // Update user consent in database
        await prisma.user.update({
            where: { email: user.email },
            data: {
                acceptedTerms: true,
                acceptedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Consent update error:", error)
        return NextResponse.json({
            error: "Database update failed",
            message: error.message,
            code: error.code || "UNKNOWN"
        }, { status: 500 })
    }
}
