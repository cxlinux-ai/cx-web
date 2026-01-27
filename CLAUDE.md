# CORTEXLINUXCOM-WEBSITE - Marketing Site

## Purpose
Public marketing website for Cortex Linux at cxlinux-ai.com.

## Repo Role in Ecosystem
- **Public face** - first impression for users
- Standalone - no code dependencies
- Links to docs, GitHub, downloads

## Key Sections
- Homepage: Hero, features, demo video
- Features: Detailed feature breakdown
- Download: ISO downloads, install instructions
- Documentation: Links to cortex-docs
- Community: Discord, GitHub, contributing
- Blog: Release notes, tutorials

## Tech Stack
- Framework: [Astro/Next.js/Hugo - check actual]
- Styling: Tailwind CSS
- Hosting: Vercel/Netlify/GitHub Pages
- Analytics: Plausible (privacy-focused)

## Local Development
```bash
npm install
npm run dev
```

## Key Pages
```
/                   # Homepage
/features           # Feature overview
/download           # Download page
/docs               # Redirects to docs.cxlinux-ai.com
/blog               # Blog/news
/community          # Community links
```

## Content Guidelines
- Clear, jargon-free language
- Focus on benefits, not just features
- Include real-world use cases
- Screenshots and demo videos
- Social proof (testimonials, GitHub stars)

## SEO Priorities
- "AI Linux" keywords
- "Natural language Linux"
- "AI system administration"
- Comparison pages (vs traditional package managers)

## Deployment
- Auto-deploy on push to main
- Preview deployments for PRs
- Custom domain: cxlinux-ai.com

## Assets
- Logo files in `/public/brand/`
- Screenshots in `/public/screenshots/`
- Demo videos hosted on YouTube/Vimeo
