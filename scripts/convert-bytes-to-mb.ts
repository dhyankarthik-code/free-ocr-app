import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function convertBytesToMB() {
    try {
        console.log('Starting conversion from bytes to MB...')

        // Convert User table
        const userResult = await prisma.$executeRaw`
            UPDATE "User"
            SET "usageMB" = "usageMB" / (1024.0 * 1024.0)
            WHERE "usageMB" > 10
        `
        console.log(`✅ Converted ${userResult} User records`)

        // Convert Visitor table
        const visitorResult = await prisma.$executeRaw`
            UPDATE "Visitor"
            SET "usageMB" = "usageMB" / (1024.0 * 1024.0)
            WHERE "usageMB" > 10
        `
        console.log(`✅ Converted ${visitorResult} Visitor records`)

        // Verify
        const users = await prisma.user.findMany({
            where: { usageMB: { gt: 0 } },
            select: { email: true, usageMB: true },
            take: 5
        })
        console.log('\n📊 Sample User data after conversion:')
        console.table(users)

        const visitors = await prisma.visitor.findMany({
            where: { usageMB: { gt: 0 } },
            select: { email: true, usageMB: true },
            take: 5
        })
        console.log('\n📊 Sample Visitor data after conversion:')
        console.table(visitors)

        console.log('\n✅ Migration completed successfully!')
    } catch (error) {
        console.error('❌ Migration failed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

convertBytesToMB()
