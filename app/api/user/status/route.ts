import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const email = searchParams.get("email")

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 })
        }

        const { default: prisma } = await import("@/lib/db")

        const user = await prisma.user.findUnique({
            where: { email },
            select: { acceptedTerms: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ acceptedTerms: user.acceptedTerms })
    } catch (error) {
        console.error("Status check error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
