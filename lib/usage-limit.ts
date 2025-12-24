
import { PrismaClient } from '@prisma/client'

// Define a minimal User type that matches what we need
// We don't import the full User type from @prisma/client to avoid circular deps if any, 
// but practically we will pass the user object we got from Prisma.
interface UsageUser {
    id: string
    timezone: string | null
    lastUsageDate: Date | null
    usagebytes: number
}

/**
 * Checks if the user's daily usage quota needs to be reset based on their local timezone.
 * If strictly a new day in their timezone, resets usagebytes to 0 and updates lastUsageDate.
 * 
 * @param user The user/visitor object (must include id, timezone, lastUsageDate, usagebytes)
 * @param prisma The prisma client instance
 * @param modelType 'user' or 'visitor' - determines which table to update
 * @returns The effective usagebytes (0 if reset, or current value)
 */
export async function checkAndResetUsage(user: UsageUser, prisma: PrismaClient, modelType: 'user' | 'visitor' = 'user'): Promise<number> {
    const userTimezone = user.timezone || 'UTC'

    // Get "Right Now"
    const now = new Date()


    // 1. Calculate "Today" in User's Timezone (YYYY-MM-DD)
    // We use Intl.DateTimeFormat with en-CA to get YYYY-MM-DD directly
    let todayString: string
    try {
        todayString = new Intl.DateTimeFormat('en-CA', {
            timeZone: userTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now)
    } catch (e) {
        console.warn(`Invalid timezone '${userTimezone}' for ${modelType} ${user.id}, falling back to UTC`)
        todayString = now.toISOString().split('T')[0]
    }

    // 2. Calculate "Last Usage Day" in User's Timezone
    let lastUsageString: string | null = null
    if (user.lastUsageDate) {
        try {
            lastUsageString = new Intl.DateTimeFormat('en-CA', {
                timeZone: userTimezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(user.lastUsageDate)
        } catch (e) {
            lastUsageString = user.lastUsageDate.toISOString().split('T')[0]
        }
    }

    // 3. Compare
    // If we have no record of last usage, or if the "Day" string has changed, RESET.
    if (!lastUsageString || lastUsageString !== todayString) {
        console.log(`[Usage] Resetting quota for ${modelType} ${user.id}. Last: ${lastUsageString}, Today: ${todayString} (${userTimezone})`)

        // Update DB based on model type
        if (modelType === 'visitor') {
            await prisma.visitor.update({
                where: { id: user.id },
                data: {
                    usageBytes: 0,
                    lastUsageDate: now
                }
            })
        } else {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    usagebytes: 0,
                    // We update the timestamp to NOW (UTC). 
                    // Next time we check, we convert THIS new UTC timestamp to user's local YYYY-MM-DD.
                    lastUsageDate: now
                }
            })
        }
        return 0
    }

    // No reset needed
    return user.usagebytes
}
