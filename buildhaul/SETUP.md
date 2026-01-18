# BuildHaul Setup Guide

Complete step-by-step setup instructions for BuildHaul.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Mapbox account (free tier works)
- Stripe account (optional for now, needed for payments)

## Step 1: Install Dependencies

\`\`\`bash
cd /Users/allbots/buildhaul
npm install
\`\`\`

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "buildhaul" (or your preference)
4. Set a secure database password
5. Choose region closest to you
6. Wait for project to provision (~2 minutes)

### 2.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `/Users/allbots/buildhaul/supabase/schema.sql`
4. Paste into SQL Editor
5. Click "Run" (takes ~10 seconds)
6. Verify success: Check "Table Editor" - you should see 10 tables

### 2.3 (Optional) Load Seed Data

1. In SQL Editor, create new query
2. Copy contents of `/Users/allbots/buildhaul/supabase/seed.sql`
3. Paste and run
4. Note: You'll need to create actual auth users first, then update the placeholder UUIDs

### 2.4 Get Supabase Credentials

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL**: https://xxxxx.supabase.co
   - **anon/public key**: eyJhbG... (long string)
3. Go to **Settings → API → Service Role**
   - Copy **service_role key** (KEEP SECRET!)

## Step 3: Get Mapbox Token

1. Go to [https://mapbox.com](https://mapbox.com)
2. Sign up / Log in
3. Go to **Account → Access Tokens**
4. Click "Create a token"
5. Name: "buildhaul"
6. Scopes: Keep defaults (all public scopes checked)
7. Copy the token (starts with `pk.`)

## Step 4: Configure Environment Variables

1. Copy the example file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Edit `.env.local` with your credentials:

\`\`\`env
# Supabase (from Step 2.4)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...your-service-role-key

# Mapbox (from Step 3)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...your-mapbox-token

# Stripe (optional for now - use test keys)
STRIPE_SECRET_KEY=sk_test_your-stripe-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## Step 5: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Server starts on [http://localhost:3000](http://localhost:3000)

## Step 6: Create Test Accounts

### Create a Poster Account

1. Go to http://localhost:3000
2. Click "Post a Load"
3. Click "Sign up"
4. Click "Register as Company"
5. Fill out form:
   - Full Name: Test Poster
   - Phone: 801-555-0100
   - Email: poster@test.com
   - Password: testpass123
6. Complete company registration:
   - Company Name: Test Construction Co
   - Business Type: General Contractor
   - Address, City, State, ZIP
   - Phone & Email

### Create a Driver Account

1. Open new incognito/private window
2. Go to http://localhost:3000
3. Click "Drive with BuildHaul"
4. Click "Register as Driver"
5. Fill out form:
   - Full Name: Test Driver
   - Phone: 801-555-0200
   - Email: driver@test.com
   - Password: testpass123
6. Complete driver profile:
   - Address, City, State, ZIP
   - CDL Number: CDL123456
   - CDL State: UT
   - CDL Expiry: (future date)
   - Years Experience: 5
   - Service Radius: 50 miles

## Step 7: Test Core Functionality

### As Poster:
1. Dashboard should show empty state
2. Click "Post New Load" (note: form is not yet built)
3. Navigate sidebar links

### As Driver:
1. Dashboard should show available loads
2. Browse loads list
3. Try clicking "View Details" (note: detail page not yet built)

## Verification Checklist

- ✅ Landing page loads with marketing content
- ✅ Login page works
- ✅ Registration flows work (poster & driver)
- ✅ Poster dashboard shows stats
- ✅ Driver dashboard shows available loads
- ✅ Sidebar navigation works
- ✅ User menu works (profile, settings, sign out)
- ⏳ Load creation form (not yet built)
- ⏳ Load detail pages (not yet built)
- ⏳ Bidding system (not yet built)
- ⏳ Payment processing (not yet built)

## Troubleshooting

### "Could not connect to Supabase"
- Verify NEXT_PUBLIC_SUPABASE_URL is correct (no trailing slash)
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
- Check Supabase project is active (not paused)

### "Schema error" or missing tables
- Rerun schema.sql in Supabase SQL Editor
- Check for SQL errors in console
- Verify all 10 tables exist in Table Editor

### "Invalid token" or auth errors
- Clear browser cookies/localStorage
- Try creating new user with different email
- Check Supabase Auth settings allow email signup

### Next.js build errors
- Run \`npm install\` again
- Delete \`.next\` folder and rebuild
- Check Node.js version (must be 18+)

### "Port 3000 in use"
- Another Next.js app is running
- Kill it: \`npx kill-port 3000\`
- Or use different port: \`npm run dev -- -p 3001\`

## Next Steps

See \`README.md\` for:
- Project structure
- Features to complete
- Development roadmap
- Deployment instructions

## Support

Questions? Create an issue or email support@buildhaul.com
