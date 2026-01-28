# BuildHaul - Quick Start (5 Minutes)

Get BuildHaul running locally in 5 minutes.

## 1. Create Supabase Project (2 min)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `buildhaul`
   - Database Password: (create secure password)
   - Region: (closest to you)
4. Click "Create new project"
5. Wait ~2 minutes for provisioning

## 2. Run Database Schema (1 min)

1. In Supabase dashboard → **SQL Editor**
2. Click "New Query"
3. Open `/Users/allbots/buildhaul/supabase/schema.sql` on your computer
4. Copy entire file
5. Paste into SQL Editor
6. Click "Run"
7. Success ✓ (you'll see 10+ tables in Table Editor)

## 3. Get Credentials (30 sec)

1. Supabase dashboard → **Settings → API**
2. Copy:
   - Project URL
   - anon public key
   - service_role key (click "Reveal" then copy)

## 4. Configure App (1 min)

\`\`\`bash
cd /Users/allbots/buildhaul

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your credentials
# (Use nano, vim, or VS Code)
nano .env.local
\`\`\`

Paste your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
\`\`\`

For Mapbox (optional, can skip for now):
\`\`\`env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
\`\`\`

Save and exit (Ctrl+X, Y, Enter)

## 5. Start App (30 sec)

\`\`\`bash
npm run dev
\`\`\`

Opens at http://localhost:3001

## Test It Works

1. **Landing page loads** ✓
2. Click "Post a Load" → Register as Company
3. Fill out forms → Create account ✓
4. See poster dashboard ✓

Done! 🎉

## Next Steps

- Read `BUILT.md` for what's built
- Read `STATUS.md` for what to build next
- Read `SETUP.md` for detailed setup

## Troubleshooting

**"Could not connect"**:
- Check `.env.local` has correct Supabase URL (no trailing slash)
- Verify anon key is correct

**"No tables found"**:
- Rerun schema.sql in Supabase SQL Editor
- Check for errors in SQL output

**Port 3000 in use**:
- App automatically uses 3001 instead ✓
