#!/bin/bash
# ============================================
# BuildHaul Automated Deployment Helper
# Prepares everything for deployment
# ============================================

set -e

echo "🚀 BuildHaul Automated Deployment"
echo "======================================"
echo ""

# Step 1: Copy SQL to clipboard
echo "📋 Preparing SQL files for Supabase..."
echo ""
echo "SCHEMA.SQL copied to clipboard!"
cat /Users/allbots/buildhaul/supabase/schema.sql | pbcopy
echo ""
echo "✅ Ready to paste in Supabase SQL Editor"
echo ""
echo "Manual steps required:"
echo "1. Open: https://supabase.com/dashboard"
echo "2. Create new project 'buildhaul' (region: us-west-1)"
echo "3. Go to SQL Editor > New query"
echo "4. Paste (Cmd+V) and click Run"
echo "5. Verify 15 tables created in Table Editor"
echo ""
read -p "Press Enter when schema.sql is complete, then I'll copy seed.sql..."
echo ""

# Step 2: Copy seed data
echo "📋 Copying seed.sql to clipboard..."
cat /Users/allbots/buildhaul/supabase/seed.sql | pbcopy
echo "✅ SEED.SQL copied to clipboard!"
echo ""
echo "Manual steps:"
echo "1. In SQL Editor > New query"
echo "2. Paste (Cmd+V) and click Run"
echo "3. Verify Utah companies in Table Editor"
echo ""
read -p "Press Enter when seed data is loaded, then provide Supabase credentials..."
echo ""

# Step 3: Get credentials
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Supabase Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "In Supabase: Project Settings > API"
echo ""
read -p "Enter Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Enter anon public key (eyJ...): " SUPABASE_ANON
read -p "Enter service_role key (eyJ...): " SUPABASE_SERVICE
echo ""

# Step 4: Update local env
echo "✅ Updating .env.local..."
cat > /Users/allbots/buildhaul/.env.local << ENVEOF
# Supabase - Production
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE

# Mapbox (optional)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.placeholder

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
ENVEOF

echo "✅ Local environment configured!"
echo ""

# Step 5: Test local
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Test Locally"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Starting development server..."
echo "Open: http://localhost:3001"
echo ""
echo "Test: Register > Login > Browse loads"
echo ""
echo "Press Ctrl+C when ready to deploy to production"
echo ""
cd /Users/allbots/buildhaul
npm run dev

# Won't execute until dev server stopped
