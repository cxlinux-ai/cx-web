# Cortex Linux Master Product & Delivery Plan

**Version:** 2.0
**Last Updated:** 2025-01-23
**Status:** Active Development

---

## Executive Summary

Cortex Linux is an AI-native Linux distribution that transforms system administration through natural language. Unlike traditional package managers, Cortex understands intent: "install something to edit PDFs" resolves to the optimal package without memorizing `apt-get install okular`.

**What makes this different:** This isn't a wrapper. It's a new paradigm where the LLM is the interface, not an assistant.

---

## 1. Current State Assessment

### What's Actually Built (vs. What's Planned)

| Component | Claimed Status | Actual Status | Lines of Code |
|-----------|---------------|---------------|---------------|
| **cortex** (core) | MVP | **Production-Ready** | 38,300+ |
| **cortex-cli** | Separate package | **Stub only** (integrated in cortex) | ~100 |
| **cortex-llm** | Basic | **Production-Ready** | 2,500+ |
| **cortex-network** | Planned | **Skeleton** | ~500 |
| **cortex-distro** | Planned | **Production-Ready** | 5,000+ |
| **cortex-docs** | Basic | **Functional** (MkDocs) | 50+ files |
| **apt-repo** | Planned | **Infrastructure Ready** | CI/CD configured |
| **Website** | Planned | **In Development** | React/Next.js |

### Core Package Deep Dive

The main `cortex` repo is **far more advanced than the original plan suggests**:

**Implemented Features:**
- Multi-LLM routing (Claude, GPT-4, Ollama, Kimi K2)
- Intelligent task-based provider selection
- Firejail sandboxing with 46 dangerous pattern detectors
- Predictive error prevention (static + AI-powered)
- Voice input via Whisper (F9 hotkey)
- Installation history with SQLite + rollback
- Hardware detection (NVIDIA, AMD, Intel GPUs)
- System role detection (web server, dev machine, etc.)
- MCP server for Claude/ChatGPT/Cursor integration
- Interactive TUI dashboard
- Internationalization (5 languages)
- Self-update mechanism
- Desktop notifications
- Semantic caching for LLM responses
- C++ daemon (cortexd) with IPC

**Security Model (Already Implemented):**
1. Pattern-based command blocking (46 regex rules)
2. Static compatibility checks (kernel, RAM, disk)
3. Historical failure analysis
4. AI-powered risk assessment
5. Firejail process isolation
6. Full audit trail

---

## 2. Revised Architecture

### The Real Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    CORTEX LINUX DISTRO                      │
│              (Debian bookworm + Cortex pre-installed)       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                      APT REPOSITORY                          │
│  apt.cortexlinux.com (GitHub Pages + reprepro + GPG signed) │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    META-PACKAGES                             │
│  cortex-core │ cortex-full │ cortex-llm │ cortex-gpu-*     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    CORTEX CORE                               │
│  CLI │ LLM Router │ Package Resolver │ Safety Layer         │
│  Voice │ Dashboard │ Daemon │ MCP Server                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    LLM LAYER                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Claude  │ │  GPT-4   │ │  Ollama  │ │  Kimi K2 │       │
│  │ (Cloud)  │ │ (Cloud)  │ │ (Local)  │ │ (Cloud)  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Repository Responsibilities (Clarified)

| Repo | Actual Purpose | Dependencies |
|------|----------------|--------------|
| `cortex` | **Everything** - CLI, LLM, safety, voice, daemon | None |
| `cortex-cli` | **DEPRECATED** - merge into cortex or remove | - |
| `cortex-llm` | Local inference runtime (llama.cpp) | Standalone |
| `cortex-network` | Network management module | cortex |
| `cortex-distro` | ISO builder + meta-packages | cortex, cortex-llm |
| `cortex-docs` | Documentation site | None |
| `apt-repo` | Package hosting | cortex-distro |
| `Website` | Marketing site | None |

**Critical Decision:** Merge `cortex-cli` into `cortex` or clearly define separation. Current state is confusing.

---

## 3. Licensing Strategy

### Recommended: Business Source License 1.1 (BSL)

**Current Implementation:** ✅ Already using BSL 1.1 in cortex repo

