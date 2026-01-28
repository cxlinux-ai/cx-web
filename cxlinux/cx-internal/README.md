# CX Linux Internal

Private repository for internal operations, tracking, and sensitive data.

**DO NOT MAKE PUBLIC**

## Contents

### /referrals
Contributor referral program tracking and management.

- `PROGRAM.md` - Program terms and Discord announcement
- `referrals.json` - Referral tracking data
- `contributors.json` - Contributor codes and payouts
- `generate-codes.sh` - Code generation script

## Quick Actions

### Generate a referral code
```bash
cd referrals
./generate-codes.sh "username" "discord_id"
```

### Track a new referral
Update `referrals.json` with the referral entry.

## Security

- Never commit secrets or API keys
- Use environment variables for sensitive config
- This repo should remain private on GitHub
