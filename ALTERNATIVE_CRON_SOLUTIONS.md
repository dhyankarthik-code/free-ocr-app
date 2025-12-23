# Alternative: Supabase Edge Functions + pg_cron

If you prefer to use Supabase's built-in cron functionality instead of Vercel Cron, here's an alternative approach:

## Option 1: Supabase pg_cron (Recommended for Supabase)

### Step 1: Create the Email Function in Supabase

1. Go to your Supabase Dashboard → SQL Editor
2. Run this SQL to create a function that counts new logins:

```sql
-- Create a function to get daily login stats
CREATE OR REPLACE FUNCTION get_daily_login_stats()
RETURNS TABLE (
  new_logins_count bigint,
  login_details jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  yesterday_start timestamptz;
  today_start timestamptz;
BEGIN
  -- Calculate yesterday's date range
  yesterday_start := date_trunc('day', now() - interval '1 day');
  today_start := date_trunc('day', now());

  -- Get count and details
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as new_logins_count,
    jsonb_agg(
      jsonb_build_object(
        'email', u.email,
        'name', u.name,
        'lastLoginAt', u."lastLoginAt",
        'country', u.country,
        'city', u.city
      )
      ORDER BY u."lastLoginAt" DESC
    ) as login_details
  FROM "User" u
  WHERE u."lastLoginAt" >= yesterday_start 
    AND u."lastLoginAt" < today_start;
END;
$$;
```

### Step 2: Create Edge Function for Sending Emails

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Create a new edge function
supabase functions new daily-login-report
```

Then edit `supabase/functions/daily-login-report/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const ADMIN_EMAILS = [
  'admin@ocr-extraction.com',
  'karthi@ocr-extraction.com',
  'dhyan@ocr-extraction.com',
  'gajashree@ocr-extraction.com',
]

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get login stats from database function
    const { data, error } = await supabaseClient
      .rpc('get_daily_login_stats')

    if (error) throw error

    const { new_logins_count, login_details } = data[0]

    // Send emails using Resend
    const emailPromises = ADMIN_EMAILS.map(email =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'OCR Extraction Reports <reports@ocr-extraction.com>',
          to: email,
          subject: `Daily Login Report - ${new_logins_count} New Logins`,
          html: generateEmailHTML(new_logins_count, login_details),
        }),
      })
    )

    await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({ 
        success: true, 
        newLoginsCount: new_logins_count 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function generateEmailHTML(count: number, details: any) {
  // Same HTML template as in the Vercel version
  return `...` // Use the same HTML from route.ts
}
```

### Step 3: Deploy Edge Function

```bash
# Deploy the function
supabase functions deploy daily-login-report

# Set environment variables
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

### Step 4: Set up pg_cron

In Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run daily at 6 AM UTC
SELECT cron.schedule(
  'daily-login-report',
  '0 6 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://your-project-ref.supabase.co/functions/v1/daily-login-report',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job;
```

---

## Option 2: GitHub Actions (Free Alternative)

If you don't want to use Vercel Cron or Supabase pg_cron, you can use GitHub Actions:

Create `.github/workflows/daily-login-report.yml`:

```yaml
name: Daily Login Report

on:
  schedule:
    # Runs at 6:00 AM UTC every day
    - cron: '0 6 * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  send-report:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Login Report
        run: |
          curl -X GET https://ocr-extraction.com/api/cron/daily-login-report \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` to your GitHub repository secrets.

---

## Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Vercel Cron** | ✅ Native integration<br>✅ Easy setup<br>✅ Reliable | ❌ Requires Vercel Pro plan ($20/mo) |
| **Supabase pg_cron** | ✅ Free<br>✅ Database-native<br>✅ Very reliable | ❌ More complex setup<br>❌ Requires SQL knowledge |
| **GitHub Actions** | ✅ Completely free<br>✅ Easy to set up | ❌ Less reliable timing<br>❌ Requires public repo |

---

## Recommendation

- **If you're already on Vercel Pro:** Use Vercel Cron (main solution)
- **If you're on Vercel Hobby plan:** Use GitHub Actions or Supabase pg_cron
- **If you want the most reliable solution:** Supabase pg_cron

The main solution I provided uses Vercel Cron, which is the simplest and most integrated with your existing Next.js setup.
