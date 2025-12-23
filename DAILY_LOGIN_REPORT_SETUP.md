# Daily Login Report Automation - Setup Guide

## Overview
This automation sends daily email reports to your admin team with the number of new logins from the previous 24 hours.

**Recipients:**
- admin@ocr-extraction.com
- karthi@ocr-extraction.com
- dhyan@ocr-extraction.com
- gajashree@ocr-extraction.com

**Schedule:** Every day at 6:00 AM IST (00:30 UTC)

---

## Setup Instructions

### 1. Configure Resend API Key

1. **Get your Resend API Key:**
   - Go to https://resend.com/api-keys
   - Create a new API key if you don't have one
   - Copy the API key

2. **Add to your environment variables:**
   
   **For local development** (`.env.local`):
   ```env
   RESEND_API_KEY=re_your_api_key_here
   CRON_SECRET=your_random_secret_string_here
   ```

   **For Vercel production:**
   ```bash
   vercel env add RESEND_API_KEY
   # Paste your Resend API key when prompted
   
   vercel env add CRON_SECRET
   # Generate a random secret (e.g., use: openssl rand -base64 32)
   ```

   Or add via Vercel Dashboard:
   - Go to your project settings → Environment Variables
   - Add `RESEND_API_KEY` with your Resend API key
   - Add `CRON_SECRET` with a random secret string

### 2. Verify Domain in Resend

1. Go to https://resend.com/domains
2. Add your domain: `ocr-extraction.com`
3. Add the DNS records provided by Resend to your domain registrar
4. Wait for verification (usually takes a few minutes)

**Note:** The email will be sent from `reports@ocr-extraction.com`. Make sure this subdomain is verified.

### 3. Deploy to Vercel

```bash
# Commit the changes
git add .
git commit -m "Add daily login report automation"

# Push to trigger deployment
git push
```

Vercel will automatically detect the `vercel.json` file and set up the cron job.

### 4. Verify Cron Job Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Cron Jobs**
3. You should see: `/api/cron/daily-login-report` scheduled for `0 6 * * *`

---

## Testing the Automation

### Test Locally

You can test the endpoint locally (it will skip the cron secret check in development):

```bash
# Start your dev server
npm run dev

# In another terminal, trigger the endpoint
curl http://localhost:3000/api/cron/daily-login-report \
  -H "Authorization: Bearer your_cron_secret_here"
```

### Test in Production

```bash
# Trigger the cron job manually
curl https://ocr-extraction.com/api/cron/daily-login-report \
  -H "Authorization: Bearer your_cron_secret_here"
```

---

## Customization Options

### Change Schedule Time

Edit `vercel.json` and modify the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-login-report",
      "schedule": "0 6 * * *"  // Change this
    }
  ]
}
```

**Common schedules:**
- `30 0 * * *` - Every day at 6:00 AM IST (00:30 UTC)
- `0 6 * * *` - Every day at 6:00 AM UTC (11:30 AM IST)
- `0 0 * * *` - Every day at midnight UTC (5:30 AM IST)
- `0 12 * * 1` - Every Monday at noon UTC

### Change Email Recipients

Edit `app/api/cron/daily-login-report/route.ts`:

```typescript
const ADMIN_EMAILS = [
  'admin@ocr-extraction.com',
  'karthi@ocr-extraction.com',
  // Add or remove emails here
];
```

### Change Report Period

By default, it reports logins from the last 24 hours. To change this, edit the date calculation in `route.ts`:

```typescript
// For last 7 days
yesterday.setDate(yesterday.getDate() - 7);

// For last week (Monday to Sunday)
// Add custom logic here
```

---

## Email Template Preview

The email includes:
- **Header:** OCR Extraction branding with gradient background
- **Stats Card:** Large number showing total new logins
- **Detailed Table:** User name, email, location, and login time
- **Footer:** Timestamp and automated message

---

## Monitoring & Troubleshooting

### Check Cron Logs

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Logs**
3. Filter by `/api/cron/daily-login-report`

### Common Issues

**1. Emails not sending:**
- Verify `RESEND_API_KEY` is set correctly
- Check domain verification in Resend
- Review Vercel logs for errors

**2. Cron not triggering:**
- Verify `vercel.json` is in the root directory
- Check Vercel Dashboard → Settings → Cron Jobs
- Ensure you're on a Vercel Pro plan (required for cron jobs)

**3. Unauthorized errors:**
- Verify `CRON_SECRET` matches in both Vercel env and your test requests
- Check the Authorization header format

### Manual Trigger

You can always trigger the report manually via the API:

```bash
curl -X GET https://ocr-extraction.com/api/cron/daily-login-report \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Security Notes

1. **CRON_SECRET:** Keep this secret! It prevents unauthorized access to your cron endpoint.
2. **RESEND_API_KEY:** Never commit this to git. Always use environment variables.
3. **Rate Limits:** Resend has rate limits. The free tier allows 100 emails/day.

---

## Next Steps

1. ✅ Set up Resend API key
2. ✅ Add environment variables to Vercel
3. ✅ Verify domain in Resend
4. ✅ Deploy to Vercel
5. ✅ Test the endpoint
6. ✅ Wait for the first automated report tomorrow morning!

---

## Support

If you encounter any issues:
- Check Vercel logs
- Review Resend dashboard for email delivery status
- Verify all environment variables are set correctly
- Test the endpoint manually first

**Resend Documentation:** https://resend.com/docs
**Vercel Cron Documentation:** https://vercel.com/docs/cron-jobs
