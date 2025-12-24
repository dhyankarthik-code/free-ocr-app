import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
    const sessionCookie = request.cookies.get("session")?.value

    // Get IP address for anonymous user tracking
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    // Try logged-in user first
    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie)
            const googleId = session.id.replace("google_", "")

            const { default: prisma } = await import("@/lib/db")
            const { checkAndResetUsage } = await import("@/lib/usage-limit")

            const user = await prisma.user.findUnique({
                where: { googleId },
                select: {
                    id: true,
                    timezone: true,
                    lastUsageDate: true,
                    usagebytes: true
                }
            })

            let currentUsage = user?.usagebytes || 0

            if (user) {
                // Check if we need to reset stats for today
                currentUsage = await checkAndResetUsage(user, prisma as any)
            }

            return NextResponse.json({
                usagebytes: currentUsage,
                limit: 10 * 1024 * 1024 // 10MB
            })
        } catch (e) {
            console.error("User usage fetch error", e)
        }
    }

    // Fallback to anonymous visitor tracking by IP
    try {
        const { default: prisma } = await import("@/lib/db")
        const { checkAndResetUsage } = await import("@/lib/usage-limit")

        const visitor = await prisma.visitor.findFirst({
            where: { ipAddress: ipAddress },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                timezone: true,
                lastUsageDate: true,
                usageBytes: true
            }
        })

        let currentUsage = visitor?.usageBytes || 0

        if (visitor) {
            // Adapt visitor to User interface for checkAndResetUsage
            const visitorAsUser = {
                id: visitor.id,
                timezone: visitor.timezone,
                lastUsageDate: visitor.lastUsageDate,
                usagebytes: visitor.usageBytes || 0
            }
            currentUsage = await checkAndResetUsage(visitorAsUser, prisma as any, 'visitor')
        }

        return NextResponse.json({
            usagebytes: currentUsage,
            limit: 10 * 1024 * 1024 // 10MB
        })
    } catch (e) {
        console.error("Visitor usage fetch error", e)
        return NextResponse.json({ usagebytes: 0, limit: 10 * 1024 * 1024 }, { status: 500 })
    }
}
