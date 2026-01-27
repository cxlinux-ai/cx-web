# Replit UI Design Prompt - Cortex Linux Platform

## Overview

This prompt covers **all UI components** that need polished, production-ready styling for the Cortex Linux platform. The backend logic, API endpoints, and component structure are already implemented. **Your task is to make these components visually stunning with a cohesive dark-themed design.**

---

## Design System Requirements

### Brand Colors
```css
/* Primary Palette */
--primary: #3b82f6;        /* Blue - main brand color */
--primary-dark: #1d4ed8;   /* Darker blue for hover states */
--primary-light: #60a5fa;  /* Lighter blue for accents */

/* Neutral Palette (Dark Theme) */
--bg-primary: #0f172a;     /* Main background - slate-900 */
--bg-secondary: #1e293b;   /* Card backgrounds - slate-800 */
--bg-tertiary: #334155;    /* Elevated surfaces - slate-700 */
--text-primary: #f8fafc;   /* Main text - slate-50 */
--text-secondary: #94a3b8; /* Muted text - slate-400 */
--text-muted: #64748b;     /* Very muted - slate-500 */
--border: #334155;         /* Borders - slate-700 */

/* Accent Colors */
--success: #10b981;        /* Green for success states */
--warning: #f59e0b;        /* Amber for warnings */
--error: #ef4444;          /* Red for errors */
--info: #06b6d4;           /* Cyan for info */

/* Tier Colors (Referral System) */
--tier-bronze: #cd7f32;
--tier-silver: #c0c0c0;
--tier-gold: #ffd700;
--tier-platinum: #e5e4e2;
--tier-diamond: #b9f2ff;
--tier-legendary: linear-gradient(135deg, #ffd700, #ff6b6b);
```

### Typography
- **Headings**: Inter or system-ui, bold weights
- **Body**: Inter or system-ui, regular weight
- **Code**: JetBrains Mono or Fira Code

### Spacing
- Use Tailwind's spacing scale consistently
- Cards: `p-6` padding, `gap-4` between elements
- Sections: `py-12` to `py-24` vertical spacing

### Effects
- **Cards**: Subtle gradient borders, glass morphism optional
- **Hover**: Scale transforms (1.02), color transitions
- **Focus**: Ring outlines for accessibility
- **Shadows**: `shadow-xl` with colored glows for emphasis

---

## Component 1: Viral Referral System

**Location**: `client/src/components/referral/`

### 1.1 Waitlist Signup (`WaitlistSignup.tsx`)

**Current State**: Basic form with minimal styling
**Required Design**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     🧠  Get Early Access to Cortex Linux                    │
│         The AI-native operating system                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📧  Enter your email                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  + Connect GitHub for bonus perks (optional)                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Join Waitlist  →                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎁 You were referred by a friend!                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Requirements**:
- Centered card with glass morphism effect
- Gradient border animation on focus
- Input with icon prefix
- Large, prominent CTA button with gradient
- Subtle particle animation in background (optional)
- Referral notice with gift emoji and highlight

### 1.2 Success View (Post-Signup)

