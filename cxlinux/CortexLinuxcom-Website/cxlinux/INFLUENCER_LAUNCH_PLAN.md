# CX Linux — Influencer Launch Plan

**Created:** 2026-01-25
**Status:** ACTIVE SPRINT
**Goal:** Ship influencer-ready Cortex in 2 weeks

---

## Definition of "Ready"

For an influencer to demo CX Linux effectively:

| Requirement | Why Critical |
|-------------|--------------|
| **One-liner install** | No friction, copy-paste-wow |
| **3 killer demos** | Visual proof of 10x improvement |
| **Works offline** | Demo can't fail due to API |
| **README with GIFs** | Shareable content |

---

## Week 1: Install Experience (Jan 27 - Jan 31)

### Day 1-2: Build .deb Package
**Repo:** cortex-distro
**Tasks:**
- [ ] Create debian/ directory structure
- [ ] Write control file with dependencies
- [ ] Build cortex-core.deb meta-package
- [ ] Test local dpkg install

### Day 3: GPG Signing
**Repo:** apt-repo
**Tasks:**
- [ ] Generate GPG key for apt signing
- [ ] Export public key for distribution
- [ ] Sign Release file

### Day 4: apt.cortexlinux.com
**Repo:** apt-repo
**Tasks:**
- [ ] Set up GitHub Pages hosting
- [ ] Configure apt repo structure (dists/, pool/)
- [ ] Test: `apt update` succeeds

### Day 5: Install Script
**Repo:** cortex (root)
**Tasks:**
- [ ] Write install.sh script
- [ ] Host at cortexlinux.com/install
- [ ] Test on clean Ubuntu 24.04 VM

### Day 6: QA
- [ ] Fresh VM: Ubuntu 24.04
- [ ] Run: `curl -fsSL cortexlinux.com/install | bash`
- [ ] Verify: `cortex --version` works
- [ ] Verify: `cortex install htop` works

**Week 1 Exit Criteria:**
```bash
curl -fsSL cortexlinux.com/install | bash
cortex --version
# Output: cortex v0.2.0
```

---

## Week 2: Demo Polish (Feb 3 - Feb 7)

### Day 1: Security Fixes
**Repo:** cortex
**Tasks:**
- [ ] Audit coordinator.py for shell injection
- [ ] Replace shell=True with subprocess list args
- [ ] Add input sanitization

### Day 2: Dangerous Patterns
**Repo:** cortex
**Tasks:**
- [ ] Expand pattern list from 46 to 60+
- [ ] Add: `chmod 777`, `curl | bash` (meta!), `dd if=`
- [ ] Add: `mkfs`, `:(){ :|:& };:`, `> /dev/sda`

### Day 3-4: Demo Scripts
**Repo:** cortex

**Demo 1: CUDA Install**
```bash
cortex install cuda drivers for my nvidia gpu
# Expected: Detects GPU, installs correct driver + CUDA toolkit
```

**Demo 2: LAMP Stack**
```bash
cortex setup lamp stack with php 8.3
# Expected: Installs Apache, PHP 8.3, MariaDB, configures vhost
```

**Demo 3: System Query**
```bash
cortex what packages use the most disk space
# Expected: Lists top packages by size with human-readable output
```

### Day 5: Create GIFs
- [ ] Record Demo 1 with asciinema or vhs
- [ ] Record Demo 2
- [ ] Record Demo 3
- [ ] Convert to GIF, optimize size

### Day 6: README Update
**Repo:** cortex
- [ ] Add GIFs to README
- [ ] Add one-liner install
- [ ] Add "Why CX Linux" section with before/after

**Week 2 Exit Criteria:**
- 3 working demos that visually show 10x improvement
- README with embedded GIFs
- Security audit complete

---

## Deliverables for Influencer

| Asset | Format | Status |
|-------|--------|--------|
| Install command | One-liner | 🔴 Build |
| Demo 1: CUDA | GIF + commands | 🔴 Build |
| Demo 2: LAMP | GIF + commands | 🔴 Build |
| Demo 3: Query | GIF + commands | 🔴 Build |
| README | Markdown | 🔴 Update |
| Talking points | Google Doc | 🔴 Write |
| Discord link | URL | ✅ discord.gg/uCqHvxjU83 |
| GitHub link | URL | ✅ github.com/cortexlinux/cortex |

---

## Talking Points for Influencer

### The Problem (Pain Points)
- "Installing CUDA on Linux = 47 Stack Overflow tabs"
- "Developers spend 30% of time fighting the OS"
- "Configuration files written in ancient runes"
- "$100B+ annual productivity loss to dependency hell"

### The Solution (One-liner)
> "CX Linux is the AI layer for Linux. Tell it what you want in plain English, it figures out the how."

### Key Stats
- First AI-native Linux distribution
- Works offline with local LLM
- Sandboxed execution (Firejail)
- Rollback support for all operations
- 10x faster than manual setup

### Comparisons
| Task | Manual | CX Linux |
|------|--------|----------|
| CUDA setup | 30+ min | 4 min |
| LAMP stack | 15+ min | 2 min |
| Find disk hogs | 5+ min | 10 sec |

### Call to Action
1. Star on GitHub: github.com/cortexlinux/cortex
2. Join Discord: discord.gg/uCqHvxjU83
3. Install: `curl -fsSL cortexlinux.com/install | bash`

---

## NOT in Scope (Deferred)

| Feature | Why Defer |
|---------|-----------|
| Pro licensing | Adoption first, revenue later |
| Stripe integration | Same |
| Bootable ISO | apt install is enough |
| Web console | CLI demo is more impressive |
| SSO/SAML | Enterprise, not consumer |
| Full cortex-network | Post-launch |

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Install success rate | >95% | Test on 5 different VMs |
| Demo reliability | 100% | Each demo works 10/10 times |
| Time to first command | <2 min | From curl to cortex --version |
| GIF file size | <5MB each | Optimized for Twitter/Discord |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API rate limits during demo | Default to local Ollama |
| Install fails on some distros | Scope to Ubuntu 22.04/24.04 only |
| Security vuln discovered | Fix coordinator.py FIRST |
| LLM gives bad advice | Dry-run mode + human confirmation |

---

## Contact

- **Project Lead:** Mike (mike@cortexlinux.com)
- **Discord:** discord.gg/uCqHvxjU83
- **GitHub:** github.com/cortexlinux/cortex

---

**Remember:** The goal is NOT feature completeness. The goal is a jaw-dropping 60-second demo that makes Linux feel magical.
