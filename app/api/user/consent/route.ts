import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
    try {
        const cookieStore = cookies()
        const sessionCookie = cookieStore.get("session")

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = JSON.parse(sessionCookie.value)
        const { default: prisma } = await import("@/lib/db")

        // Update user consent in database
        await prisma.user.update({
            where: { email: user.email },
            data: {
                acceptedTerms: true,
                acceptedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Consent update error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
