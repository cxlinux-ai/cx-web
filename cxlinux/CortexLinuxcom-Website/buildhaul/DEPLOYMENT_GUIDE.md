# BuildHaul Sticky Features - Deployment Guide

**Version**: 4.0
**Status**: Advanced Features Complete - Ready for Database Migration
**Date**: January 17, 2026

---

## Implementation Summary

All 8 sticky features + advanced fleet tracking are now implemented with:
- ✅ Database schema (14 tables with triggers, RLS, PostGIS)
- ✅ Backend APIs (8 routes total)
- ✅ Frontend components (8 comprehensive components)
- ✅ Advanced Features: LiveFleetMap, Voice Integration, Compliance Docs
- ✅ Dependencies installed (mapbox-gl, recharts, date-fns)

---

## Critical Next Steps

### Step 1: Run Database Migrations

**IMPORTANT**: The backend APIs and frontend components require these new database tables.

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your BuildHaul project
3. Go to **SQL Editor**
4. Open the file: `/supabase/schema-updates.sql`
5. Copy the entire contents
6. Paste into SQL Editor
7. Click **Run**
8. Verify success (should see "Success. No rows returned")

**What this creates**:
- 14 new tables for sticky features (including compliance_documents, load_documents)
- PostGIS extension for geospatial queries
- Automatic triggers for earnings tracking
- Row Level Security policies for all tables
- Real-time subscription enablement
- Geofencing functions
- Driver location tracking columns (current_lat, current_lng)
- Load coordinate columns (pickup/delivery lat/lng)
- Notification preferences (push_token, notification_preferences)

---

### Step 2: Configure Environment Variables

Add these to your production environment (Vercel Dashboard > Settings > Environment Variables):

```bash
# Mapbox (Required for GPS tracking)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_access_token

# Twilio (Required for voice agent and SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: ElevenLabs (For advanced voice synthesis)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

**How to get these credentials**:

#### Mapbox Token
1. Sign up at https://account.mapbox.com/
2. Go to **Access tokens**
3. Create a new token with these scopes:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`
4. Copy the token (starts with `pk.`)

#### Twilio Credentials
1. Sign up at https://www.twilio.com/
2. Go to **Console Dashboard**
3. Find **Account SID** and **Auth Token**
4. Purchase a phone number with Voice + SMS capabilities

---

### Step 3: Test Features Locally

Before deploying, test each feature:

```bash
# Start local dev server
npm run dev

# Open http://localhost:3000
```

**Test checklist**:
- [ ] GPS tracking map loads with Mapbox
- [ ] In-app messaging sends and receives
- [ ] Instant payout button triggers Stripe flow
- [ ] Earnings dashboard loads with charts
- [ ] Recurring loads form submits
- [ ] Direct hire requests send
- [ ] Trusted drivers list loads

---

### Step 4: Deploy to Production

The code is already pushed to GitHub. Vercel should auto-deploy:

1. Check Vercel Dashboard: https://vercel.com/
2. Look for latest deployment
3. If not auto-deployed:
   - Click **Deployments** tab
   - Click **Redeploy** on latest
   - **Uncheck** "Use existing Build Cache"
   - Wait ~2-3 minutes

---

## Feature Usage Guide

### For Drivers

#### GPS Tracking
- Drivers' mobile app will send location updates every 30 seconds
- Updates sent to: `POST /api/location/update`
- Automatic geofencing triggers status updates at pickup/delivery

#### Instant Payouts
- Available after load completion
- 1.5% fee deducted from payout
- Funds arrive in 30 minutes to bank account
- Requires verified Stripe Connect account

#### Earnings Dashboard
- View daily/weekly/monthly earnings
- Track loads completed
- Monitor instant payout fees
- Charts show trends over time

### For Companies

#### Live GPS Map
```tsx
import { LiveMap } from '@/components/tracking/LiveMap'

<LiveMap
  assignmentId="load-assignment-uuid"
  pickupLat={40.7128}
  pickupLng={-74.0060}
  deliveryLat={34.0522}
  deliveryLng={-118.2437}
/>
```

#### Live Fleet Map (Advanced)
```tsx
import { LiveFleetMap } from '@/components/maps/LiveFleetMap'

<LiveFleetMap
  userRole="poster"
  companyId="company-uuid"
  showAvailableLoads={true}
  showActiveLoads={true}
  showDrivers={true}
  onLoadSelect={(load) => console.log('Selected:', load)}
  onDriverSelect={(driver) => console.log('Selected:', driver)}
/>
```

Features:
- Real-time map of all company loads and active drivers
- Color-coded load status markers (orange=available, blue=in progress, green=completed)
- Live driver location with truck icons
- Interactive load selection with detail panel
- Fleet stats dashboard (en route, at pickup, loading, delivered)
- Auto-refreshes every 30 seconds
- Accessible at `/dashboard/fleet` for company users

#### Voice Agent Integration

**POST /api/retell/webhook** - Handle completed voice calls

Supported call types:
1. **Post Load** - Companies call to post new loads
2. **Find Load** - Drivers call to search available loads
3. **Register Driver** - New drivers call to sign up

