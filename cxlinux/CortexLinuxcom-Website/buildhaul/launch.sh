#!/bin/bash
# ============================================
# BuildHaul Launch Script
# Walks you through final deployment steps
# ============================================

set -e

echo "🚀 BuildHaul Launch Assistant"
echo "======================================"
echo ""
echo "This script will guide you through the final steps to launch BuildHaul."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "supabase" ]; then
  echo "❌ Error: Please run this script from /Users/allbots/buildhaul"
  exit 1
fi

echo "Current Status:"
echo "✅ Application built (17,287+ lines of code)"
echo "✅ GitHub repository: https://github.com/mikejmorgan-ai/buildhaul"
echo "✅ Vercel project created"
echo "⚠️  Supabase database pending"
echo ""

# Step 1: Supabase
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Create Supabase Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need to create a Supabase project manually."
echo ""
echo "1. Open: https://supabase.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Name: buildhaul"
echo "4. Region: us-west-1 (closest to Utah)"
echo "5. Generate strong database password (save it!)"
echo "6. Click 'Create new project'"
echo ""
read -p "Press Enter when your Supabase project is created..."

# Step 2: Run SQL
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Run Database SQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now you need to run the SQL files in Supabase."
echo ""
echo "First, let's copy schema.sql to your clipboard:"
echo ""
read -p "Press Enter to copy schema.sql..."
cat supabase/schema.sql | pbcopy
echo "✅ schema.sql copied to clipboard!"
echo ""
echo "Now:"
echo "1. In Supabase dashboard, click 'SQL Editor' in sidebar"
echo "2. Click 'New query'"
echo "3. Paste (Cmd+V) the schema"
echo "4. Click 'Run' (bottom right)"
echo "5. Wait for 'Success. No rows returned'"
echo "6. Go to 'Table Editor' - verify 15 tables exist"
echo ""
read -p "Press Enter when schema.sql is complete..."

echo ""
echo "Great! Now let's copy seed.sql:"
echo ""
read -p "Press Enter to copy seed.sql..."
cat supabase/seed.sql | pbcopy
echo "✅ seed.sql copied to clipboard!"
echo ""
echo "Now:"
echo "1. In SQL Editor, click 'New query'"
echo "2. Paste (Cmd+V) the seed data"
echo "3. Click 'Run'"
echo "4. Look for 'BuildHaul seed data loaded successfully'"
echo "5. Go to Table Editor > 'companies' - verify 5 Utah companies"
echo ""
read -p "Press Enter when seed.sql is complete..."

# Step 3: Get credentials
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Get Supabase Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "In Supabase dashboard:"
echo "1. Click 'Project Settings' (gear icon)"
echo "2. Click 'API' in the settings menu"
echo "3. Copy the following values:"
echo ""
read -p "Enter your Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Enter your anon public key (starts with eyJ): " SUPABASE_ANON_KEY
read -p "Enter your service_role key (starts with eyJ): " SUPABASE_SERVICE_KEY
echo ""

# Step 4: Update local env
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Update Local Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Updating .env.local with your Supabase credentials..."

cat > .env.local << ENVEOF
# Supabase - Production
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Mapbox (optional - has fallback)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.placeholder

# Stripe (optional - can add later)
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
ENVEOF

echo "✅ .env.local updated!"
echo ""

# Step 5: Test local
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Test Local Development"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Let's start the development server to test..."
echo ""
read -p "Press Enter to start npm run dev..."

echo ""
echo "Starting development server..."
echo "Open: http://localhost:3001"
echo ""
echo "Test:"
echo "1. Landing page loads"
echo "2. Click 'Get Started'"
echo "3. Try registering as Company or Driver"
echo "4. Login with your new account"
echo "5. Browse seeded Utah loads"
echo ""
echo "Press Ctrl+C to stop the server when done testing."
echo ""
npm run dev

# This won't execute until user stops dev server
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Deploy to Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Ready to update Vercel environment variables? (y/n): " deploy_confirm

if [ "$deploy_confirm" = "y" ]; then
  echo ""
  echo "Updating Vercel environment variables..."
  
  echo "$SUPABASE_URL" > /tmp/env_buildhaul
  vercel env rm NEXT_PUBLIC_SUPABASE_URL production 2>/dev/null || true
  vercel env add NEXT_PUBLIC_SUPABASE_URL production < /tmp/env_buildhaul
  
  echo "$SUPABASE_ANON_KEY" > /tmp/env_buildhaul
  vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production 2>/dev/null || true
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < /tmp/env_buildhaul
  
  echo "$SUPABASE_SERVICE_KEY" > /tmp/env_buildhaul
  vercel env rm SUPABASE_SERVICE_ROLE_KEY production 2>/dev/null || true
  vercel env add SUPABASE_SERVICE_ROLE_KEY production < /tmp/env_buildhaul
  
  rm /tmp/env_buildhaul
  
  echo ""
  echo "✅ Vercel environment variables updated!"
  echo ""
  echo "Deploying to production..."
  vercel deploy --prod
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 DEPLOYMENT COMPLETE!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Your BuildHaul marketplace is now live!"
  echo ""
  echo "Next steps:"
  echo "1. Visit your production URL"
  echo "2. Test registration and load flows"
  echo "3. Optional: Add Stripe Connect for payments"
  echo "4. Optional: Add Mapbox token for live maps"
  echo "5. Optional: Set up custom domain"
  echo ""
  echo "Documentation: /Users/allbots/buildhaul/FINAL_HANDOFF.md"
  echo ""
else
  echo ""
  echo "Skipping Vercel deployment."
  echo "You can deploy later with: vercel deploy --prod"
  echo ""
fi

echo "✅ Launch script complete!"