```
┌─────────────────────────────────────────────────────────────┐
│                         🎉                                  │
│                  You're on the list!                        │
│     Check your email to verify and lock in your spot        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             #1,234                                   │   │
│  │        of 5,000 in line                             │   │
│  │     ┌──────────────────────────────────────────┐    │   │
│  │     │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░│    │   │
│  │     └──────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🚀 Move up the list. Earn real perks.                      │
│                                                             │
│  ┌───────────────────────────────────┐ ┌─────────────────┐ │
│  │ cxlinux-ai.com/join?ref=ABC123   │ │  📋 Copy Link   │ │
│  └───────────────────────────────────┘ └─────────────────┘ │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ 𝕏 Share │ │ in Link │ │ ✉ Email │ │ QR Code │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  UNLOCK REWARDS                                      │   │
│  │  🥉 1 ref → +100    🥈 3 → +500    🥇 5 → Discord    │   │
│  │  ⭐ 10 → Pro Month   💎 25 → Badge   👑 50 → VIP     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Requirements**:
- Celebratory animation on mount (confetti optional)
- Large position number with gradient text
- Progress bar showing position in total
- Copy button with success animation (checkmark)
- Share buttons with platform-specific colors
- Reward tiers as horizontal scrollable badges on mobile

### 1.3 Referral Dashboard (`ReferralDashboard.tsx`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Your Referral Dashboard                              [💎 Diamond]  │
│  j***@gmail.com                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                        #847                                    │ │
│  │                   of 5,000 in line                            │ │
│  │                                                                │ │
│  │            ⬆️ +153 spots gained from referrals                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │    12    │  │     8    │  │     4    │  │    47    │          │
│  │  Total   │  │ Verified │  │ Pending  │  │  Clicks  │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                     │
│  YOUR REFERRAL LINK                                                │
│  ┌────────────────────────────────────────┐ ┌──────┐ ┌──────────┐ │
│  │ https://cxlinux-ai.com/join?ref=...   │ │ Copy │ │ QR Code  │ │
│  └────────────────────────────────────────┘ └──────┘ └──────────┘ │
│                                                                     │
│  [Overview]  [Referrals (12)]  [Rewards]                           │
│  ─────────────────────────────────────────                         │
│                                                                     │
│  NEXT REWARD                                                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  🥇 Gold Tier - Discord Role                                  │ │
│  │  ████████████████████░░░░░░░░░░░░░░  80% (4/5 referrals)     │ │
│  │  1 more referral needed!                                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Design Requirements**:
- Header with tier badge (animated shimmer for high tiers)
- Position card with gradient background matching tier
- Stats grid with icon + value + label
- Tabbed interface with smooth transitions
- Progress bar with gradient fill
- Referrals table with status badges (verified/pending)
- Rewards grid with locked/unlocked states

### 1.4 Leaderboard (`Leaderboard.tsx`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏆 Top Referrers                    [All Time] [Monthly] [Weekly] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│          ┌─────────┐                                               │
│          │   👑    │                                               │
│          │  🥇 #1  │                                               │
│          │ devking │                                               │
│          │  127    │                                               │
│  ┌─────┐ └─────────┘ ┌─────┐                                      │
│  │ 🥈  │             │ 🥉  │                                      │
│  │ #2  │             │ #3  │                                      │
│  │sarah│             │alex │                                      │
│  │ 98  │             │ 76  │                                      │
│  └─────┘             └─────┘                                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  #  │  Referrer          │  Tier      │  Referrals          │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  4  │  🟣 ml_engineer    │  Platinum  │  45                 │   │
│  │  5  │  🔵 Anonymous      │  Gold      │  38                 │   │
│  │  6  │  🔵 kernel_hacker  │  Gold      │  31                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Design Requirements**:
- Podium with 3D effect for top 3
- Crown animation for #1
- Filter buttons with active state
- Table with alternating row colors
- Tier badges with gradient backgrounds
- Hover effect showing full stats
- "Your rank" highlight if user is on board

### 1.5 Share Cards (`ShareCard.tsx`)

Create visually stunning, social-media-ready cards for:

1. **Waitlist Position Card** - Shows position with branding
2. **Install Success Card** - Celebratory design
3. **Command Success Card** - Terminal-style with result
4. **GitHub Badge** - Clean, professional badge

**Design Requirements**:
- Each card should be screenshot-worthy
- Dark gradient backgrounds
- Brand elements (logo, colors)
- Social media optimal dimensions (1200x630)
- Download/share functionality

---

## Component 2: Bounties Board (NEW)

**Location**: `client/src/pages/BountiesPage.tsx` (to be styled)

### 2.1 Main Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  💰 BOUNTY BOARD                                    [Auto-refresh ⟳]│
│  Earn rewards by contributing to Cortex Linux                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🔍 ┌──────────────────────────────┐  [All ▼] [Newest ▼]           │
│     │ Search bounties...           │                               │
│     └──────────────────────────────┘                               │
│                                                                     │
│  ┌─────────────────────┐ ┌─────────────────────┐                   │
│  │  12 Open            │ │  47 Completed       │                   │
│  │  $2,450 available   │ │  $8,750 paid out    │                   │
│  └─────────────────────┘ └─────────────────────┘                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🟢 OPEN                              $500        [Advanced] │   │
│  │  ──────────────────────────────────────────────────────────│   │
│  │  Windows Subsystem for Linux Support                        │   │
│  │                                                              │   │
│  │  Add WSL2 support for running Cortex on Windows...          │   │
│  │                                                              │   │
│  │  👤 mikelinke  •  💬 23 comments  •  📅 3 days ago          │   │
│  │                                                              │   │
│  │  [Python] [Windows] [Integration]          [View on GitHub →]│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ✅ COMPLETED                         $200        [Medium]   │   │
│  │  ──────────────────────────────────────────────────────────│   │
│  │  Improve Error Messages                                      │   │
│  │                                                              │   │
│  │  Make error messages more user-friendly and actionable...   │   │
│  │                                                              │   │
│  │  👤 sarahchen  •  💬 15 comments  •  ✓ Closed 2 days ago    │   │
│  │                                                              │   │
│  │  [UX] [CLI]                                [View on GitHub →]│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Design Requirements**:
- Search bar with icon and focus ring
- Filter/sort dropdowns with custom styling
- Summary cards showing totals
- Bounty cards with:
  - Status indicator (green open, gray completed)
  - Bounty amount prominently displayed
  - Difficulty badge with color coding
  - Author avatar and username
  - Comment count and date
  - Skill/label tags
  - GitHub link button
- High-value bounties (>$300) with special highlight/glow
- Loading skeleton matching card structure
- Empty state with CTA
- Error state with retry button

### 2.2 Card States

**Loading Skeleton**:
```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░                              ░░░░        ░░░░░░ │
│  ──────────────────────────────────────────────────────────│
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │
│                                                             │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                             │
│  ░░░  ░░░░░░░░  •  ░░░░░░░░░░  •  ░░░░░░░░░░              │
│                                                             │
│  ░░░░░░  ░░░░░░░░  ░░░░░░░░                  ░░░░░░░░░░░░░ │
└─────────────────────────────────────────────────────────────┘
```

**Empty State**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         🎉                                  │
│                                                             │
│              No bounties match your search                  │
│                                                             │
│              Try adjusting your filters or                  │
│              check back later for new bounties              │
│                                                             │
│                    [Clear Filters]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Error State**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         ⚠️                                  │
│                                                             │
│              Failed to load bounties                        │
│                                                             │
│              GitHub API may be temporarily                  │
│              unavailable. Please try again.                 │
│                                                             │
│                    [Retry]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component 3: Documentation Site

**Location**: `docs/` (Docusaurus)

### 3.1 AI Assistant Chat Bubble

**Current**: Basic floating button
**Required**: Polished chat interface

```
                                    ┌─────────────────────────┐
                                    │ 🧠 Ask about Cortex    ×│
                                    ├─────────────────────────┤
                                    │                         │
                                    │  Hi! I can help you     │
                                    │  find information in    │
                                    │  the docs.              │
                                    │                         │
                                    │  Try asking about:      │
                                    │  • Installation         │
                                    │  • Dry-run mode         │
                                    │  • Rollback             │
                                    │                         │
                                    ├─────────────────────────┤
                                    │                    You: │
                                    │  How do I install?      │
                                    ├─────────────────────────┤
                                    │ 🧠 Assistant:           │
                                    │                         │
                                    │  Run this command:      │
                                    │  ┌───────────────────┐  │
                                    │  │ curl -fsSL ...    │  │
                                    │  └───────────────────┘  │
                                    │                         │
                                    │  📚 Related:            │
                                    │  [Installation Guide]   │
                                    │  [Quick Start]          │
                                    │                         │
                                    ├─────────────────────────┤
                                    │ ┌───────────────────┐   │
                                    │ │ Ask about Cortex  │ → │
                                    │ └───────────────────┘   │
                                    └─────────────────────────┘

                                                         [🧠]
