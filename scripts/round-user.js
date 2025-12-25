const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ocradmin%402526@db.nbwkntbqywadcuifxjyd.supabase.co:5432/postgres';

async function checkUserColumn() {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User' 
            AND column_name ILIKE 'usage%'
        `);

        console.log('User table usage columns:', res.rows);

        if (res.rows.length > 0) {
            const colName = res.rows[0].column_name;
            console.log(`Rounding column: ${colName}`);

            await client.query(`
                UPDATE "User"
                SET "${colName}" = ROUND("${colName}"::numeric, 2)
                WHERE "${colName}" > 0
            `);
            console.log('✅ User table rounded successfully');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkUserColumn();
