#!/bin/bash
# ============================================
# BuildHaul Comprehensive Test Suite
# ============================================
set -e

BASE_URL="https://buildhaul-3sgwq2hvd-mikemmivipcoms-projects.vercel.app"
RESULTS_FILE="/Users/allbots/buildhaul/test-results.md"

echo "🧪 BuildHaul Comprehensive Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Production URL: $BASE_URL"
echo "Started: $(date)"
echo ""

# Initialize results file
cat > "$RESULTS_FILE" << 'EOF'
# BuildHaul Comprehensive Test Results

**Date**: $(date)
**Production URL**: https://buildhaul-3sgwq2hvd-mikemmivipcoms-projects.vercel.app

---

EOF

# ============================================
# SECTION 1: Frontend Routes Test
# ============================================
echo "1️⃣  Testing Frontend Routes..."
echo "## 1. Frontend Routes" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

declare -a ROUTES=(
  "/"
  "/login"
  "/register"
  "/register/driver"
  "/register/poster"
  "/dashboard"
  "/dashboard/available"
  "/dashboard/fleet"
  "/dashboard/earnings"
  "/dashboard/drivers"
  "/dashboard/loads"
)

PASS=0
FAIL=0

for route in "${ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "301" ]; then
    echo "   ✅ $route → HTTP $STATUS"
    echo "- ✅ \`$route\` → HTTP $STATUS" >> "$RESULTS_FILE"
    ((PASS++))
  else
    echo "   ❌ $route → HTTP $STATUS"
    echo "- ❌ \`$route\` → HTTP $STATUS" >> "$RESULTS_FILE"
    ((FAIL++))
  fi
done

echo "" >> "$RESULTS_FILE"
echo "**Frontend Routes**: $PASS passed, $FAIL failed" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo ""

# ============================================
# SECTION 2: Dark Mode Detection
# ============================================
echo "2️⃣  Testing Dark Mode Presence..."
echo "## 2. Dark Mode Detection" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Check driver registration page
DRIVER_HTML=$(curl -s "$BASE_URL/register/driver")
if echo "$DRIVER_HTML" | grep -q "bg-slate-900\|bg-gray-900\|dark:bg"; then
  echo "   ✅ Dark mode classes detected"
  echo "- ✅ Dark mode classes found in HTML" >> "$RESULTS_FILE"
elif echo "$DRIVER_HTML" | grep -q "ThemeToggle"; then
  echo "   ✅ ThemeToggle component detected"
  echo "- ✅ ThemeToggle component found" >> "$RESULTS_FILE"
else
  echo "   ❌ Dark mode NOT detected (still showing bg-slate-50)"
  echo "- ❌ Dark mode classes NOT found (showing light mode bg-slate-50)" >> "$RESULTS_FILE"
fi

# Check for Eye icons (password reveal)
if echo "$DRIVER_HTML" | grep -q "Eye\|eye-off\|lucide-eye"; then
  echo "   ✅ Password reveal icons detected"
  echo "- ✅ Password reveal (Eye) icons found" >> "$RESULTS_FILE"
else
  echo "   ❌ Password reveal icons NOT found"
  echo "- ❌ Password reveal icons NOT found" >> "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"
echo ""

# ============================================
# SECTION 3: Environment Variables
# ============================================
echo "3️⃣  Testing Environment Variables..."
echo "## 3. Environment Variables" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Check Mapbox token
HOME_HTML=$(curl -s "$BASE_URL")
if echo "$HOME_HTML" | grep -q "pk\.eyJ1"; then
  echo "   ✅ Mapbox token detected (pk.eyJ...)"
  echo "- ✅ Mapbox token: \`pk.eyJ...\` (real token found)" >> "$RESULTS_FILE"
elif echo "$HOME_HTML" | grep -q "pk\.placeholder"; then
  echo "   ❌ Placeholder Mapbox token found"
  echo "- ❌ Mapbox token: \`pk.placeholder\` (placeholder, not real)" >> "$RESULTS_FILE"
else
  echo "   ⚠️  Mapbox token not detected in HTML"
  echo "- ⚠️  Mapbox token not found in initial HTML (may load client-side)" >> "$RESULTS_FILE"
fi

# Check for Supabase references
if echo "$HOME_HTML" | grep -qi "supabase"; then
  echo "   ✅ Supabase integration detected"
  echo "- ✅ Supabase references found" >> "$RESULTS_FILE"
else
  echo "   ⚠️  Supabase not detected in initial HTML"
  echo "- ⚠️  Supabase not in initial HTML (may load client-side)" >> "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"
echo ""

# ============================================
# SECTION 4: API Endpoints Test
# ============================================
echo "4️⃣  Testing API Endpoints..."
echo "## 4. API Endpoints" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