```

**Design Requirements**:
- Smooth open/close animation
- Message bubbles with distinct user/assistant styling
- Code blocks with syntax highlighting
- Typing indicator animation
- Quick suggestion chips
- Resize handle for chat window

### 3.2 Quick Start Widget

**Current**: Basic install command box
**Required**: Eye-catching sticky widget

```
┌─────────────────────────────────────┐
│  ⚡ QUICK INSTALL                   │
├─────────────────────────────────────┤
│                                     │
│  curl -fsSL cxlinux-ai.com/i | sh  │
│                                     │
│            [📋 Copy]                │
│                                     │
│  ✓ Copied to clipboard!            │
│                                     │
├─────────────────────────────────────┤
│  Works on Ubuntu, Fedora, Arch...   │
└─────────────────────────────────────┘
```

**Design Requirements**:
- Gradient border or glow effect
- Copy button with animated feedback
- Toast notification on copy
- Sticky positioning in sidebar

---

## Tailwind Configuration

Ensure your `tailwind.config.js` includes:

```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        tier: {
          bronze: '#cd7f32',
          silver: '#c0c0c0',
          gold: '#ffd700',
          platinum: '#e5e4e2',
          diamond: '#b9f2ff',
        }
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

## Animation Guidelines

1. **Page Transitions**: Fade in content with slight upward motion
2. **Cards**: Scale on hover (1.02), shadow increase
3. **Buttons**: Color transition, slight scale on press
4. **Modals**: Fade + scale from center
5. **Toasts**: Slide in from right
6. **Loading**: Pulse animation for skeletons
7. **Success**: Checkmark animation, confetti optional

---

## Accessibility Requirements

- All interactive elements keyboard accessible
- Focus states visible with ring
- Color contrast meets WCAG AA
- Screen reader labels for icons
- Reduced motion option respected
- Form validation announcements

---

## Priority Order

1. **High**: Bounties Board (new feature, needs full styling)
2. **High**: Waitlist Signup + Success (conversion-critical)
3. **Medium**: Referral Dashboard
4. **Medium**: Leaderboard
5. **Low**: Share Cards
6. **Low**: Documentation AI Assistant

---

## Testing Checklist

- [ ] All components render correctly in dark mode
- [ ] Responsive on mobile (320px), tablet (768px), desktop (1280px+)
- [ ] Loading states display properly
- [ ] Error states with retry work
- [ ] Animations are smooth (60fps)
- [ ] Forms validate and show errors
- [ ] All links/buttons are clickable
- [ ] Copy functionality works
- [ ] Share buttons open correct URLs

---

**Note to Replit Designer**: The backend API endpoints and component logic are already implemented. Focus purely on visual design, animations, and polish. Use the existing component props and state - just make them look amazing!
