const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ocradmin%402526@db.nbwkntbqywadcuifxjyd.supabase.co:5432/postgres';

async function convertBytesToMB() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // First, add the new usageMB column
        console.log('\n➡️  Adding usageMB column...');
        await client.query(`
            ALTER TABLE "Visitor"
            ADD COLUMN IF NOT EXISTS "usageMB" DOUBLE PRECISION DEFAULT 0.0
        `);

        // Convert bytes to MB
        console.log('➡️  Converting usageBytes to usageMB...');
        const result = await client.query(`
            UPDATE "Visitor"
            SET "usageMB" = "usageBytes" / (1024.0 * 1024.0)
            WHERE "usageBytes" > 0
        `);
        console.log(`✅ Converted ${result.rowCount} Visitor records`);

        // Drop the old usageBytes column
        console.log('➡️  Dropping usageBytes column...');
        await client.query(`
            ALTER TABLE "Visitor"
            DROP COLUMN "usageBytes"
        `);

        // Show sample data
        const sampleVisitors = await client.query(`
            SELECT email, "usageMB", timezone
            FROM "Visitor"
            WHERE "usageMB" > 0
            ORDER BY "usageMB" DESC
            LIMIT 10
        `);

        console.log('\n📊 Top 10 Visitors by usage (after conversion to MB):');
        console.table(sampleVisitors.rows);

        console.log('\n✅ Migration completed successfully!');
        console.log('📝 Remember to update Prisma schema to match the new column name');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await client.end();
    }
}

convertBytesToMB();
