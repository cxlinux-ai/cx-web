# CX Linux Referral Program — Internal Document

> **Status**: Active  
> **Last Updated**: 2026-03-12  
> **Maintainer**: Gary / Mike / Coby

---

## 1. Overview

The CX Linux Referral Program allows affiliates to earn recurring commissions by referring new paying subscribers. Affiliates receive a unique referral code and link, which they share with their network. When someone subscribes to a paid CX Linux plan using their link, the affiliate earns a commission.

---

## 2. Commission Structure

| Item | Details |
|------|---------|
| **Commission Rate** | 10% of subscription payment |
| **Type** | Recurring — paid on every renewal while the referred customer stays subscribed |
| **Applies To** | All paid plans (Pro, Team, Enterprise) |

### Commission Per Plan

| Plan | Monthly Price | Annual Price | Monthly Commission | Annual Commission |
|------|--------------|-------------|-------------------|-------------------|
| Pro | $20/mo | $200/yr | $2.00 | $20.00 |
| Team | $99/mo | $990/yr | $9.90 | $99.00 |
| Enterprise | $299/mo | $2,990/yr | $29.90 | $299.00 |

### ⚠️ OPEN QUESTIONS — Need Team Input

1. **Recurring commissions**: Is it truly recurring (paid on every renewal), or only on the first payment?
2. **Commission duration**: Is there a cap (e.g., 12 months)? Or lifetime as long as the customer stays subscribed?
3. **Minimum payout threshold**: Is there a minimum amount before we process payouts (e.g., $50)?
4. **Payout frequency**: Monthly? Quarterly? On-demand?

---

## 3. How Tracking Works

### Referral Flow

```
1. Affiliate signs up at cxlinux.com/affiliates
   → Enters name + email
   → Receives OTP via email
   → Verifies OTP → Gets unique referral code (e.g., JOH-X7K9M2)

2. Affiliate shares their link:
   https://cxlinux.com/pricing?ref=JOH-X7K9M2

3. Prospect clicks link → Goes to pricing page
   → The `ref` parameter is passed to Stripe checkout session metadata

4. Prospect subscribes → Stripe webhook fires
   → License server creates license + records referral
   → Commission calculated and stored in DB

5. Affiliate checks dashboard at cxlinux.com/affiliates
   → Enters email → OTP verification → Views stats
```

### Technical Implementation

- **Referral code format**: `{3-letter prefix}-{6 random chars}` (e.g., `GAR-X7K9M2`)
- **Tracking**: `?ref=` URL parameter → Stripe checkout session metadata → webhook processing
- **Storage**: Cloudflare D1 database (tables: `referrers`, `referrals`)
- **Dashboard auth**: Email OTP (no persistent login)

---

## 4. Affiliate Dashboard

Affiliates can view their performance at `cxlinux.com/affiliates` → "View Dashboard":

**What they see:**
- Total referrals count
- Pending (unpaid) commission
- Paid commission
- Referral code + shareable link
- Recent referrals list (tier, date, commission, paid/pending status)
- Payout details (email, method)

**Privacy**: Dashboard requires OTP verification — no one can see another affiliate's data.

---

## 5. Payout Process

| Item | Current Setup |
|------|--------------|
| **Default method** | PayPal |
| **Payout email** | Same as signup email (can be changed by admin) |
| **Process** | Admin manually triggers via `/admin/referrals/pending` API |

### Admin Payout Workflow

1. Check pending payouts:
   ```
   GET https://license.cxlinux.com/admin/referrals/pending
   Authorization: Bearer {ADMIN_API_KEY}
   ```

2. Process payment via PayPal/bank transfer (manual)

3. Mark as paid:
   ```
   POST https://license.cxlinux.com/admin/referrals/mark-paid
   Authorization: Bearer {ADMIN_API_KEY}
   Body: { "referral_code": "JOH-X7K9M2" }
   ```

### ⚠️ OPEN QUESTIONS — Need Team Input

5. **Payout methods**: PayPal only? Or also bank transfer, crypto, Wise?
6. **Who handles payouts**: Mike? Gary? Automated in future?
7. **Tax implications**: Do we need W-9/W-8BEN from affiliates? At what threshold?

---

## 6. Rules & Terms

### Allowed
- Share referral links on social media, blogs, forums, YouTube, podcasts
- Write honest reviews and tutorials mentioning CX Linux
- Include referral links in email newsletters (with proper disclosure)

### Not Allowed
- Self-referrals (using your own link to buy your own subscription)
- Misleading claims about CX Linux features or pricing
- Spam (mass unsolicited emails, fake reviews, comment spam)
- Bidding on "CX Linux" branded keywords in paid ads
- Creating fake accounts to inflate referral numbers

### ⚠️ OPEN QUESTIONS — Need Team Input

8. **Paid advertising**: Can affiliates run Google/Facebook ads with referral links? With restrictions?
9. **Cookie duration**: How long does the `?ref=` attribution last? Currently it's single-session only (no cookie persistence).
10. **Chargeback policy**: If a referred customer gets a refund within 7 days, is the commission clawed back?
11. **Termination**: Under what conditions can we remove an affiliate? (fraud, spam, inactivity?)

---

## 7. Referral Program Onboarding

### For New Affiliates
1. Go to `cxlinux.com/affiliates`
2. Click "Become an Affiliate"
3. Enter name + email → Verify via OTP
4. Receive referral code + link
5. Start sharing!

### For Existing Affiliates
1. Go to `cxlinux.com/affiliates`
2. Click "View Dashboard"
3. Enter email → Verify via OTP
4. View stats, copy link, track performance

---

## 8. Leaderboard (Future)

A public or semi-public leaderboard could display top referrers to encourage competition. 

**Considerations:**
- Privacy: Show only first name + last initial, or a chosen display name
- Metrics: Total referrals (not earnings) to avoid envy/conflict
- Update frequency: Weekly or monthly
- Rewards: Top referrer gets bonus? Featured on website?

**Status**: Not yet implemented — lower priority than core system.

---

## 9. Key Metrics to Track

| Metric | Where |
|--------|-------|
| Total active affiliates | D1: `SELECT COUNT(*) FROM referrers WHERE active = 1` |
| Total referrals this month | D1: `SELECT COUNT(*) FROM referrals WHERE created_at > date('now', 'start of month')` |
| Conversion rate | Referral clicks → subscriptions (needs click tracking — not yet implemented) |
| Revenue from referrals | D1: `SELECT SUM(amount_paid) FROM referrals` |
| Pending payouts | Admin API: `/admin/referrals/pending` |

### ⚠️ Missing: Click Tracking

Currently we track conversions (successful subscriptions) but NOT link clicks. Adding click tracking would let us measure:
- Click-through rate per affiliate
- Conversion funnel (click → pricing page → checkout → subscription)
- Which affiliates drive the most traffic (even if conversion is low)

**Recommendation**: Add a redirect endpoint (e.g., `/ref/CODE`) that logs clicks before redirecting to `/pricing?ref=CODE`.

---

## 10. Infrastructure

| Component | Location |
|-----------|----------|
| Referral API | `license.cxlinux.com` (Cloudflare Worker) |
| Database | Cloudflare D1 `cx-licenses` |
| Frontend | `cxlinux.com/affiliates` (Cloudflare Pages) |
| Admin API | `license.cxlinux.com/admin/referrals/*` |
| Code | `cxlinux-ai/cx-license-server` + `cxlinux-ai/cx-web` |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-11 | Added OTP-protected dashboard, removed public stats access |
| 2026-03-11 | Initial document created |
