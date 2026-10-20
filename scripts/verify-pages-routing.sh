#!/usr/bin/env bash
# Smoke-test Cloudflare Pages routing (run against wrangler pages dev or preview origin).
set -euo pipefail
BASE="${1:-http://127.0.0.1:8788}"
INDEX="${2:-dist/public/index.html}"

echo "=== Pages routing safety check ==="
echo "Origin: $BASE"
echo ""

JS=$(grep -oE '/assets/[^"'\'' ]+\.js' "$INDEX" | head -1)
CSS=$(grep -oE '/assets/[^"'\'' ]+\.css' "$INDEX" | head -1)

check() {
  local label="$1"
  local path="$2"
  local expect="${3:-200}"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" -L "$BASE$path")
  local ok="ok"
  if [[ "$code" != "$expect" ]]; then ok="FAIL (expected $expect)"; fi
  printf "%-42s %s  %s\n" "$label" "$code" "$ok"
}

check "Home /" "/" 200
check "SPA /pricing" "/pricing" 200
check "SPA /getting-started" "/getting-started" 200
check "SPA blog post" "/blog/what-is-cx-linux" 200
check "SPA checkout" "/pricing/checkout?plan=pro&billing=monthly" 200
check "SPA success (Stripe return)" "/pricing/success?session_id=test" 200
check "SPA cancel return URL" "/pricing/checkout?plan=pro&billing=monthly" 200
check "Junk path" "/this-path-does-not-exist-junk" 404
check "Built JS bundle" "$JS" 200
check "Built CSS bundle" "$CSS" 200
check "favicon.svg" "/favicon.svg" 200
check "og-image.png" "/og-image.png" 200
check "sitemap.xml" "/sitemap.xml" 200
check "robots.txt" "/robots.txt" 200
check "blog/rss.xml" "/blog/rss.xml" 200
check "image under /images" "/images/cx-linux-vs-ubuntu-ai-workloads.jpg" 200
check "/api (not on Pages)" "/api/health" 404
check "/functions (not on Pages)" "/functions/foo" 404

echo ""
echo "Asset paths from index.html:"
echo "  JS:  $JS"
echo "  CSS: $CSS"