**License Parameters:**
- **Change Date:** 6 years from release
- **Change License:** Apache 2.0
- **Additional Use Grant:** Personal use on 1 system free

**Why BSL Works:**
- Allows community contribution and transparency
- Prevents cloud providers from reselling
- Time-limited restriction builds trust
- Already used by CockroachDB, MariaDB, Sentry

### Pro Features (License-Gated)

| Feature | Free (Core) | Pro |
|---------|-------------|-----|
| LLM Provider | Ollama only | Claude, GPT-4, Kimi K2 |
| Voice Input | ❌ | ✅ |
| External API Keys | ❌ | ✅ |
| Max Daily Queries | 50 | Unlimited |
| Predictive Prevention | Basic rules | AI-powered |
| Priority Support | Community | Email/Slack |
| Commercial Use | 1 system | Unlimited |

**Implementation:** Already have `licensing.py` - extend with feature flags.

---

## 4. LLM Strategy (Revised)

### Current State (Already Implemented)

The original plan underestimated what's built:

```python
# From cortex/llm_router.py - ALREADY EXISTS
TASK_TYPE_ROUTING = {
    "package_install": "kimi",      # Best for system ops
    "troubleshoot": "claude",       # Best for reasoning
    "explain": "claude",            # Best for explanation
    "search": "openai",             # Best for search
    "general": "claude",            # Default
}
```

### LLM Tier Strategy

**Tier 1: Local (Free)**
- Ollama with Mistral 7B / Llama 3 8B
- CPU inference (slower but works everywhere)
- No internet required
- ~4GB VRAM recommended

**Tier 2: Cloud Freemium**
- Free tier with rate limits (50 queries/day)
- Uses Cortex's API keys (we pay)
- Semantic caching to reduce costs
- Graceful degradation to local

