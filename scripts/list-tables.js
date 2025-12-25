const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ocradmin%402526@db.nbwkntbqywadcuifxjyd.supabase.co:5432/postgres';

async function listTables() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // List all tables
        const tables = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);
        console.log('\n📋 All tables:');
        console.table(tables.rows);

        // Show Visitor table structure
        const visitorStructure = await client.query(`
            SELECT * FROM "Visitor" LIMIT 1
        `);

        if (visitorStructure.rows.length > 0) {
            console.log('\n📊 Visitor table columns (from actual data):');
            console.log(Object.keys(visitorStructure.rows[0]));
            console.log('\nSample row:');
            console.log(visitorStructure.rows[0]);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

listTables();
