#!/bin/bash
# ============================================
# SECTION: Copy SQL files to clipboard for Supabase
# ============================================
set -e

echo "📋 BuildHaul Supabase SQL File Helper"
echo "======================================"
echo ""
echo "This script helps you copy the SQL files to run in Supabase SQL Editor"
echo ""

# Function to copy to clipboard (macOS)
copy_to_clipboard() {
  if command -v pbcopy &> /dev/null; then
    cat "$1" | pbcopy
    echo "✅ Copied to clipboard!"
  else
    echo "⚠️  pbcopy not available. File path: $1"
  fi
}

echo "Which SQL file do you want to copy?"
echo ""
echo "1) schema.sql (run this FIRST - creates tables)"
echo "2) seed.sql (run this SECOND - adds Utah market data)"
echo ""
read -p "Enter choice (1-2): " choice

case $choice in
  1)
    echo ""
    echo "📄 Copying schema.sql to clipboard..."
    copy_to_clipboard "/Users/allbots/buildhaul/supabase/schema.sql"
    echo ""
    echo "Next steps:"
    echo "1. Go to Supabase Dashboard > SQL Editor"
    echo "2. Click 'New query'"
    echo "3. Paste (Cmd+V)"
    echo "4. Click 'Run'"
    echo "5. Verify 15 tables created in Table Editor"
    ;;
  2)
    echo ""
    echo "📄 Copying seed.sql to clipboard..."
    copy_to_clipboard "/Users/allbots/buildhaul/supabase/seed.sql"
    echo ""
    echo "Next steps:"
    echo "1. Make sure schema.sql was run first!"
    echo "2. Go to Supabase Dashboard > SQL Editor"
    echo "3. Click 'New query'"
    echo "4. Paste (Cmd+V)"
    echo "5. Click 'Run'"
    echo "6. Check Table Editor > companies table for 5 Utah companies"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Complete"
