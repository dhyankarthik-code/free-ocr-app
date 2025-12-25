const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ocradmin%402526@db.nbwkntbqywadcuifxjyd.supabase.co:5432/postgres';

async function roundUsageToTwoDecimals() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Round Visitor table usageMB
        console.log('\n➡️  Rounding Visitor table usageMB to 2 decimal places...');
        const visitorResult = await client.query(`
            UPDATE "Visitor"
            SET "usageMB" = ROUND("usageMB"::numeric, 2)
            WHERE "usageMB" > 0 AND "usageMB" != ROUND("usageMB"::numeric, 2)
        `);
        console.log(`✅ Updated ${visitorResult.rowCount} Visitor records`);

        // Round User table usageMB
        console.log('\n➡️  Rounding User table usageMB to 2 decimal places...');
        // First check if usageMB exists to avoid errors if previous script failed slightly
        try {
            const userResult = await client.query(`
                UPDATE "User"
                SET "usageMB" = ROUND("usageMB"::numeric, 2)
                WHERE "usageMB" > 0 AND "usageMB" != ROUND("usageMB"::numeric, 2)
            `);
            console.log(`✅ Updated ${userResult.rowCount} User records`);
        } catch (e) {
            console.log('ℹ️  Could not update User table (column might not exist or empty): ' + e.message);
        }

        // Show sample data
        console.log('\n📊 Sample Visitor data (rounded):');
        const sampleVisitors = await client.query(`
            SELECT email, "usageMB"
            FROM "Visitor"
            WHERE "usageMB" > 0
            ORDER BY "usageMB" DESC
            LIMIT 5
        `);
        console.table(sampleVisitors.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

roundUsageToTwoDecimals();
