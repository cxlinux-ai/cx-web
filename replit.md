# Cortex Linux Landing Page

## Overview

Professional marketing landing page and FAQ for Cortex Linux - an AI-native operating system that makes Linux easy through natural language commands. Tagline: "Linux that understands you. No documentation required."

**Brand Identity:**
- Colors: Tech blue (#0066FF primary), Terminal green (#00FF00 success), Dark theme (#0A0A0A background)
- Target audience: Data scientists, ML engineers, DevOps teams, students
- Tone: Professional, trustworthy, cutting-edge but addresses security concerns directly

**Current Status (December 2025):**
- Complete landing page with 15+ sections including hero, problem/solution, security, comparison, use cases, pricing, testimonials, contributors, blog preview
- Blog Preview Section on homepage showing 3 latest posts with hover effects and blue glow accents
- Full Blog system at /blog with 10 deep technical articles (2000-2500 words each), search functionality, and category filters across 8 categories
- Individual blog post pages at /blog/:slug with:
  - Sticky Table of Contents sidebar on desktop
  - SEO meta tags (Open Graph) with proper cleanup on navigation
  - JSON-LD structured data for BlogPosting schema
  - Word count display and reading time
  - Related articles section
- Blog categories: Fundamentals, Tutorials, Performance, Best Practices, Infrastructure, Troubleshooting, Security, Industry Trends
- Contributors section with GitHub avatar grid collage showing all developers (8 fallback contributors displayed)
- Comprehensive FAQ page with 30 questions across 7 categories with real-time search
- Live GitHub API integration for project statistics and contributors (currently showing 401 auth errors, non-blocking)
- Full responsive design with mobile navigation
- Smooth scroll navigation between sections
- Framer Motion animations throughout including stagger animations in contributors grid

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, bundled using Vite for fast development and optimized production builds.

**UI Component Library**: shadcn/ui components built on Radix UI primitives. The design system follows the "new-york" style variant with customized color schemes optimized for dark mode. All UI components are located in `client/src/components/ui/` and are highly composable and accessible.

**Styling Approach**: Tailwind CSS with extensive customization. The configuration uses CSS variables for theming, enabling both light and dark modes. Custom utility classes include `hover-elevate` and `active-elevate-2` for interactive feedback. The design emphasizes glass-morphism effects (`backdrop-blur-xl`, `bg-white/5`) and gradients for a premium, modern aesthetic.

**Animation Library**: Framer Motion for declarative animations including fade-ins, slides, and interactive transitions. Used extensively in hero section and scroll-triggered animations.

**Design System**: Updated brand colors in index.css (Tech blue #0066FF primary, Terminal green #00FF00 success). Glass-morphism effects throughout with backdrop-blur-xl, bg-white/5, and subtle borders. Consistent rounded corners, low-opacity borders, and glow shadow effects.

**Routing Strategy**: Multi-page application using wouter for client-side routing. Routes include:
- `/` - Landing page with smooth scrolling to section anchors (home, about, security, pricing, join)
- `/faq` - Comprehensive FAQ page with search
- `/beta` - Interactive beta preview/demo page
- `/blog` - Blog index with all posts, search, and category filtering
- `/blog/:slug` - Individual blog post pages with full content and related posts
Navigation tracks active sections via scroll position on the homepage.

**State Management**: React hooks (useState, useEffect) for local component state. No global state management needed for this marketing site. Active section tracking handled via scroll event listeners.

**Responsive Design**: Mobile-first approach with Tailwind breakpoints (sm, md, lg). Mobile menu toggle for navigation. Grid layouts collapse to single column on mobile. Typography and spacing scale responsively.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript. Development server runs on port configured by Vite, production serves static assets.

**Development Setup**: Vite middleware integrated with Express for hot module replacement during development. Custom logger for request tracking.

**Build Process**: 
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Production runs bundled Express server serving static frontend

**API Structure**: Backend with routes prefixed with `/api`. Includes GitHub API integration endpoints:
- `/api/github/stats` - Fetches project statistics (stars, forks, contributors count, PRs, issues)
- `/api/github/issues` - Fetches open issues with bounty information
- `/api/github/contributors` - Fetches full contributor list with avatars, profiles, and commit counts (15-minute server-side caching)
Note: Currently shows 401 auth errors due to missing GITHUB_TOKEN, but displays fallback data (non-blocking).

**Session Management**: Uses `connect-pg-simple` for PostgreSQL-based session storage, indicating planned session functionality.

### Data Storage

**ORM**: Drizzle ORM configured for PostgreSQL with schema definitions in `shared/schema.ts`.

**Database Provider**: Neon Database serverless PostgreSQL (`@neondatabase/serverless` driver).

**Schema Design**: Currently includes a users table with id (UUID primary key), username (unique), and password fields. Uses `drizzle-zod` for schema validation.

**Migrations**: Drizzle Kit configured to output migrations to `./migrations` directory. Database schema changes managed via `npm run db:push`.

**Storage Interface**: Abstracted storage layer in `server/storage.ts` with in-memory implementation (`MemStorage`) for development and interface definition (`IStorage`) for future database implementation.

### External Dependencies

**UI Component System**: 
- Radix UI primitives (accordion, dialog, dropdown, popover, select, tabs, toast, tooltip, etc.)
- shadcn/ui configuration for consistent component styling
- Lucide React for iconography

**Animation & Interaction**:
- Framer Motion for complex animations
- embla-carousel-react for carousel components
- vaul for drawer components

**Forms & Validation**:
- React Hook Form for form state management
- @hookform/resolvers for validation integration
- Zod for schema validation (via drizzle-zod)

**Data Fetching**:
- TanStack Query (React Query) v5 for server state management
- Custom API request wrapper with credential support

**Database & Backend**:
- Neon Database serverless PostgreSQL
- Drizzle ORM for type-safe database queries
- PostgreSQL session store (connect-pg-simple)

**Development Tools**:
- Replit-specific plugins for development banner, cartographer, and error modal
- TypeScript for type safety across entire stack
- ESBuild for server bundling
- PostCSS with Tailwind and Autoprefixer

**Utility Libraries**:
- date-fns for date manipulation
- clsx and tailwind-merge for className management
- class-variance-authority for component variant patterns
- nanoid for ID generation