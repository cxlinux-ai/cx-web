# BuildHaul Supabase Setup - Complete Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name**: buildhaul
   - **Database Password**: (generate strong password - save this!)
   - **Region**: Select closest to Utah (us-west-1 or us-west-2)
   - **Pricing Plan**: Free tier is fine for MVP
4. Click "Create new project" (takes ~2 minutes to provision)

## Step 2: Run Database Schema

1. In Supabase Dashboard, click "SQL Editor" in left sidebar
2. Click "New query"
3. Copy the ENTIRE contents of `/Users/allbots/buildhaul/supabase/schema.sql`
4. Paste into SQL Editor
5. Click "Run" (bottom right)
6. Wait for "Success. No rows returned" message
7. Verify tables created: Go to "Table Editor" - you should see 15 tables

## Step 3: Run Seed Data

1. In SQL Editor, click "New query"
2. Copy the ENTIRE contents of `/Users/allbots/buildhaul/supabase/seed.sql`
3. Paste into SQL Editor
4. Click "Run"
5. You should see message: "BuildHaul seed data loaded successfully"
6. Verify data: Go to "Table Editor" > "companies" - should see 5 Utah companies

## Step 4: Get Project Credentials

1. In Supabase Dashboard, click "Project Settings" (gear icon in sidebar)
2. Click "API" in settings menu
3. Copy the following:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **anon/public key**: (starts with `eyJ...`)
   - **service_role key**: (starts with `eyJ...` - keep secret!)

## Step 5: Update Environment Variables

### Local Development (.env.local):
```bash
cd /Users/allbots/buildhaul

# Update .env.local with real Supabase credentials
cat > .env.local << 'ENVEOF'
# Supabase - REPLACE WITH YOUR ACTUAL VALUES
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-service-role-key]

# Mapbox (optional - has fallback)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.placeholder

# Stripe (get from stripe.com/dashboard)
STRIPE_SECRET_KEY=sk_test_[your-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
ENVEOF
```

### Vercel Production:
```bash
# Update Vercel environment variables (replace placeholders with real values)
echo "https://[your-project-ref].supabase.co" > /tmp/env_val && vercel env add NEXT_PUBLIC_SUPABASE_URL production < /tmp/env_val
echo "eyJ[your-anon-key]" > /tmp/env_val && vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < /tmp/env_val
echo "eyJ[your-service-role-key]" > /tmp/env_val && vercel env add SUPABASE_SERVICE_ROLE_KEY production < /tmp/env_val
```

## Step 6: Test Local Development

```bash
cd /Users/allbots/buildhaul
npm run dev
```

Open http://localhost:3001 and:
1. Click "Get Started" → "I'm a Driver" or "I'm a Company"
2. Try registering an account
3. Login and explore the seeded data

## Step 7: Redeploy to Vercel

After updating Vercel environment variables:
1. Go to https://vercel.com/mikemmivipcoms-projects/buildhaul/deployments
2. Click "Redeploy" on latest deployment
3. Wait for build to complete
4. Visit your production URL

## Verification Checklist

- [ ] Supabase project created
- [ ] Schema.sql executed successfully (15 tables created)
- [ ] Seed.sql executed successfully (companies, drivers, loads visible)
- [ ] Local .env.local updated with real credentials
- [ ] Vercel environment variables updated
- [ ] Local development server runs (`npm run dev`)
- [ ] Can register/login locally
- [ ] Vercel production redeployed
- [ ] Production site loads without errors

## Troubleshooting

**"Invalid supabaseUrl" error:**
- Make sure URL starts with `https://` and ends with `.supabase.co`
- No trailing slash

**"Invalid API key" error:**
- Keys must start with `eyJ`
- Don't add quotes around keys in .env.local
- Make sure you copied the full key (they're very long)

**Tables not visible after schema.sql:**
- Check for errors in SQL Editor output
- Make sure you ran the ENTIRE schema.sql file
- Try running in smaller sections if needed

**No seed data after seed.sql:**
- Make sure schema.sql ran first
- Check that all 15 tables exist before running seed
- Look for constraint violation errors in output

## Quick Commands Reference

```bash
# Start local development
npm run dev

# Update Vercel env var
echo "value" > /tmp/env_val && vercel env add VAR_NAME production < /tmp/env_val

# View Vercel env vars
vercel env ls

# Redeploy Vercel
vercel deploy --prod

# Check Supabase tables
# Go to: https://supabase.com/dashboard → Table Editor
```

## Next Steps After Setup

1. Configure Stripe Connect for payments
2. Add Mapbox token for live maps (optional)
3. Test complete user flows:
   - Company posts load
   - Driver accepts/bids
   - Status updates through delivery
4. Set up Stripe webhooks pointing to your Vercel URL
5. Consider upgrading Supabase plan if scaling beyond free tier limits
