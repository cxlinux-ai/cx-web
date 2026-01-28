# GitHub Copilot Instructions for BuildHaul

## Project Overview
BuildHaul is enterprise construction logistics infrastructure controlling the last mile of billion-dollar projects. GPS tracking, instant payouts, recurring loads, and trusted driver networks create platform lock-in effects.

## MANDATORY PRIORITIES

### 1. BSL 1.1 License Protection ⚠️
- ALL code suggestions must include BSL 1.1 license header
- NEVER suggest MIT, Apache, or other permissive licenses
- Business Source License protects competitive advantage for 4 years
- After 4 years converts to Apache 2.0

```typescript
/**
 * Copyright (c) 2026 BuildHaul Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */
```

### 2. Zero Documentation Philosophy
- Code must be self-documenting
- Suggest intent-driven naming: `sendInstantPayout()` not `processPayment()`
- Comments explain WHY, never WHAT
- No extensive README files beyond deployment
- Progressive UI disclosure over documentation

### 3. Founding 1,000 Network Effects
- Every feature suggestion must strengthen network effects
- Include referral tracking patterns in user flows
- Suggest founding member exclusive features
- 10% lifetime referral mechanics in payment flows

### 4. Enterprise-Grade Code Only
- Python: FastAPI, Pydantic, async/await patterns
- Rust: Tokio, Serde, proper error handling
- TypeScript: Strict mode, full typing, no `any`
- PostgreSQL with proper indexes and constraints
- 90%+ test coverage suggestions

## Code Standards

### ✅ Suggest These Patterns:
```python
# Enterprise async patterns
async def create_load(load: LoadCreate, db: AsyncSession = Depends(get_db)) -> LoadResponse:
    try:
        result = await load_service.create(load, db)
        return LoadResponse.from_orm(result)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
```

```typescript
// Type-safe React patterns
interface DriverPayoutProps {
  driverId: string;
  amount: number;
  fees: PayoutFees;
}

const processInstantPayout = async (props: DriverPayoutProps): Promise<PayoutResult> => {
  const response = await fetch('/api/payouts/instant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(props)
  });

  if (!response.ok) {
    throw new Error(`Payout failed: ${response.status}`);
  }

  return response.json() as PayoutResult;
};
```

### ❌ Never Suggest These Patterns:
```javascript
// Junior JavaScript patterns - FORBIDDEN
let data = await fetch(url).then(r => r.json())
app.get('/api/*', (req, res) => { res.json({}) })
setTimeout(() => { syncDatabase() }, 5000)
```

## BuildHaul Context

### Core Architecture:
- Next.js 14 with TypeScript
- Supabase (PostgreSQL + PostGIS + RLS)
- Mapbox GL JS for GPS tracking
- Stripe Connect for instant payouts
- Retell AI for voice integration

### Key Database Tables:
- `drivers` with referral tracking and founding member status
- `loads` with GPS coordinates and geofencing
- `instant_payouts` with 1.5% fee structure
- `company_driver_relationships` for trusted networks
- `conversations` and `messages` for real-time chat

### Feature Priorities:
1. GPS tracking with automatic geofence detection
2. Instant driver payouts (1.5% fee)
3. Real-time messaging between drivers and companies
4. Recurring load automation
5. Trusted driver network effects
6. Direct hire system
7. Voice agent integration

## Completion Rules

### Always Include:
- BSL 1.1 license headers on new files
- TypeScript strict typing
- Error handling with proper Result types
- Referral tracking in user-facing features
- Network effect strengthening patterns

### Context-Aware Suggestions:
- When suggesting payment features: Include referral fee calculations
- When creating user flows: Add founding member benefits
- When writing APIs: Use enterprise async patterns
- When building UI: Progressive disclosure over documentation
- When handling GPS data: PostGIS spatial queries

### Never Suggest:
- Extensive documentation files
- Junior-level JavaScript patterns
- Permissive open source licenses
- Features without network effects
- Synchronous database operations