**Tier 3: Pro (User's Keys)**
- User provides their own API keys
- Unlimited queries
- Access to premium models
- Priority routing

### Model Recommendations

| Task | Free (Local) | Pro (Cloud) |
|------|--------------|-------------|
| Package Resolution | Mistral 7B | Kimi K2 |
| Troubleshooting | Llama 3 8B | Claude Opus |
| Code Generation | CodeLlama 7B | Claude Sonnet |
| Voice Transcription | Whisper base | Whisper large |

### Cost Control (Critical)

**Problem:** Original plan doesn't address API costs at scale.

**Solutions Already Built:**
1. Semantic caching (`semantic_cache.py`)
2. Request deduplication
3. Token counting before calls
4. Fallback to local on budget exceeded

**Additional Recommendations:**
- Implement daily cost caps per user
- Add usage dashboard
- Batch similar requests
- Use embeddings for cache similarity

---

## 5. Monetization Model

### Pricing Tiers

| Tier | Price | Target |
|------|-------|--------|
| **Community** | Free | Individual developers, hobbyists |
| **Pro** | $20/mo | Power users, freelancers (up to 3 servers) |
| **Team** | $99/mo flat | **Growth tier for startups** (up to 25 systems) |
| **Enterprise** | $199/mo | Large teams, compliance needs (up to 100 servers) |
| **Managed** | $399/mo | Fully managed infrastructure (unlimited) |

### Revenue Projections

**Conservative (Year 1):**
- 10,000 free users
- 500 Pro conversions ($20/mo): $120,000
- 200 Team conversions ($99/mo): $237,600
- 25 Enterprise ($199/mo): $59,700
- **ARR: $417,300**

**Optimistic (Year 1):**
- 50,000 free users
- 2,000 Pro ($20/mo): $480,000
- 800 Team ($99/mo): $950,400
- 100 Enterprise ($199/mo): $238,800
- **ARR: $1,669,200**

**Founding 1,000 Program:**
- Target 1,000 founding members primarily on Team tier
- 10% lifetime referral commission = $9.90/month per referral
- Accelerated growth through network effects

### Payment Integration

**Recommended:** Stripe + License Key system

**Implementation:**
1. Add `/subscription` command
2. Generate license key on purchase
3. Store in `~/.cortex/license.key`
4. Validate via API (with offline grace period)

---

## 6. Differentiation Strategy

### What Makes Cortex Different

**Not Another Wrapper:**
- Most "AI Linux tools" are thin wrappers around GPT
- Cortex has deep system integration (daemon, hardware detection, sandboxing)

**Not Just Package Management:**
- Predictive error prevention
- Role-based context awareness
- Voice-first interface
- Full rollback capability

**Not Cloud-Dependent:**
- Works fully offline with local LLMs
- No mandatory telemetry
- Self-hostable enterprise version

### Competitive Positioning

| Competitor | Their Focus | Cortex Advantage |
|------------|-------------|------------------|
| **Warp** | Terminal UX | Deeper system integration |
| **GitHub Copilot CLI** | Command suggestions | Full workflow automation |
| **ChatGPT** | General AI | Linux-specific, sandboxed |
| **Cursor** | Code editing | System administration |

### Marketing Angle

**Tagline:** "Tell your server what you want. It figures out the rest."

**Key Messages:**
1. "Never memorize another Linux command"
2. "AI that understands your system, not just your text"
3. "Safer than sudo - every command previewed and sandboxed"

---

## 7. Development Roadmap

### Phase 1: Consolidation (Weeks 1-2)

**Goal:** Ship v0.2.0 with clear value proposition

| Task | Owner | Priority |
|------|-------|----------|
| Merge cortex-cli into cortex or clarify | Dev | P0 |
| Fix shell injection in coordinator.py | Dev | P0 |
| Complete dangerous pattern list | Dev | P0 |
| Implement Pro license validation | Dev | P1 |
| Build first .deb package | Dev | P1 |
| Set up apt.cortexlinux.com | DevOps | P1 |
| Write installation docs | Docs | P1 |

### Phase 2: Distribution (Weeks 3-4)

**Goal:** Installable via apt on any Debian/Ubuntu

| Task | Owner | Priority |
|------|-------|----------|
| Build cortex-core meta-package | Dev | P0 |
| Build cortex-full meta-package | Dev | P0 |
| CI/CD for automated builds | DevOps | P0 |
| Generate signing key | DevOps | P0 |
| Test installation on clean VMs | QA | P0 |
| Write quickstart guide | Docs | P1 |

### Phase 3: Pro Launch (Weeks 5-6)

**Goal:** Revenue generation begins

| Task | Owner | Priority |
|------|-------|----------|
| Stripe integration | Dev | P0 |
| License key system | Dev | P0 |
| Pro feature gates | Dev | P0 |
| Landing page with pricing | Marketing | P0 |
| Onboarding flow | Dev | P1 |
| Support channel (Discord/Slack) | Community | P1 |

### Phase 4: Distro (Weeks 7-8)

**Goal:** Bootable Cortex Linux ISO

| Task | Owner | Priority |
|------|-------|----------|
| Build netinst ISO | Dev | P0 |
| Build offline ISO | Dev | P1 |
| NVIDIA variant | Dev | P1 |
| Test on real hardware | QA | P0 |
| Release to GitHub Releases | DevOps | P0 |
| Announcement post | Marketing | P1 |

---

## 8. Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Shell injection vulnerability | Medium | Critical | Code audit + fuzzing |
| LLM API costs exceed budget | High | High | Rate limiting + caching |
| Model quality degrades | Medium | Medium | Multi-provider fallback |
| Package conflicts | Medium | Medium | Extensive testing matrix |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low conversion rate | High | High | Strong free tier + clear upgrade path |
| Cloud provider competition | Medium | Medium | Focus on local-first |
| Open source fork | Low | Medium | BSL license protects |
| Security incident | Low | Critical | Bug bounty + audits |

### Mitigation Already Implemented

- ✅ Multi-LLM fallback (no single point of failure)
- ✅ Sandboxed execution (limits damage)
- ✅ Full audit logging (incident investigation)
- ✅ Rollback capability (recovery)

---

## 9. Success Metrics

### v0.2.0 Release Criteria

- [ ] Clean install via `apt install cortex` works
- [ ] 10 successful test installations on different hardware
- [ ] Zero P0 security issues
- [ ] Documentation covers 80% of commands
- [ ] <5s response time for basic queries (local LLM)

### v1.0 Release Criteria

- [ ] 1,000+ GitHub stars
- [ ] 100+ paying Pro users
- [ ] 99.5% uptime for apt repo
- [ ] <2s response time for cached queries
- [ ] ISO boots on 90% of tested hardware

### Long-term KPIs

| Metric | Target (6mo) | Target (12mo) |
|--------|--------------|---------------|
| Monthly Active Users | 5,000 | 25,000 |
| Pro Subscribers | 200 | 1,000 |
| GitHub Stars | 2,500 | 10,000 |
| Documentation Coverage | 90% | 99% |
| Test Coverage | 70% | 85% |

---

## 10. Team & Roles

### Current Structure

| Role | Person | Responsibility |
|------|--------|----------------|
| Funding & Direction | Mike | Budget, strategy, go-to-market |
| Developer Influencer | Edward | Community, credibility, content |
| Development | [TBD] | Core engineering |

### Recommended Additions

| Role | Priority | Timing |
|------|----------|--------|
| DevOps Engineer | P0 | Immediate (packaging, CI/CD) |
| Security Auditor | P1 | Before v1.0 |
| Technical Writer | P2 | After v0.2.0 |
| Community Manager | P2 | At 5,000 users |

---

## 11. Immediate Action Items

### This Week

1. **Security Audit:** Review coordinator.py shell=True usage
2. **Repo Cleanup:** Decide cortex-cli fate (merge or delete)
3. **Packaging:** Generate first .deb from cortex repo
4. **Documentation:** Write "Getting Started" guide
5. **Licensing:** Implement Pro feature flags

### This Month

1. **Infrastructure:** Set up apt.cortexlinux.com
2. **CI/CD:** Automated builds on tag
3. **Testing:** Create VM test matrix
4. **Pro:** Stripe integration
5. **Marketing:** Landing page at cortexlinux.com

---

## 12. Appendix

### A. Repository URLs

- https://github.com/cortexlinux/cortex
- https://github.com/cortexlinux/cortex-cli (deprecated?)
- https://github.com/cortexlinux/cortex-llm
- https://github.com/cortexlinux/cortex-network
- https://github.com/cortexlinux/cortex-distro
- https://github.com/cortexlinux/cortex-docs
- https://github.com/cortexlinux/apt-repo
- https://github.com/cortexlinux/CortexLinuxcom-Website

### B. Key Files Reference

| File | Purpose |
|------|---------|
| `cortex/cli.py` | Main CLI entry point |
| `cortex/llm_router.py` | Multi-LLM routing logic |
| `cortex/sandbox/sandbox_executor.py` | Firejail integration |
| `cortex/validators.py` | 46 dangerous pattern rules |
| `cortex/licensing.py` | License validation |
| `cortex-distro/scripts/build.sh` | ISO builder |
| `apt-repo/deploy/` | Repository infrastructure |

### C. Environment Variables

```bash
# LLM Providers
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
MOONSHOT_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434

# Cortex Configuration
CORTEX_PROVIDER=claude|openai|ollama|kimi
CORTEX_LOG_LEVEL=DEBUG|INFO|WARNING|ERROR
CORTEX_WHISPER_MODEL=base|small|medium|large
CORTEX_UPDATE_CHECK=true|false

# Pro Features
CORTEX_LICENSE_KEY=...
```

### D. Command Reference

```bash
# Core Commands
cortex install "something to edit PDFs"
cortex ask "why is my server slow"
cortex remove nginx
cortex history
cortex rollback <id>

# Voice
cortex voice              # Continuous mode (F9 hotkey)
cortex voice --single     # Single command

# System
cortex role               # Detect system role
cortex dashboard          # TUI dashboard
cortex daemon status      # Background service

# Development
cortex troubleshoot       # Interactive debug
cortex sandbox test       # Test in isolation
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01 | Original | Initial plan |
| 2.0 | 2025-01-23 | Claude Code | Complete rewrite based on actual codebase analysis |

---

*This document represents the current understanding of the Cortex Linux project based on comprehensive codebase analysis. It supersedes the original product plan where there are conflicts.*