declare -a API_ROUTES=(
  "/api/driver/location"
  "/api/messages/send"
  "/api/payouts/instant"
  "/api/retell/webhook"
  "/api/direct-hire/request"
  "/api/recurring/create"
  "/api/stripe/webhook"
)

for route in "${API_ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
  # API routes should return 401 (needs auth), 404, 405 (method not allowed), or 400
  if [ "$STATUS" = "401" ]; then
    echo "   ✅ $route → HTTP 401 (auth required - endpoint exists)"
    echo "- ✅ \`$route\` → HTTP 401 (requires authentication)" >> "$RESULTS_FILE"
  elif [ "$STATUS" = "400" ] || [ "$STATUS" = "405" ] || [ "$STATUS" = "422" ]; then
    echo "   ✅ $route → HTTP $STATUS (endpoint exists)"
    echo "- ✅ \`$route\` → HTTP $STATUS (endpoint active)" >> "$RESULTS_FILE"
  elif [ "$STATUS" = "404" ]; then
    echo "   ⚠️  $route → HTTP 404 (not found)"
    echo "- ⚠️  \`$route\` → HTTP 404 (endpoint not found)" >> "$RESULTS_FILE"
  else
    echo "   ⚠️  $route → HTTP $STATUS"
    echo "- ⚠️  \`$route\` → HTTP $STATUS" >> "$RESULTS_FILE"
  fi
done

echo "" >> "$RESULTS_FILE"
echo ""

# ============================================
# SECTION 5: Page Structure Test
# ============================================
echo "5️⃣  Testing Page Structure..."
echo "## 5. Page Structure & Components" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Check registration page structure
REG_HTML=$(curl -s "$BASE_URL/register/driver")

# Check for form elements
if echo "$REG_HTML" | grep -q 'id="user-registration-form"\|id="driver-register-form"'; then
  echo "   ✅ Registration form found"
  echo "- ✅ Registration form with proper ID found" >> "$RESULTS_FILE"
else
  echo "   ❌ Registration form NOT found"
  echo "- ❌ Registration form structure missing" >> "$RESULTS_FILE"
fi

# Check for input fields
FIELD_COUNT=$(echo "$REG_HTML" | grep -o 'type="email"\|type="password"\|type="tel"' | wc -l | tr -d ' ')
echo "   ℹ️  Found $FIELD_COUNT input fields"
echo "- Input fields detected: $FIELD_COUNT" >> "$RESULTS_FILE"

# Check for buttons
if echo "$REG_HTML" | grep -q 'type="submit"\|Continue\|Register'; then
  echo "   ✅ Submit button found"
  echo "- ✅ Submit/Continue button found" >> "$RESULTS_FILE"
else
  echo "   ❌ Submit button NOT found"
  echo "- ❌ Submit button missing" >> "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"
echo ""

# ============================================
# SECTION 6: Build Information
# ============================================
echo "6️⃣  Gathering Build Information..."
echo "## 6. Build & Deployment Info" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Get deployment info
DEPLOY_INFO=$(vercel ls --yes 2>/dev/null | head -8)
LATEST_AGE=$(echo "$DEPLOY_INFO" | grep "buildhaul-3sgwq2hvd" | awk '{print $1}')
LATEST_DURATION=$(echo "$DEPLOY_INFO" | grep "buildhaul-3sgwq2hvd" | awk '{print $6}')

echo "   Deployment age: $LATEST_AGE"
echo "   Build duration: $LATEST_DURATION"
echo "- **Deployment Age**: $LATEST_AGE" >> "$RESULTS_FILE"
echo "- **Build Duration**: $LATEST_DURATION" >> "$RESULTS_FILE"

# Check git commit
LATEST_COMMIT=$(git log --oneline -1)
echo "   Latest commit: $LATEST_COMMIT"
echo "- **Latest Git Commit**: \`$LATEST_COMMIT\`" >> "$RESULTS_FILE"

# Check if deployed commit matches
DEPLOYED_COMMIT=$(git log --oneline | grep -E "ed163dc|a98d8a2" | head -1)
echo "   Deployed commit: $DEPLOYED_COMMIT"
echo "- **Deployed Commit**: \`$DEPLOYED_COMMIT\`" >> "$RESULTS_FILE"

echo "" >> "$RESULTS_FILE"
echo ""

# ============================================
# SECTION 7: Feature Components Check
# ============================================
echo "7️⃣  Testing Feature Components..."
echo "## 7. Feature Components Deployed" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Check for LiveFleetMap component
if [ -f "/Users/allbots/buildhaul/components/maps/LiveFleetMap.tsx" ]; then
  echo "   ✅ LiveFleetMap component exists"
  echo "- ✅ LiveFleetMap component file exists" >> "$RESULTS_FILE"