Example webhook payload:
```json
{
  "call_id": "retell_call_123",
  "from_number": "+1234567890",
  "transcript": "I need to post a load...",
  "custom_data": {
    "call_type": "post_load",
    "load_data": {
      "material_type": "Gravel",
      "weight_tons": 20,
      "pickup_location": "Salt Lake City",
      "delivery_location": "Provo",
      "rate_amount": 150
    }
  }
}
```

#### In-App Messaging
```tsx
import { ChatInterface } from '@/components/messaging/ChatInterface'

<ChatInterface
  conversationId="conversation-uuid"
  loadId="load-uuid"
/>
```

#### Recurring Loads
```tsx
import { RecurringLoadsManager } from '@/components/recurring/RecurringLoadsManager'

<RecurringLoadsManager />
```

#### Direct Hire
```tsx
import { DirectHireRequest } from '@/components/direct-hire/DirectHireRequest'

<DirectHireRequest
  loadId="load-uuid"
  driverId="driver-uuid"
  driverName="John Doe"
  suggestedAmount={500}
/>
```

#### Trusted Drivers
```tsx
import { TrustedDriversList } from '@/components/drivers/TrustedDriversList'

<TrustedDriversList companyId="company-uuid" />
```

---

## Success Metrics to Track

### Driver Retention
- **Instant payout usage**: Target 60%+
- **Drivers with 10+ loads**: Target 40%+
- **Preferred relationships**: Target 30%+

### Company Lock-In
- **Recurring loads**: Target 50%+
- **Companies with 3+ preferred drivers**: Target 35%+
- **In-app message usage**: Target 80%+ of loads

### Platform Stickiness
- **Daily active users (DAU)**: Target 40%+
- **Weekly recurring users**: Target 70%+
- **Monthly churn rate**: Target <5%

---

## Database Queries for Monitoring

### Check feature adoption
```sql
-- Instant payout adoption rate
SELECT
  COUNT(DISTINCT driver_id) * 100.0 / (SELECT COUNT(*) FROM drivers) as adoption_rate
FROM instant_payouts
WHERE created_at > NOW() - INTERVAL '30 days';

-- Recurring load usage
SELECT
  COUNT(DISTINCT company_id) * 100.0 / (SELECT COUNT(*) FROM companies) as adoption_rate
FROM recurring_load_templates
WHERE is_active = true;

-- Preferred driver relationships
SELECT
  company_id,
  COUNT(*) as preferred_drivers
FROM company_driver_relationships
WHERE status = 'preferred'
GROUP BY company_id
ORDER BY preferred_drivers DESC;
```

---

## Troubleshooting

### GPS Map Not Loading
- **Check**: Mapbox token is set in environment variables
- **Check**: Token has correct scopes (styles:read, fonts:read)
- **Check**: Browser console for CORS errors

### Instant Payouts Failing
- **Check**: Stripe Connect accounts are verified
- **Check**: Driver has `instant_payout_enabled = true`
- **Check**: Driver has `instant_payout_bank_verified = true`
- **Check**: Payment status is `completed`

### Real-time Updates Not Working
- **Check**: Supabase realtime is enabled for tables
- **Check**: RLS policies allow SELECT on tables
- **Check**: Subscription channel names match

### API Routes Returning 404
- **Check**: Database tables exist (run migrations)
- **Check**: Next.js build completed successfully
- **Check**: Routes are in `/app/api/` directory

---

## Phase 4: Future Enhancements

### Voice Agent Integration (Pending)
- Twilio Voice integration
- ElevenLabs voice synthesis
- Natural language load booking
- Voice-to-text bid submissions

### Advanced Features
- Driver leaderboard with rankings
- Company analytics dashboard
- Referral system with bonuses
- Load preferences & saved searches
- Push notification system
- Automated recurring load posting (cron job)

---

## Support & Documentation

### Files Reference
- **Database Schema**: `/supabase/schema-updates.sql`
- **Backend APIs**: `/app/api/location/`, `/api/messages/`, `/api/payouts/`, `/api/recurring/`, `/api/direct-hire/`
- **Components**: `/components/tracking/`, `/components/messaging/`, `/components/payments/`, `/components/earnings/`, `/components/recurring/`, `/components/direct-hire/`, `/components/drivers/`
- **Feature Docs**: `/STICKY_FEATURES.md`

### Testing Endpoints
```bash
# GPS tracking
curl -X POST http://localhost:3000/api/location/update \
  -H "Content-Type: application/json" \
  -d '{"assignment_id":"uuid","latitude":40.7128,"longitude":-74.0060}'

# Send message
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{"load_id":"uuid","message":"Hello"}'

# Create recurring load
curl -X POST http://localhost:3000/api/recurring/create \
  -H "Content-Type: application/json" \
  -d '{"recurrence_pattern":"weekly","recurrence_days":[1,3,5]}'
```

---

**Status**: ✅ Ready for Database Migration
**Next Action**: Run `/supabase/schema-updates.sql` in Supabase Dashboard

**Questions?** Review `/STICKY_FEATURES.md` for detailed implementation notes.
