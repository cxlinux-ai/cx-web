# Cortex Linux Landing Page

## Overview

Cortex Linux is marketed as "The AI Layer for Linux," an intelligent assistant designed to execute unlimited tasks on Linux systems using natural language commands. Its core value proposition lies in its ability to translate natural language intent into multi-step Linux execution, covering automation, configuration, scripting, data analysis, and workflow management. The project emphasizes safety through sandboxed execution, preview-before-execute features, and instant rollback capabilities. The brand targets developers, system administrators, data scientists, DevOps teams, and power users with a professional, trustworthy, and cutting-edge tone, directly addressing security concerns. The project aims to position Cortex as a comprehensive AI solution for Linux, moving beyond simple package management to offer broad, intelligent system interaction.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React 18+ and TypeScript**, bundled using **Vite**. **shadcn/ui components** based on **Radix UI primitives** form the UI component library, adhering to a "new-york" style with a dark mode optimized color scheme. **Tailwind CSS** is used for styling, with custom utility classes and CSS variables for theming, incorporating glass-morphism effects and gradients. **Framer Motion** handles declarative animations. The design system consistently uses updated brand colors (Tech blue, Terminal green), rounded corners, low-opacity borders, and glow shadow effects.

**Routing** is managed by `wouter` for a multi-page application, including routes for the landing page, getting started guide, FAQ, blog, news, mission page, and a dedicated startup landing page. State management primarily uses React hooks for local component state, with active section tracking via scroll listeners. The design adopts a **mobile-first responsive approach** with Tailwind breakpoints.

### Backend Architecture

The backend utilizes **Express.js with Node.js and TypeScript**. During development, **Vite middleware** integrates with Express for HMR. The build process uses Vite for the frontend and **esbuild** for the backend. APIs are prefixed with `/api` and include GitHub integration endpoints for project statistics, issues, and contributors, with server-side caching. Session management is configured to use **PostgreSQL-based session storage**. A **Sapiens 0.27B Reasoning Engine** (Python-based, multi-agent system: Planner, Executor, Validator, Corrector) runs as a Flask API on port 8100, providing AI reasoning capabilities, and is designed for full offline operation.

### Data Storage

**Drizzle ORM** is used for PostgreSQL, with schema definitions and validation via `drizzle-zod`. The database provider is **Neon Database serverless PostgreSQL**. Schema design includes a `users` table, and Drizzle Kit manages database migrations. An abstracted storage layer supports both in-memory and future database implementations.

### System Design Choices and Features

- **UI/UX:** Emphasizes glass-morphism, blue glow effects on hover, dark theme, and a professional, cutting-edge aesthetic.
- **Content Strategy:** Features a comprehensive landing page with 15+ sections, a robust blog system with 14 detailed articles, an enhanced "Getting Started" guide with learning paths, and dedicated pages for news and startups. Content is SEO-optimized with meta tags, JSON-LD, and internal linking.
- **Analytics:** Integrated **Google Analytics 4 (GA4)** with custom event tracking for user interactions and conversions.
- **A/B Testing Framework:** A comprehensive A/B testing system in `client/src/lib/ab-testing.ts` with ABTestConfig interface, localStorage persistence, GA4 event tracking (ab_test_variant, ab_test_click, ab_test_scroll, ab_test_conversion), useABTest hook, and ABTestProvider. Default test configs in `client/src/data/ab-tests.ts` for home_hero, home_cta, and hackathon_cta variants.
- **Hackathon Integration:** Two-phase program (Ideathon + Hackathon) with $17,000 total prize pool. Phase 1 Ideathon (Weeks 1-4, $3.8K: 1st-3rd $250 each, 4th-10th $150 each, 11th-30th $100 each with goodie package + 1 month Premium) and Phase 2 Hackathon (Weeks 5-13, $12.8K: 1st $5K, 2nd $3K, 3rd $2K, 4th-7th $700 each with goodie package + 2 months managed). Build Sprint (Weeks 5-9) for coding, Review Period (Weeks 10-13) for code review and judging. Features hackathon registration modal, dedicated page with roadmap tracker, FOMO elements, and dynamically generated Rules PDF at `/downloads/cortex-hackathon-rules-2026.pdf`.
- **Referral Program:** IP-based referral system at `/referrals` (with backward-compatible redirect from `/waitlist`). Generates unique referral link automatically per IP address - no email required. Features tiered rewards (Bronze through Legendary), leaderboard, and referral tracking. Uses `ipReferralCodes` table for storage. Integrated across site: referral snippet on hackathon page, referral link in homepage CTA section, and footer link.
- **Hackathon Rules Page:** Dedicated legal page at `/hackathon-rules` containing all 12 sections: Introduction, Eligibility, Registration/Participation, IP (full access and ownership), Code of Conduct, Submission Rules, Privacy/Data Use, Prizes ($17K total: $3.8K Ideathon + $12.8K Hackathon), Disqualification, Limitation of Liability, Governing Law (US jurisdiction), and Acknowledgment. Linked from hackathon page ("See More Details" button) and footer Legal section.
- **AI Reasoning Engine (Sapiens):** A core component providing multi-agent AI reasoning, planning, execution, validation, and correction, accessible via a Flask API.
- **Responsive Design:** Mobile-first approach ensuring optimal viewing across devices.

## External Dependencies

- **UI Component System:** Radix UI primitives, shadcn/ui, Lucide React (for icons).
- **Animation & Interaction:** Framer Motion, embla-carousel-react, vaul.
- **Forms & Validation:** React Hook Form, @hookform/resolvers, Zod (via drizzle-zod).
- **Data Fetching:** TanStack Query (React Query) v5.
- **Database & Backend:** Neon Database serverless PostgreSQL, Drizzle ORM, connect-pg-simple.
- **Development Tools:** Replit-specific plugins, TypeScript, ESBuild, PostCSS, Tailwind CSS, Autoprefixer.
- **Utility Libraries:** date-fns, clsx, tailwind-merge, class-variance-authority, nanoid.