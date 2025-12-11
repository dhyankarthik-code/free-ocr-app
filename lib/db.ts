import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Get the base connection string
let connectionString = process.env.DATABASE_URL || ''

// Ensure pgbouncer=true is set for Supabase Supavisor compatibility
// This disables prepared statements which conflict with transaction pooling
if (connectionString && !connectionString.includes('pgbouncer=true')) {
    const separator = connectionString.includes('?') ? '&' : '?'
    connectionString = `${connectionString}${separator}pgbouncer=true`
}

// Supabase requires SSL with rejectUnauthorized: false
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
