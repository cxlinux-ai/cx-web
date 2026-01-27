# Cortex Linux Landing Page - Design Guidelines

## Design System Foundation

**Color Palette:**
- Primary Blue: #3B82F6
- Primary Dark: #2563EB
- Background: #0A0A0A (solid black)
- Card Background: #1A1A2E
- Glass Effect: white/5 with backdrop-blur-xl
- Borders: white/10 opacity
- Text: White primary, gray-400 secondary, blue-400 accents

**Typography:**
- Font Family: System UI stack (system-ui, -apple-system, sans-serif)
- Headlines: Extrabold (800), sizes from 4xl to 8xl responsive
- Body Text: Base to XL, medium weight
- Color Hierarchy: White for primary, gray-400 for secondary, blue-400 for accents

**Spacing System:**
- Section Padding: py-20 (80px vertical)
- Container: max-w-7xl with horizontal padding px-4 sm:px-6 lg:px-8
- Card Padding: p-6 to p-8
- Grid Gaps: gap-4 to gap-12 based on context

## Navigation Bar

Fixed position at top with backdrop-blur-xl and bg-black/50, height 64px. Logo displays "CORTEX" in white + "LINUX" in blue with hover glow effect. Center navigation links (Home, About, Join, Sponsor) transition from gray to blue-400 on hover. "Get Started" CTA button with blue-500 background, glow on hover with scale-105 transform. Mobile: hamburger menu with full-width dropdown, backdrop blur, vertical link stack.

## Hero Section (Full Viewport)

Centered content with gradient headline: "THE AI-NATIVE OPERATING SYSTEM" using bg-gradient from gray-300 via gray-200 to blue-400, sizes text-6xl/7xl/8xl responsive. Subheading in gray-400, max-w-3xl. Two CTAs: primary "Join the Revolution" (blue-500 with glow), secondary "View on GitHub" (border-2 blue-400 with GitHub icon). Stats bar below with 3 columns: "Open Source", "Community Driven" (with side borders), "$50-100B Market". Optional: dotted grid pattern overlay and radial gradient glow behind headline.

## Statistics Section

Gradient background from transparent to black/50 with border-top. "Project Momentum" headline. 2x4 responsive grid of glass-morphism cards showing: 29 Active Issues, $3,000+ Bounties, 8-10 Contributors, 3 PRs Merged. Each card: white/5 background, border white/10, rounded-2xl, p-8. Numbers in text-5xl/6xl blue-400, labels in gray-400. Cards scale to 1.05 and show blue glow on hover.

## About Section

"What Makes Cortex Different?" headline. 3-column grid (responsive to 1 column mobile) with 6 feature cards:
1. Natural Language Control (Brain icon)
2. Enterprise-Grade Security (Shield icon)
3. Learns Your Workflow (TrendingUp icon)
4. Smart Package Management (Package icon)
5. Time-Travel System Recovery (RotateCcw icon)
6. Open Source (Github icon)

Each card: glass-morphism (white/5, backdrop-blur-xl), border white/10, rounded-2xl, p-8. Icon containers 64x64 with blue-500/20 background, rounded-xl. Icons rotate 10° on hover. Cards scale to 1.02, translate-y-2, border becomes blue-400 with blue glow on hover. Staggered entrance animations.

## How It Works Section

Gradient background from black to blue-950/10. "From Natural Language to Execution" headline. Horizontal 4-step flow (stacks vertically mobile):
1. You Ask (MessageSquare icon)
2. AI Understands (Brain icon)
3. Safe Execution (Shield icon)
4. Verification (CheckCircle icon)

Each step: glass card with numbered badge (absolute top-right), 64x64 icon container, title, description. ChevronRight arrows between steps on desktop. Below: green success result card with green-500 border, green-500/10 background showing "Python 3.11, Docker 24.0.5, and VS Code configured and ready" with CheckCircle icon.

## Join Section

Two-column layout (stacks mobile). Left: "For Developers" benefits card with 5 items using CheckCircle icons, covering bounties ($25-$500), AI work, community, 2x funding bonus, market opportunity. "View Open Issues" CTA button full-width. Right: "Current Opportunities" with 3-4 issue cards showing title, green bounty badge, blue skill tags, colored difficulty badges (red/yellow/green), and "Claim Issue" border button. Cards lift and glow blue on hover.

## Sponsor Section

Gradient background from black to blue-950/10. Three pricing tiers in responsive grid:
- **Bronze** ($1,000/month): Logo, Discord access, reports
- **Silver** ($5,000/month - Featured): Most Popular badge, includes Bronze + priority requests, strategy calls, co-marketing. Blue-400 border-2, blue-500 CTA background
- **Gold** ($10,000+/month): Includes Silver + dedicated support, enterprise features, case studies, advisory seat

Below tiers: Full-width enterprise partnership card with gradient from blue-500/10 to purple-500/10, border-2 blue-400/50, center-aligned with "Contact for Enterprise" CTA and ArrowRight icon.

## Community Section

Centered max-w-4xl layout. Large Discord card with white/5 background, blue gradient overlay. Discord/MessageCircle icon 80x80 with blue glow (drop-shadow). "Join Our Discord" headline, description, blue-500 CTA. Social links below in horizontal flex: GitHub, Email (mike@cortexlinux.com), Website - gray-400 that transition to blue-400 on hover.

## Footer

3-column grid (stacks mobile) with border-top white/10. Left: "CORTEX LINUX" logo with tagline, "Built by AI Venture Holdings LLC". Middle: "Resources" with links (Documentation, GitHub, Discord, Blog). Right: Funding info ("Seeking $2-3M seed funding", "Launching February 2025"), copyright. All text-sm gray-400, links hover to blue-400.

## Animation System

**Framer Motion patterns:**
- Page load: Staggered delays (0s, 0.2s, 0.4s, 0.6s, 0.8s) for hero elements
- Scroll-triggered: whileInView with opacity 0→1, y 20→0/30→0
- Viewport settings: once: true, margin: "-100px"
- Container stagger: staggerChildren: 0.1 to 0.2
- Hover: scale transforms (1.02-1.05), blue glows, icon rotations
- Transitions: duration 0.3s to 0.8s based on context

## Effects Library

- **Blue Glow**: shadow-[0_0_20px_rgba(59,130,246,0.3-0.5)]
- **Glass Morphism**: bg-white/5 backdrop-blur-xl border border-white/10
- **Gradient Text**: bg-gradient-to-r from-gray-300 via-gray-200 to-blue-400, bg-clip-text text-transparent
- **Hover Lifts**: -translate-y-2 with scale-[1.02]
- **Icon Containers**: 64x64, bg-blue-500/20, rounded-xl, centered flex

## Responsive Breakpoints

- Mobile: Default (<640px) - single column, stacked elements
- Tablet: md: (768px+) - 2-column grids, horizontal nav appears
- Desktop: lg: (1024px+) - 3-column grids, full layouts
- Wide: xl: (1280px+) - max-w-7xl containers centered

## Images

No hero image required - uses gradient text and background effects instead. All visual impact comes from typography, glass-morphism cards, icons, and blue glow effects on black background.