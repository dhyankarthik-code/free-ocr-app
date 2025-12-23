# Daily Login Report Automation - Hybrid Setup Guide (Vercel + Zapier)

## Overview
This automation sends daily email reports to your admin team using a hybrid approach:
1. **Vercel Cron**: Triggers every day at 6:00 AM IST to query the database and format the data.
2. **Zapier Webhook**: Receives the data from Vercel and sends the actual email via your preferred provider (Zoho, Gmail, etc.).

**Schedule:** Every day at 6:00 AM IST (00:30 UTC)

---

## Setup Instructions

### 1. Create Zapier Webhook (Catch Hook)

1. Go to **Zapier** and create a new Zap.
2. **Trigger**: Select **"Webhooks by Zapier"**.
3. **Event**: Select **"Catch Hook"**.
4. Click **Continue** and copy your **Webhook URL**.
   - *Example: `https://hooks.zapier.com/hooks/catch/xxxxxx/yyyyyy/`*

### 2. Configure Vercel Environment Variables

Add these to your **Vercel Project Settings** → **Environment Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `CRON_SECRET` | `my-temp-secret-123` | Used for security between Vercel and Zapier |
| `ZAPIER_WEBHOOK_URL` | *[Your Zapier URL]* | The Switcher Hook URL from Step 1 |

### 3. Deploy to Vercel

```bash
git add .
git commit -m "feat: setup hybrid login report automation"
git push
```

### 4. Test the Hook in Zapier

1. In Zapier, click **"Test trigger"**.
2. Manually trigger the Vercel endpoint to send data:
   ```bash
   curl "https://ocr-extraction.com/api/cron/daily-login-report" \
     -H "Authorization: Bearer my-temp-secret-123"
   ```
3. Zapier should receive the data with `totalLogins`, `logins` (array), and `recipients`.

### 5. Configure Zapier Email Action

1. Add a second step in Zapier (e.g., **Zoho Mail** or **Gmail**).
2. **Event**: "Send Email".
3. **Recipient**: Use the `recipients` field from the webhook (contains all 4 admin emails).
4. **Subject**: `Daily Login Report: {{totalLogins}} New Logins`
5. **Body**: Use the HTML provided in the `implementation_plan.md` or design your own using the fields from the `logins` array.

---

## How It Works

1. **Daily at 6:00 AM IST**: Vercel triggers the cron job.
2. **Processing**: The API queries your database for logins in the last 24 hours.
3. **Transfer**: Vercel sends the data to your `ZAPIER_WEBHOOK_URL`.
4. **Delivery**: Zapier receives it and sends the email instantly.

---

## Verification

You can always manually trigger a report by hitting the URL with the `Authorization` header:
`https://ocr-extraction.com/api/cron/daily-login-report`

Monitoring is available in your **Vercel Dashboard → Logs**.
