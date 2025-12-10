import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { default: prisma } = await import("@/lib/db")

        // 1. Check Env
        const dbUrl = process.env.DATABASE_URL
        const envStatus = dbUrl ? "Set (Length: " + dbUrl.length + ")" : "MISSING"

        // 2. Test Connection
        const startTime = Date.now()
        await prisma.$connect()
        const connectTime = Date.now() - startTime

        // 3. Test Read
        const count = await prisma.user.count()

        return NextResponse.json({
            status: "SUCCESS",
            details: {
                databaseUrlEnv: envStatus,
                connectionTimeMs: connectTime,
                userCount: count,
                message: "Database connection allows READ access."
            }
        })
    } catch (error: any) {
        return NextResponse.json({
            status: "ERROR",
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            details: "Failed to connect to database."
        }, { status: 500 })
    }
}
