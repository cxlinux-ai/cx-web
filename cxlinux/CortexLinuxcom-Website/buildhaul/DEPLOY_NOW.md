# Deploy BuildHaul - Quick Start

**Time Required**: 25 minutes  
**Current Status**: Code ready, database needed

---

## 🎯 Three Steps to Launch

### STEP 1: Create Supabase Project (5 min)

1. Open: **https://supabase.com/dashboard**
2. Click **"New Project"**
3. Settings:
   - Name: `buildhaul`
   - Database Password: Generate strong password (SAVE IT!)
   - Region: `us-west-1` (closest to Utah)
   - Plan: Free
4. Click **"Create new project"** (~2 min to provision)

---

### STEP 2: Load Database (10 min)

**Run Schema (creates 15 tables):**

```bash
# Copy schema to clipboard
cat /Users/allbots/buildhaul/supabase/schema.sql | pbcopy
```

Then in Supabase:
1. Click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste (Cmd+V)
4. Click **"Run"** (bottom right)
5. Wait for "Success. No rows returned"
6. Verify: **Table Editor** → should see 15 tables

**Run Seed Data (Utah companies):**

```bash
# Copy seed data to clipboard
cat /Users/allbots/buildhaul/supabase/seed.sql | pbcopy
```

Then in Supabase:
1. SQL Editor → **"New query"**
2. Paste (Cmd+V)
3. Click **"Run"**
4. Look for "BuildHaul seed data loaded successfully"
5. Verify: **Table Editor** → `companies` → see 5 Utah companies

---

### STEP 3: Deploy to Production (10 min)

**Get Supabase Credentials:**

In Supabase Dashboard:
1. Click **Project Settings** (gear icon)
2. Click **API**
3. Copy these 3 values:
   - **Project URL**: `https://[your-ref].supabase.co`
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

**Update Local Environment:**

```bash
cd /Users/allbots/buildhaul

# Edit .env.local and replace placeholders with your actual values
nano .env.local
# Or use your preferred editor
```

Replace these lines:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-actual-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-actual-anon-key]
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-actual-service-key]
```

**Test Locally:**

```bash
npm run dev
# Open http://localhost:3001
# Try: Register → Login → Browse loads
# Press Ctrl+C when satisfied
```

**Update Vercel & Deploy:**

```bash
# Remove old placeholder values
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env rm SUPABASE_SERVICE_ROLE_KEY production

# Add your real values
echo "https://[your-ref].supabase.co" > /tmp/e
vercel env add NEXT_PUBLIC_SUPABASE_URL production < /tmp/e

echo "eyJ[your-anon-key]" > /tmp/e
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < /tmp/e

echo "eyJ[your-service-key]" > /tmp/e
vercel env add SUPABASE_SERVICE_ROLE_KEY production < /tmp/e

rm /tmp/e

# Deploy to production
vercel deploy --prod
```

**Verify deployment:**
- Visit the Vercel URL provided
- Test registration and login
- Verify loads are visible

---

## ✅ You're Live!

**Production**: Your Vercel deployment URL  
**Database**: Your Supabase project  
**Repository**: https://github.com/mikejmorgan-ai/buildhaul

---

## 🔧 Optional: Add Later

**Stripe Connect** (for payments):
1. Create account: https://dashboard.stripe.com
2. Get test API keys
3. Add to Vercel env vars

**Mapbox** (for live maps):
1. Create account: https://account.mapbox.com
2. Get access token
3. Add `NEXT_PUBLIC_MAPBOX_TOKEN` to env vars

**Custom Domain**:
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records

---

**Start here**: https://supabase.com/dashboard
