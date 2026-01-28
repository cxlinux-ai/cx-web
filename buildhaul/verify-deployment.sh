#!/bin/bash
# ============================================
# BuildHaul Production Deployment Verification
# ============================================
set -e

BASE_URL="https://buildhaul-3sgwq2hvd-mikemmivipcoms-projects.vercel.app"

echo "🔄 Starting BuildHaul deployment verification..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================
# SECTION 1: Deployment Protection Check
# ============================================
echo "1️⃣  Checking deployment protection status..."

SIGNUP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/signup")

if [ "$SIGNUP_STATUS" = "401" ]; then
  echo "   ❌ BLOCKED: Deployment protection still enabled"
  echo "   └─ HTTP 401 Unauthorized"
  echo ""
  echo "🚨 Action Required:"
  echo "   Open: https://vercel.com/mikemmivipcoms-projects/buildhaul/settings/deployment-protection"
  echo "   Disable deployment protection and run this script again"
  echo ""
  exit 1
else
  echo "   ✅ Deployment protection disabled"
  echo "   └─ HTTP $SIGNUP_STATUS"
fi
echo ""

# ============================================
# SECTION 2: Core Routes Availability
# ============================================
echo "2️⃣  Testing core routes..."

declare -a ROUTES=(
  "/"
  "/login"
  "/register"
  "/dashboard"
  "/dashboard/available"
  "/dashboard/fleet"
  "/dashboard/earnings"
  "/dashboard/drivers"
)

for route in "${ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "301" ]; then
    echo "   ✅ $route → HTTP $STATUS"
  else
    echo "   ⚠️  $route → HTTP $STATUS"
  fi
done
echo ""

# ============================================
# SECTION 3: API Routes
# ============================================
echo "3️⃣  Testing API endpoints..."

declare -a API_ROUTES=(
  "/api/auth/signup"
  "/api/auth/login"
  "/api/driver/location"
  "/api/messages/send"
  "/api/retell/webhook"
)

for route in "${API_ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
  # API routes should return 400/405 (not 401) when called without auth
  if [ "$STATUS" = "400" ] || [ "$STATUS" = "405" ] || [ "$STATUS" = "422" ]; then
    echo "   ✅ $route → HTTP $STATUS (endpoint active)"
  elif [ "$STATUS" = "401" ]; then
    echo "   ⚠️  $route → HTTP 401 (auth required - expected)"
  else
    echo "   ⚠️  $route → HTTP $STATUS"
  fi
done
echo ""

# ============================================
# SECTION 4: Environment Variables
# ============================================
echo "4️⃣  Checking environment variables..."

echo "   Fetching homepage to check for Mapbox token..."
HOME_HTML=$(curl -s "$BASE_URL")

if echo "$HOME_HTML" | grep -q "pk.eyJ1"; then
  echo "   ✅ Mapbox token detected in page source"
elif echo "$HOME_HTML" | grep -q "pk.placeholder"; then
  echo "   ❌ Placeholder token found - real token not configured"
else
  echo "   ⚠️  Could not detect Mapbox token status"
fi
echo ""

# ============================================
# SECTION 5: Signup Flow Test
# ============================================
echo "5️⃣  Testing signup endpoint..."

TEST_EMAIL="verify-$(date +%s)@test.com"
SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"Test123!@#\",\"role\":\"driver\"}")

SIGNUP_STATUS=$(echo "$SIGNUP_RESPONSE" | tail -n1)
SIGNUP_BODY=$(echo "$SIGNUP_RESPONSE" | head -n-1)

if [ "$SIGNUP_STATUS" = "200" ] || [ "$SIGNUP_STATUS" = "201" ]; then
  echo "   ✅ Signup endpoint working"
  echo "   └─ HTTP $SIGNUP_STATUS"
elif [ "$SIGNUP_STATUS" = "400" ] || [ "$SIGNUP_STATUS" = "422" ]; then
  echo "   ✅ Signup endpoint reachable (validation working)"
  echo "   └─ HTTP $SIGNUP_STATUS: $SIGNUP_BODY"
else
  echo "   ⚠️  Signup returned HTTP $SIGNUP_STATUS"
  echo "   └─ Body: $SIGNUP_BODY"
fi
echo ""

# ============================================
# SECTION 6: Database Connection
# ============================================
echo "6️⃣  Verifying database connectivity..."

# Check if signup attempted to connect to database
if echo "$SIGNUP_BODY" | grep -qi "database\|supabase\|connection"; then
  echo "   ⚠️  Database connection issue detected"
  echo "   └─ Error: $SIGNUP_BODY"
else
  echo "   ✅ No database errors detected"
fi
echo ""

# ============================================
# SECTION 7: Real-time Features
# ============================================
echo "7️⃣  Checking Supabase configuration..."

# Test if Supabase URL is accessible
if grep -q "NEXT_PUBLIC_SUPABASE_URL" /Users/allbots/buildhaul/.env.local 2>/dev/null; then
  SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" /Users/allbots/buildhaul/.env.local | cut -d '=' -f2)
  SUPABASE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" 2>/dev/null || echo "000")

  if [ "$SUPABASE_STATUS" = "200" ]; then
    echo "   ✅ Supabase REST API accessible"
  else
    echo "   ⚠️  Supabase returned HTTP $SUPABASE_STATUS"
  fi
else
  echo "   ⚠️  Could not verify Supabase connectivity"
fi
echo ""

# ============================================
# SECTION 8: Build & Deployment Info
# ============================================
echo "8️⃣  Deployment information..."

# Get deployment info from Vercel
cd /Users/allbots/buildhaul
LATEST_DEPLOY=$(vercel ls 2>/dev/null | grep buildhaul | head -1 | awk '{print $1}')
if [ ! -z "$LATEST_DEPLOY" ]; then
  echo "   Latest deployment: $LATEST_DEPLOY"
  echo "   Production URL: $BASE_URL"
else
  echo "   ⚠️  Could not fetch deployment info"
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$SIGNUP_STATUS" = "401" ]; then
  echo "❌ DEPLOYMENT BLOCKED"
  echo "   └─ Deployment protection must be disabled"
  echo ""
  echo "Next step: Disable protection in Vercel dashboard"
  exit 1
else
  echo "✅ DEPLOYMENT ACCESSIBLE"
  echo ""
  echo "🎯 Ready for manual testing:"
  echo "   1. Visit: $BASE_URL"
  echo "   2. Test signup with new account"
  echo "   3. Login as company user"
  echo "   4. Navigate to /dashboard/fleet"
  echo "   5. Verify Mapbox map loads"
  echo "   6. Test GPS tracking features"
  echo ""
  echo "📋 Features to validate:"
  echo "   • Live Fleet Map (Mapbox)"
  echo "   • GPS Location Tracking"
  echo "   • Earnings Dashboard"
  echo "   • In-App Messaging"
  echo "   • Instant Payouts"
  echo "   • Recurring Loads"
  echo "   • Trusted Driver Network"
  echo ""
fi

echo "✅ Verification complete"
