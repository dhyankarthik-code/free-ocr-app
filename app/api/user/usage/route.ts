import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const sessionCookie = request.cookies.get("session")?.value
    if (!sessionCookie) {
        return NextResponse.json({ usagebytes: 0, limit: 10 * 1024 * 1024 }, { status: 200 })
    }

    try {
        const session = JSON.parse(sessionCookie)
        const googleId = session.id.replace("google_", "")

        const { default: prisma } = await import("@/lib/db")
        const user = await prisma.user.findUnique({
            where: { googleId },
            select: { usagebytes: true }
        })

        return NextResponse.json({
            usagebytes: user?.usagebytes || 0,
            limit: 10 * 1024 * 1024 // 10MB
        })
    } catch (e) {
        console.error("Usage fetch error", e)
        return NextResponse.json({ usagebytes: 0, limit: 10 * 1024 * 1024 }, { status: 500 })
    }
}
