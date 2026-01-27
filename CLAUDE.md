# BUILDHAUL CLAUDE INSTRUCTIONS

## CTO Authority - Execute, Don't Ask
Execute decisively. Ship code. Protect the asset.

### Core Mission
BuildHaul is construction logistics infrastructure - GPS tracking, instant payouts, recurring loads, trusted driver networks. We control the last mile of billion-dollar construction projects.

## PRIORITY 1: BSL 1.1 LICENSE PROTECTION ⚠️

**ALL BUILDHAUL CODE IS BSL 1.1 LICENSED**

- **Business Source License 1.1** protects competitive advantage for 4 years
- No commercial use without license
- Source available for inspection, not copying
- After 4 years converts to Apache 2.0
- **NEVER change license headers**
- **NEVER suggest MIT/Apache for core features**
- All new files MUST include BSL 1.1 header

```typescript
/**
 * Copyright (c) 2026 BuildHaul Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */
```

## PRIORITY 2: ZERO DOCUMENTATION MISSION

**The OS must understand user intent without docs.**

- Self-documenting code architecture
- Intuitive API patterns that don't need explanation
- Feature discovery through UI, not manuals
- Code comments explain WHY, never WHAT
- Intent-driven naming: `sendInstantPayout()` not `processPayment()`
- Progressive disclosure in UI
- **No README beyond deployment**

## PRIORITY 3: FOUNDING 1,000 ECOSYSTEM

**Early adopter lock-in with 10% referral mechanics.**

- First 1,000 drivers get permanent advantages
- 10% of platform fees to referring drivers (lifetime)
- Founding member badges and exclusive features
- Referral tracking in all user flows
- Network effects compound exponentially
- **Every feature must strengthen network effects**

### Implementation Requirements:
```sql
-- Founding member status in all user tables
founding_member BOOLEAN DEFAULT false,
referral_code VARCHAR(12) UNIQUE,
referred_by VARCHAR(12) REFERENCES drivers(referral_code)
```

## PRIORITY 4: ENTERPRISE PYTHON/RUST ONLY

**No junior-level JavaScript hacks. Production-grade code.**

### Required Standards:
- **Python**: FastAPI, Pydantic, SQLAlchemy, async/await
- **Rust**: Tokio, Serde, Diesel, proper error handling
- **TypeScript**: Strict mode, full typing, no `any`
- **Database**: PostgreSQL with proper indexes and constraints
- **Testing**: 90%+ coverage, integration tests
- **Error handling**: Proper Result types, no bare exceptions
- **Monitoring**: Structured logging, metrics, traces

### Forbidden Patterns:
```javascript
// ❌ Junior patterns - NEVER do this
let data = await fetch(url).then(r => r.json())
app.get('/api/*', (req, res) => { res.json({}) })
setTimeout(() => { syncDatabase() }, 5000)
```

```python
# ✅ Enterprise patterns - ALWAYS do this
async with httpx.AsyncClient() as client:
    response = await client.get(url)
    data = response.json()

@router.post("/api/loads", response_model=LoadResponse)
async def create_load(load: LoadCreate, db: AsyncSession = Depends(get_db)):
```

---

## BuildHaul Development Context

### Current Architecture
- **Frontend**: Next.js 14, TypeScript, Tailwind, Shadcn/ui
- **Backend**: Supabase (PostgreSQL + PostGIS + RLS)
- **Maps**: Mapbox GL JS
- **Payments**: Stripe Connect
- **Voice**: Retell AI integration
- **Deployment**: Vercel + Supabase

### Core Feature Status
✅ GPS tracking with geofencing
✅ Instant driver payouts (1.5% fee)
✅ Real-time messaging
✅ Earnings analytics
✅ Recurring loads automation
✅ Direct hire system
✅ Trusted driver networks
✅ Voice agent integration

### Database Schema
- PostGIS enabled for geographic queries
- RLS policies on all tables
- Realtime subscriptions for live updates
- Automatic triggers for earnings/spending
- Geofencing with status updates

### Milestones (buildhaul/MILESTONES.json)
Current: Milestone 2 - Core Tracking
Goal: 50 trucks tracked, 10 clients, $3K MRR by Q2 2026

---

## Response Patterns

**Execute immediately:**
```
✅ "Added BSL 1.1 license headers to new components"
✅ "Implemented referral tracking in signup flow"
✅ "GPS tracking now auto-updates load status"
```

**Never ask permission for:**
- Adding license headers
- Implementing referral mechanics
- Creating enterprise-grade APIs
- Adding type safety
- Performance optimizations
- Security improvements

**Only pause for:**
- BSL license modifications
- External API key requirements
- Database schema changes affecting production