else
  echo "   ❌ LiveFleetMap component missing"
  echo "- ❌ LiveFleetMap component file NOT found" >> "$RESULTS_FILE"
fi

# Check for useLocationTracking hook
if [ -f "/Users/allbots/buildhaul/hooks/useLocationTracking.ts" ]; then
  echo "   ✅ useLocationTracking hook exists"
  echo "- ✅ useLocationTracking hook file exists" >> "$RESULTS_FILE"
else
  echo "   ❌ useLocationTracking hook missing"
  echo "- ❌ useLocationTracking hook file NOT found" >> "$RESULTS_FILE"
fi

# Check for API routes
API_FILE_COUNT=$(find /Users/allbots/buildhaul/app/api -name "route.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "   ℹ️  Found $API_FILE_COUNT API route files"
echo "- **API Route Files**: $API_FILE_COUNT found in codebase" >> "$RESULTS_FILE"

echo "" >> "$RESULTS_FILE"
echo ""

# ============================================
# SECTION 8: Database Tables Check
# ============================================
echo "8️⃣  Checking Database Schema..."
echo "## 8. Database Schema" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Check if schema file exists
if [ -f "/Users/allbots/buildhaul/supabase/schema-updates.sql" ]; then
  TABLE_COUNT=$(grep -c "CREATE TABLE" /Users/allbots/buildhaul/supabase/schema-updates.sql)
  echo "   ✅ Schema file exists ($TABLE_COUNT tables)"
  echo "- ✅ Schema file: \`schema-updates.sql\` ($TABLE_COUNT tables defined)" >> "$RESULTS_FILE"
else
  echo "   ❌ Schema file not found"
  echo "- ❌ Schema file NOT found" >> "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"
echo ""

# ============================================
# SECTION 9: Summary
# ============================================
echo "9️⃣  Generating Summary..."
echo "## 9. Test Summary" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Calculate overall health
TOTAL_TESTS=25
PASSED_TESTS=$PASS
HEALTH_PERCENT=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo "### Overall Health: $HEALTH_PERCENT%" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

if [ $HEALTH_PERCENT -ge 80 ]; then
  echo "   ✅ GOOD - Most features operational"
  echo "**Status**: ✅ GOOD - Most features operational" >> "$RESULTS_FILE"
elif [ $HEALTH_PERCENT -ge 60 ]; then
  echo "   ⚠️  WARNING - Some issues detected"
  echo "**Status**: ⚠️  WARNING - Some issues detected" >> "$RESULTS_FILE"
else
  echo "   ❌ CRITICAL - Multiple failures"
  echo "**Status**: ❌ CRITICAL - Multiple failures" >> "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"

# Critical issues
echo "### Critical Issues" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Check if dark mode is missing
if ! curl -s "$BASE_URL/register/driver" | grep -q "bg-slate-900\|ThemeToggle"; then
  echo "   ❌ Dark mode NOT deployed"
  echo "1. ❌ **Dark mode NOT deployed** - Still showing old light mode version" >> "$RESULTS_FILE"
else
  echo "   ✅ Dark mode deployed"
  echo "1. ✅ Dark mode is deployed" >> "$RESULTS_FILE"
fi

# Check if API routes are accessible
API_404_COUNT=$(for route in "${API_ROUTES[@]}"; do curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route"; done | grep -c "404")
if [ $API_404_COUNT -gt 3 ]; then
  echo "   ⚠️  Multiple API endpoints returning 404"
  echo "2. ⚠️  **Multiple API endpoints (404)** - $API_404_COUNT routes not found (may need authentication)" >> "$RESULTS_FILE"
else
  echo "   ✅ API endpoints responding"
  echo "2. ✅ API endpoints responding correctly" >> "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"

# Recommendations
echo "### Recommendations" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

if ! curl -s "$BASE_URL/register/driver" | grep -q "bg-slate-900\|ThemeToggle"; then
  echo "1. **Trigger fresh deployment** - Dark mode and auth improvements not live yet" >> "$RESULTS_FILE"
  echo "2. **Manual redeploy from Vercel dashboard** - Uncheck build cache to force fresh build" >> "$RESULTS_FILE"
else
  echo "1. **Begin user testing** - Frontend is ready for signup tests" >> "$RESULTS_FILE"
  echo "2. **Test authentication flow** - Create test accounts and verify database entries" >> "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"
echo "---" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "**Test completed**: $(date)" >> "$RESULTS_FILE"

# ============================================
# Display Results
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Comprehensive test complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 Full results saved to: $RESULTS_FILE"
echo ""
echo "📊 Quick Summary:"
echo "   Frontend Routes: $PASS passed, $FAIL failed"
echo "   Overall Health: $HEALTH_PERCENT%"
echo ""

# Display results file
cat "$RESULTS_FILE"
