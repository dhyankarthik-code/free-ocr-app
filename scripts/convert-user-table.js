const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ocradmin%402526@db.nbwkntbqywadcuifxjyd.supabase.co:5432/postgres';

async function convertUserBytesToMB() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Add usageMB column (camelCase)
        console.log('\n➡️  Adding usageMB column to User table...');
        await client.query(`
            ALTER TABLE "User"
            ADD COLUMN IF NOT EXISTS "usageMB" DOUBLE PRECISION DEFAULT 0.0
        `);

        // Convert usagebytes to usageMB
        console.log('➡️  Converting usagebytes to usageMB...');
        const result = await client.query(`
            UPDATE "User"
            SET "usageMB" = usagebytes / (1024.0 * 1024.0)
            WHERE usagebytes > 0
        `);
        console.log(`✅ Converted ${result.rowCount} User records`);

        // Drop old column
        console.log('➡️  Dropping usagebytes column...');
        await client.query(`ALTER TABLE "User" DROP COLUMN usagebytes`);

        // Show sample data
        const users = await client.query(`
            SELECT email, "usageMB", timezone
            FROM "User"
            WHERE "usageMB" > 0
            ORDER BY "usageMB" DESC
            LIMIT 5
        `);

        console.log('\n📊 Top 5 Users by usage:');
        console.table(users.rows);

        console.log('\n✅ User table migration completed!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await client.end();
    }
}

convertUserBytesToMB();
