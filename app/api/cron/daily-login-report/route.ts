import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email list
const ADMIN_EMAILS = [
  'admin@ocr-extraction.com',
  'karthi@ocr-extraction.com',
  'dhyan@ocr-extraction.com',
  'gajashree@ocr-extraction.com',
];

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate 24-hour window from current execution time
    // Since cron runs at 6:00 AM IST (00:30 UTC), this covers the desired window
    const now = new Date();
    const endTime = now;
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - 1);

    // Count new logins in the last 24 hours
    const newLoginsCount = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: startTime,
          lt: endTime,
        },
      },
    });

    // Get detailed login information
    const newLogins = await prisma.user.findMany({
      where: {
        lastLoginAt: {
          gte: startTime,
          lt: endTime,
        },
      },
      select: {
        email: true,
        name: true,
        lastLoginAt: true,
        country: true,
        city: true,
      },
      orderBy: {
        lastLoginAt: 'desc',
      },
    });

    // Format dates for IST (Indian Standard Time)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    const dateStr = `${startTime.toLocaleString('en-US', options)} - ${endTime.toLocaleString('en-US', options)} (IST)`;

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              margin: -30px -30px 30px -30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .stats {
              background-color: #f8f9fa;
              border-left: 4px solid #334155;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .stats h2 {
              margin: 0 0 10px 0;
              color: #334155;
              font-size: 36px;
            }
            .stats p {
              margin: 0;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f1f5f9;
              color: #334155;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #e2e8f0;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            tr:hover {
              background-color: #f8f9fa;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 12px;
            }
            .location-tag {
              display: inline-block;
              padding: 2px 6px;
              background: #e0f2fe;
              color: #0369a1;
              border-radius: 4px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Daily Login Report</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">${dateStr}</p>
            </div>
            
            <div class="stats">
              <h2>${newLoginsCount}</h2>
              <p>New logins in the past 24 hours</p>
            </div>

            ${newLoginsCount > 0 ? `
              <h3>Login Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Time (IST)</th>
                  </tr>
                </thead>
                <tbody>
                  ${newLogins.map(user => `
                    <tr>
                      <td><strong>${user.name || 'Unknown'}</strong></td>
                      <td>${user.email}</td>
                      <td>
                        ${user.city || user.country ?
        `<span class="location-tag">${[user.city, user.country].filter(Boolean).join(', ')}</span>`
        : '<span style="color:#999">Unknown</span>'}
                      </td>
                      <td>${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-US', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div style="text-align:center; padding: 40px; color: #666;">
                <p>No new logins recorded in this period.</p>
              </div>
            `}

            <div class="footer">
              <p><strong>OCR Extraction Automation</strong></p>
              <p>Generated at ${now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to all admins
    const emailPromises = ADMIN_EMAILS.map(email =>
      resend.emails.send({
        from: 'OCR Extraction Reports <reports@ocr-extraction.com>',
        to: email,
        subject: `Daily Login Report: ${newLoginsCount} New Logins`,
        html: htmlContent,
      })
    );

    const results = await Promise.allSettled(emailPromises);

    // Check for any failures
    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      console.error('Some emails failed to send:', failures);
    }

    return NextResponse.json({
      success: true,
      window: dateStr,
      newLoginsCount,
      emailsSent: results.filter(r => r.status === 'fulfilled').length,
    });

  } catch (error) {
    console.error('Error in daily login report cron:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
