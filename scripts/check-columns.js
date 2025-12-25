const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ocradmin%402526@db.nbwkntbqywadcuifxjyd.supabase.co:5432/postgres';

async function checkColumns() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check User table columns
        const userColumns = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'User'
            ORDER BY ordinal_position
        `);
        console.log('\n📋 User table columns:');
        console.table(userColumns.rows);

        // Check Visitor table columns
        const visitorColumns = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'Visitor'
            ORDER BY ordinal_position
        `);
        console.log('\n📋 Visitor table columns:');
        console.table(visitorColumns.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkColumns();
