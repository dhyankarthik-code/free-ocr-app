/**
 * Test script for Daily Login Report
 * 
 * This script helps you test the daily login report functionality locally
 * without waiting for the cron job to trigger.
 * 
 * Usage:
 *   node test-login-report.js
 */

const testLoginReport = async () => {
    console.log('🧪 Testing Daily Login Report...\n');

    const CRON_SECRET = process.env.CRON_SECRET || 'test-secret';
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

    try {
        console.log(`📡 Sending request to: ${BASE_URL}/api/cron/daily-login-report`);
        console.log(`🔐 Using CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...\n`);

        const response = await fetch(`${BASE_URL}/api/cron/daily-login-report`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
            },
        });

        console.log(`📊 Response Status: ${response.status} ${response.statusText}\n`);

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS! Report generated and emails sent.\n');
            console.log('📈 Report Details:');
            console.log(`   Date: ${data.date}`);
            console.log(`   New Logins: ${data.newLoginsCount}`);
            console.log(`   Emails Sent: ${data.emailsSent}`);
            console.log(`   Emails Failed: ${data.emailsFailed}`);
            console.log(`   Timestamp: ${data.timestamp}\n`);

            if (data.emailsFailed > 0) {
                console.log('⚠️  Warning: Some emails failed to send. Check your Resend API key and domain verification.');
            } else {
                console.log('🎉 All emails sent successfully!');
            }
        } else {
            console.log('❌ ERROR: Failed to generate report.\n');
            console.log('Error Details:', JSON.stringify(data, null, 2));

            if (response.status === 401) {
                console.log('\n💡 Tip: Make sure CRON_SECRET environment variable is set correctly.');
            }
        }

    } catch (error) {
        console.log('❌ FATAL ERROR:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure your dev server is running (npm run dev)');
        console.log('   2. Check that RESEND_API_KEY is set in .env.local');
        console.log('   3. Verify CRON_SECRET is set in .env.local');
        console.log('   4. Ensure your database connection is working');
    }
};

// Run the test
testLoginReport();
