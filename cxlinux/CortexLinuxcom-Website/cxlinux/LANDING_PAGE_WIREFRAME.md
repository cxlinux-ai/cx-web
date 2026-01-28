# Cortex Linux Landing Page Wireframe

**Design System Reference:** Matches `CortexLinuxcom-Website` styling
**Theme:** Dark mode (black #000 background)
**Primary Color:** Brand Blue #0066FF
**Accent:** Terminal Green #00FF00
**Effects:** Glass cards, gradient glows, noise texture overlays

---

## Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATION BAR                           │
├─────────────────────────────────────────────────────────────────┤
│                        HERO SECTION                             │
├─────────────────────────────────────────────────────────────────┤
│                     PROBLEM STATEMENT                           │
├─────────────────────────────────────────────────────────────────┤
│                     SOLUTION PREVIEW                            │
├─────────────────────────────────────────────────────────────────┤
│                     KEY FEATURES (3)                            │
├─────────────────────────────────────────────────────────────────┤
│                     SECURITY SECTION                            │
├─────────────────────────────────────────────────────────────────┤
│                     COMPARISON TABLE                            │
├─────────────────────────────────────────────────────────────────┤
│                     USE CASES GRID                              │
├─────────────────────────────────────────────────────────────────┤
│                     PRICING CARDS                               │
├─────────────────────────────────────────────────────────────────┤
│                     TESTIMONIALS                                │
├─────────────────────────────────────────────────────────────────┤
│                     CTA SECTION                                 │
├─────────────────────────────────────────────────────────────────┤
│                        FOOTER                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 1: Navigation Bar

**Component:** Fixed, backdrop-blur, bg-black/50
**Height:** 64px (h-16)

```
┌─────────────────────────────────────────────────────────────────┐
│ CORTEX LINUX        Get Started  Pricing  News  Hackathon  [★ GitHub] [Get Started] │
└─────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Logo: "CORTEX" white, "LINUX" gradient-text (blue gradient)
- Links: text-gray-400, hover:text-[#93c5fd]
- Hackathon link: text-terminal-green with pulse dot animation
- CTA button: bg-blue-500, rounded-lg, hover glow effect

---

## Section 2: Hero Section

**ID:** `#home`
**Padding:** py-40 (160px top/bottom per CSS)
**Background:** Radial gradient ellipse blue glow at top

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              [Blue gradient glow - bg-blob-blue]               │
│                                                                 │
│                    THE AI-NATIVE                                │
│                   OPERATING SYSTEM                              │
│                                                                 │
│        Tell your server what you want. It figures out the rest. │
│                                                                 │
│     [Get Started - Primary]    [Star on GitHub - Secondary]     │
│                                                                 │
│              ┌─────────────────────────────────┐                │
│              │     INTERACTIVE TERMINAL        │                │
│              │     (code-editor class)         │                │
│              │                                 │                │
│              │  $ cortex install "set up ML"  │                │
│              │  ✓ Detected RTX 4090           │                │
│              │  ✓ Installing CUDA 12.3        │                │
│              │  ✓ Configuring PyTorch         │                │
│              │  ✓ Setup complete (4m 23s)     │                │
│              └─────────────────────────────────┘                │
│                                                                 │
│         [Trust badges: Open Source | 46 Safety Rules | BSL]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Typography:**
- Headline: text-5xl md:text-7xl font-bold
- "AI-NATIVE" and "OPERATING SYSTEM": gradient-text class
- Subheadline: text-xl text-gray-400 max-w-2xl

**Terminal Demo:**
- Use existing `code-editor` class with header dots
- Animated output lines with `fadeInLine` animation
- Green checkmarks with `code-check` styling

---

## Section 3: Problem Statement

**ID:** `#problem`
**Background:** Subtle side glow (purple)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                 LINUX IS POWERFUL.                              │
│               THE INTERFACE ISN'T.                              │
│                                                                 │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│    │ glass-card   │  │ glass-card   │  │ glass-card   │        │
│    │              │  │              │  │              │        │
│    │ ✗ 47 tabs   │  │ ✗ Dependency │  │ ✗ "Works on │        │
│    │   to install │  │   conflicts  │  │   my machine"│        │
│    │   CUDA       │  │   waste days │  │   syndrome   │        │
│    │              │  │              │  │              │        │
│    └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│    ┌──────────────┐                                            │
│    │ glass-card   │                                            │
│    │              │                                            │
│    │ ✗ Config    │                                            │
│    │   files in   │                                            │
│    │   ancient    │                                            │
│    │   runes      │                                            │
│    └──────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Card Styling:**
- `glass-card glass-card-hover` classes
- Red X icon for problems
- Text: text-gray-300

---

## Section 4: Solution Preview

**ID:** `#solution`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                  INTENT, NOT INSTRUCTIONS                       │
│                                                                 │
│      Traditional Linux is instruction-based.                    │
│      Cortex Linux is intent-based.                              │
│                                                                 │
│    ┌─────────────────────────────────────────────────────┐     │
│    │               BEFORE VS AFTER                        │     │
│    │                                                     │     │
│    │  BEFORE: apt-get install nvidia-driver-535 &&       │     │
│    │          nvidia-smi && apt-get install cuda...      │     │
│    │          (scrolling text, lots of commands)         │     │
│    │                                                     │     │
│    │  AFTER:  cortex install "GPU for machine learning" │     │
│    │          ✓ Done in 5 minutes                       │     │
│    │                                                     │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 5: Key Features (3 Cards)

**ID:** `#about`
**Layout:** Grid md:grid-cols-3 gap-8
**Background:** Right side purple accent glow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      WHAT MAKES IT DIFFERENT                    │
│                                                                 │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────┐ │
│  │    glass-card     │ │    glass-card     │ │   glass-card  │ │
│  │                   │ │                   │ │               │ │
│  │  [MessageSquare]  │ │      [Cpu]        │ │  [RotateCcw]  │ │
│  │                   │ │                   │ │               │ │
│  │  Natural Language │ │  Hardware-Aware   │ │  Self-Healing │ │
│  │     Commands      │ │   Optimization    │ │ Configuration │ │
│  │                   │ │                   │ │               │ │
│  │ Tell Cortex what  │ │ Auto-detects GPU, │ │ Fixes broken  │ │
│  │ you need in plain │ │ CPU, memory.      │ │ dependencies. │ │
│  │ English.          │ │ Configures for    │ │ Rollback if   │ │
│  │                   │ │ max performance.  │ │ anything fails│ │
│  │                   │ │                   │ │               │ │
│  │  [code snippet]   │ │  [code snippet]   │ │ [code snippet]│ │
│  │                   │ │                   │ │               │ │
│  └───────────────────┘ └───────────────────┘ └───────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Card Content:**
- Icon: Lucide icon, text-blue-400, mb-4
- Title: text-xl font-semibold text-white
- Description: text-gray-400
- Code snippet: `feature-code-block` class

---

## Section 6: Security Section

**ID:** `#security`
**Background:** Centered green subtle glow at bottom

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                  SAFER THAN SUDO                                │
│                                                                 │
│        AI should make you MORE secure, not less.                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────┐│
│  │ glass-card   │  │ glass-card   │  │ glass-card   │  │glass │││
│  │              │  │              │  │              │  │card  │││
│  │ [Lock]       │  │ [Search]     │  │ [RotateCcw]  │  │      │││
│  │              │  │              │  │              │  │[File]│││
│  │ Sandboxed    │  │ Preview      │  │ Instant      │  │Audit │││
│  │ Execution    │  │ Before       │  │ Rollback     │  │Trail │││
│  │              │  │ Execute      │  │              │  │      │││
│  │ Firejail     │  │ Review all   │  │ Undo any     │  │Track │││
│  │ isolation    │  │ commands     │  │ change in    │  │every │││
│  │              │  │              │  │ seconds      │  │change│││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────┘│
│                                                                 │
│              [Shield icon] 46 Dangerous Pattern Rules           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 7: Comparison Table

**ID:** `#compare`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   HOW WE COMPARE                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ glass-card (table container)                            │   │
│  │                                                         │   │
│  │  Feature              Warp    Copilot CLI   Cortex     │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  AI-assisted            ✓          ✓           ✓       │   │
│  │  Hardware detection     ✗          ✗           ✓       │   │
│  │  Dependency resolution  ✗          ✗           ✓       │   │
│  │  GPU optimization       ✗          ✗           ✓       │   │
│  │  System configuration   ✗          ✗           ✓       │   │
│  │  OS-level integration   ✗          ✗           ✓       │   │
│  │  Preview commands       ✓          ✓           ✓       │   │
│  │  Rollback capability    ✗          ✗           ✓       │   │
│  │  Works offline          ✗          ✗           ✓       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Table Styling:**
- Header row: bg-white/5
- Checkmarks: text-terminal-green (✓)
- X marks: text-red-400 (✗)
- Cortex column: Highlighted with subtle blue glow

---

## Section 8: Use Cases Grid

**ID:** `#use-cases`
**Layout:** Grid md:grid-cols-2 gap-6

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    WHO IS THIS FOR?                             │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │ glass-card              │  │ glass-card              │      │
│  │                         │  │                         │      │
│  │ DATA SCIENTISTS         │  │ DEVOPS ENGINEERS        │      │
│  │                         │  │                         │      │
│  │ Before: 6 hours         │  │ Before: 4 hours         │      │
│  │ installing CUDA +       │  │ configuring Oracle DB   │      │
│  │ TensorFlow              │  │                         │      │
│  │                         │  │                         │      │
│  │ After: 5 minutes        │  │ After: 4 minutes        │      │
│  │                         │  │                         │      │
│  │ Time saved: 5h 55m      │  │ Time saved: 3h 56m      │      │
│  │                         │  │                         │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │ glass-card              │  │ glass-card              │      │
│  │                         │  │                         │      │
│  │ ML ENGINEERS            │  │ STUDENTS                │      │
│  │                         │  │                         │      │
│  │ Before: 3 hours         │  │ Before: "Works on my    │      │
│  │ debugging PyTorch +     │  │ machine" but crashes    │      │
│  │ CUDA conflicts          │  │ on professor's system   │      │
│  │                         │  │                         │      │
│  │ After: Automatic        │  │ After: Reproducible     │      │
│  │ resolution              │  │ environments            │      │
│  │                         │  │                         │      │
│  │ Time saved: 3h          │  │ Frustration: Eliminated │      │
│  │                         │  │                         │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 9: Pricing Cards

**ID:** `#pricing`
**Layout:** Grid md:grid-cols-3 gap-8

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      SIMPLE PRICING                             │
│                                                                 │
│  ┌───────────────┐  ┌───────────────────┐  ┌───────────────┐   │
│  │ glass-card    │  │ glass-card        │  │ glass-card    │   │
│  │               │  │ [pricing-gradient │  │               │   │
│  │ FREE          │  │  -border]         │  │ ENTERPRISE    │   │
│  │               │  │                   │  │               │   │
│  │ $0/mo         │  │ PRO              │  │ Custom        │   │
│  │               │  │                   │  │               │   │
│  │ ✓ Local LLMs │  │ $19/mo            │  │ ✓ Everything  │   │
│  │ ✓ Basic      │  │                   │  │   in Pro      │   │
│  │   features    │  │ ✓ Cloud LLMs    │  │ ✓ SSO         │   │
│  │ ✓ Community  │  │ ✓ Voice input   │  │ ✓ Compliance  │   │
│  │   support     │  │ ✓ Priority      │  │   reporting   │   │
│  │               │  │   support        │  │ ✓ SLA         │   │
│  │               │  │ ✓ Unlimited     │  │ ✓ Dedicated   │   │
│  │               │  │   queries        │  │   support     │   │
│  │               │  │                   │  │               │   │
│  │ [Get Started] │  │ [Start Trial]    │  │ [Contact Us]  │   │
│  │               │  │ MOST POPULAR     │  │               │   │
│  └───────────────┘  └───────────────────┘  └───────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Pro Card Styling:**
- Use `pricing-gradient-border` class (rotating blue conic gradient)
- "MOST POPULAR" badge at bottom

---

## Section 10: Testimonials

**ID:** `#testimonials`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                 WHAT BETA TESTERS SAY                           │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ glass-card    │  │ glass-card    │  │ glass-card    │       │
│  │               │  │               │  │               │       │
│  │ "This saved   │  │ "Finally,     │  │ "Security     │       │
│  │ me 20 hours   │  │ Linux that    │  │ features give │       │
│  │ on my last    │  │ works with    │  │ me confidence │       │
│  │ project       │  │ you."         │  │ to use AI at  │       │
│  │ setup."       │  │               │  │ system level."│       │
│  │               │  │               │  │               │       │
│  │ — Beta Tester │  │ — Beta Tester │  │ — Beta Tester │       │
│  │               │  │               │  │               │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 11: Final CTA

**ID:** `#join`
**Background:** Dramatic centered blue glow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│         [Large blue gradient glow behind]                       │
│                                                                 │
│                 READY TO TRY?                                   │
│                                                                 │
│      Tell your server what you want.                            │
│          It figures out the rest.                               │
│                                                                 │
│              [Get Started on GitHub]                            │
│                                                                 │
│         [Newsletter signup input field]                         │
│         [Email]        [Subscribe]                              │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**CTA Button:**
- Large: px-8 py-4
- bg-brand-blue with hover glow
- Icon: GitHub logo

**Newsletter:**
- Glass card input with button
- Placeholder: "Get updates on new releases"

---

## Section 12: Footer

**Component:** Matches existing Footer.tsx

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  CORTEX LINUX                                                   │
│  The AI-Native Operating System                                 │
│                                                                 │
│  Product          Resources        Company        Community     │
│  ─────────        ─────────        ─────────      ─────────     │
│  Get Started      Documentation    About          Discord       │
│  Pricing          Blog             Careers        Twitter       │
│  Security         News             Contact        GitHub        │
│  Architecture     FAQ              Press                        │
│                   License                                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  © 2025 Cortex Linux. All rights reserved.                      │
│                                                                 │
│  [Status: ● Operational]    [Privacy] [Terms]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mobile Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| **< 640px (sm)** | Single column layouts, stacked cards, hamburger menu |
| **640-768px (md)** | 2-column grids where applicable |
| **768-1024px (lg)** | 3-column grids, full navigation |
| **> 1024px (xl)** | Max-width containers (max-w-7xl) |

---

## Animation Notes

1. **Hero Terminal:** Use existing `fadeInLine` for output lines (staggered 0.15s delays)
2. **Cards on Scroll:** Fade in with translateY(20px) on intersection
3. **Feature Icons:** Scale 1.08 + drop-shadow on hover (`glass-card svg` rule)
4. **CTA Buttons:** translateY(-1px) scale(1.01) on hover
5. **Background Blobs:** `blobFloat` animation (15s ease-in-out infinite)

---

## CSS Classes to Reuse

From existing `index.css`:
- `.glass-card` - Base card styling
- `.glass-card-hover` - Hover effects
- `.code-editor` - Terminal/code blocks
- `.gradient-text` - Blue gradient text
- `.bg-brand-blue` - #0066FF
- `.text-terminal-green` - #00FF00
- `.bg-blob-blue` - Background glow orbs
- `.pricing-gradient-border` - Rotating border for Pro card

---

## Implementation Notes

1. **Data Source:** Use `client/src/data/landing.ts` for content
2. **Components:** Leverage existing UI components from `client/src/components/ui/`
3. **Sections Component:** Create `client/src/sections/HomePage.tsx` (already exists)
4. **Analytics:** Track all CTA clicks via `analytics.trackCTAClick()`
5. **Test IDs:** Include data-testid on all interactive elements

---

*This wireframe aligns with the existing CortexLinuxcom-Website design system and can be implemented using existing components and styles.*
