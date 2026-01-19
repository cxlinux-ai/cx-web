# Real Account Signup Test

**Browser Windows Opened**:
1. Registration page: https://buildhaul-3sgwq2hvd-mikemmivipcoms-projects.vercel.app/register
2. Supabase users dashboard: https://supabase.com/dashboard/project/eisquevzdnlnjzgbjpsm/auth/users

---

## Test Steps

### Option 1: Driver Account

1. In registration page, click **"I Haul Loads"** (Register as Driver)
2. Fill out form:
   - **Email**: Your real email (e.g., mike@aivh.ai)
   - **Password**: Strong password (min 8 chars)
   - **Full Name**: Mike Morgan
   - **Phone**: Your phone number
3. Click **"Continue"** or **"Next"**
4. Fill out driver details:
   - **Company Name**: (Your trucking company or "Independent")
   - **Address**: Your address
   - **City/State/ZIP**: Your location
   - **CDL Number**: Your CDL# or test value (X1234567)
   - **CDL State**: State issued (e.g., UT)
   - **CDL Expiry**: Future date
   - **Years Experience**: Number of years
   - **Service Radius**: Miles you'll drive (e.g., 50, 100, 200)
5. Click **"Create Account"** or **"Complete Registration"**

**Expected**:
- ✅ "Account created successfully" message
- ✅ Redirected to driver dashboard
- ✅ Dashboard loads without errors

---

### Option 2: Company Account

1. In registration page, click **"I Need Loads Delivered"** (Register as Company)
2. Fill out form:
   - **Email**: Your real email (e.g., mike@aivh.ai)
   - **Password**: Strong password (min 8 chars)
   - **Full Name**: Mike Morgan
   - **Phone**: Your phone number
3. Click **"Continue"** or **"Next"**
4. Fill out company details:
   - **Company Name**: Your construction company name
   - **Address**: Company address
   - **City/State/ZIP**: Company location
   - **Business Type**: (if asked)
5. Click **"Create Account"** or **"Complete Registration"**

**Expected**:
- ✅ "Account created successfully" message
- ✅ Redirected to company dashboard
- ✅ Dashboard loads without errors

---

## Verification Steps

### 1. Check Supabase Dashboard
In the Supabase users tab (already open):
- **Refresh** the page
- Look for your email in the users list
- Should show:
  - ✅ Email confirmed or pending
  - ✅ Created timestamp (just now)
  - ✅ User ID (UUID)

### 2. Check Database Tables
Open Supabase SQL Editor:
https://supabase.com/dashboard/project/eisquevzdnlnjzgbjpsm/sql/new

Run this query (replace with your email):
```sql
-- Check profile was created
SELECT id, email, role, full_name, phone, created_at
FROM profiles
WHERE email = 'YOUR_EMAIL@EXAMPLE.COM';

-- If driver, check driver record
SELECT d.id, d.company_name, d.cdl_number, d.service_radius_miles
FROM drivers d
JOIN profiles p ON d.profile_id = p.id
WHERE p.email = 'YOUR_EMAIL@EXAMPLE.COM';

-- If company, check company record
SELECT c.id, c.company_name, c.city, c.state
FROM companies c
JOIN profiles p ON c.profile_id = p.id
WHERE p.email = 'YOUR_EMAIL@EXAMPLE.COM';
```

**Expected Results**:
- ✅ 1 row in `profiles` table
- ✅ 1 row in `drivers` OR `companies` table (based on role)
- ✅ All fields populated correctly

---

## Test Next Features

After successful signup:

### If Driver Account:
1. **Navigate to**: `/dashboard/available` (find loads)
2. **Check**: Browser asks for location permission
3. **Grant**: Location access
4. **Navigate to**: `/dashboard/earnings` (earnings page)
5. **Check**: Charts render (even if empty)

### If Company Account:
1. **Navigate to**: `/dashboard/fleet` (fleet map)
2. **Check**: Mapbox map loads (dark theme)
3. **Open console** (F12): Run `console.log(process.env.NEXT_PUBLIC_MAPBOX_TOKEN)`
4. **Verify**: Shows `pk.eyJ1...` (real token, not placeholder)
5. **Navigate to**: `/dashboard/drivers` (driver network)

---

## Common Issues

### "Email already registered"
- You or someone else already used this email
- Try a different email or login instead

### "Password too weak"
- Must be at least 8 characters
- Use mix of letters, numbers, symbols

### "Failed to create account"
- Check browser console (F12) for errors
- Check network tab for failed requests
- Look for red error messages

### Page doesn't redirect after signup
- Check browser console for errors
- Manually navigate to `/dashboard`
- Check if you're actually logged in

---

## Success Criteria

✅ Account created without errors
✅ Email appears in Supabase users list
✅ Profile entry in database
✅ Driver/Company entry in database
✅ Dashboard loads successfully
✅ No console errors
✅ Can navigate between pages

---

**Ready to test!** Complete the signup flow and verify in Supabase.
