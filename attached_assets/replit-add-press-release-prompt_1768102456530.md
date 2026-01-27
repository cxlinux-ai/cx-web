# REPLIT PROMPT — Add Press Release to Cortex Linux Website

Copy and paste this entire prompt into Replit AI:

---

## TASK

Add a News/Press section to the Cortex Linux website and publish this press release. The press release should be live on the website BEFORE we send it to news wires, so the website becomes the canonical source.

## REQUIREMENTS

1. **Create a /news or /press route** that lists all press releases
2. **Create individual press release pages** with SEO-friendly URLs like `/news/hackathon-announcement-2026`
3. **Add the press release content below** as the first entry
4. **Include proper meta tags** for SEO (title, description, keywords, Open Graph)
5. **Add JSON-LD structured data** for Article/NewsArticle schema
6. **Link to the news section** from the main navigation
7. **Style consistently** with the existing site design

## PRESS RELEASE CONTENT

**Title:** Cortex Linux Announces Global AI Hackathon for Developers Worldwide

**Subtitle:** First hackathon for AI-native Linux operating system opens registration — prizes to be announced at launch

**Date:** January XX, 2026 (update to actual publish date)

**Location:** Salt Lake City, UT

**Body:**

AI Venture Holdings LLC today announced the Cortex Linux Hackathon 2026, a global competition inviting developers to build the future of AI-powered Linux system administration. The hackathon launches February 17, 2026, with cash prizes and additional rewards to be announced on launch day.

Cortex Linux is an open-source, AI-native Linux distribution that translates natural language commands into system operations. Instead of memorizing complex terminal syntax or searching through documentation, users describe what they want in plain English — like "install a secure web server with SSL certificates" — and the Cortex AI package manager handles the installation, configuration, and troubleshooting automatically.

"We're building the AI layer for Linux," said Michael J. Morgan, CEO and Founder of AI Venture Holdings LLC. "Enterprise teams spend billions on system administration that AI can streamline. This hackathon invites the global developer community to help shape what AI-powered infrastructure should become."

### Two-Phase Competition Structure

**Phase 1: Ideation**
Participants submit innovative proposals for new features, enterprise integrations, monetization strategies, and technical improvements to the Cortex Linux platform. The best ideas advance to Phase 2 and receive cash awards.

**Phase 2: Implementation**
Selected teams build their proposals as working code, submitted via GitHub pull requests to the official Cortex Linux repository. Winning implementations become part of the core platform, with contributors credited in the project.

Prize amounts and category awards will be announced on the February 17 launch date. Registration is now open.

### Beyond Prizes: Real Career Value

The Cortex Linux Hackathon offers participants more than cash prizes:

- GitHub Contributions — Merged pull requests to a growing open-source AI infrastructure project
- Certificates — Official participation certificates for all contributors
- Mentorship — Direct access to senior Linux and AI developers
- Community — Networking with developers worldwide through Discord and live events
- Recognition — LinkedIn endorsements and portfolio-worthy project experience

### Why AI-Native Linux Matters

Linux powers 96% of cloud infrastructure, yet system administration remains largely manual. Administrators memorize thousands of commands, flags, and configuration patterns — knowledge that takes years to acquire. Cortex Linux bridges this gap with AI that understands intent and translates it to action.

The project targets a massive market opportunity: enterprise IT teams seeking to reduce training costs, documentation overhead, and human error in system operations. With provisional patents filed and an Apache 2.0 open-source license, Cortex Linux combines community-driven development with enterprise-ready features.

### How to Participate

Developers of all skill levels can register now:

- Official Website: https://cxlinux-ai.com
- Hackathon Details: https://cxlinux-ai.com/hackathon
- GitHub Repository: https://github.com/cxlinux-ai/cortex
- YouTube Channel: https://youtube.com/@cxlinux-ai
- Discord Community: https://discord.gg/cxlinux-ai

### About Cortex Linux

Cortex Linux is the AI layer for Linux — an open-source AI-native operating system that translates natural language into system commands. Built on Debian/Ubuntu, Cortex combines the stability of enterprise Linux with intelligent automation powered by large language models.

### About AI Venture Holdings LLC

AI Venture Holdings LLC develops AI-powered tools for enterprise infrastructure. The company's flagship project, Cortex Linux, targets the growing demand for intelligent system administration in cloud and on-premises environments.

### Media Contact

Michael J. Morgan
CEO and Founder, AI Venture Holdings LLC
press@cxlinux-ai.com

---

## SEO META TAGS TO INCLUDE

```html
<title>Cortex Linux Announces Global AI Hackathon 2026 | Cortex Linux News</title>
<meta name="description" content="Cortex Linux launches global hackathon for AI-native Linux development. Register now for the first hackathon building the AI layer for Linux.">
<meta name="keywords" content="AI Linux, Linux hackathon, Cortex Linux, AI operating system, open source hackathon, developer hackathon 2026">

<!-- Open Graph -->
<meta property="og:title" content="Cortex Linux Announces Global AI Hackathon 2026">
<meta property="og:description" content="Join the first hackathon for AI-native Linux. Build the future of intelligent system administration.">
<meta property="og:type" content="article">
<meta property="og:url" content="https://cxlinux-ai.com/news/hackathon-announcement-2026">
<meta property="og:image" content="https://cxlinux-ai.com/images/hackathon-og.png">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Cortex Linux Global Hackathon 2026">
<meta name="twitter:description" content="Build the AI layer for Linux. Prizes announced February 17.">
```

## JSON-LD STRUCTURED DATA

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Cortex Linux Announces Global AI Hackathon for Developers Worldwide",
  "datePublished": "2026-01-XX",
  "dateModified": "2026-01-XX",
  "author": {
    "@type": "Organization",
    "name": "AI Venture Holdings LLC"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Cortex Linux",
    "logo": {
      "@type": "ImageObject",
      "url": "https://cxlinux-ai.com/logo.png"
    }
  },
  "description": "AI Venture Holdings announces global hackathon for Cortex Linux, the AI-native operating system.",
  "mainEntityOfPage": "https://cxlinux-ai.com/news/hackathon-announcement-2026"
}
```

## EXPECTED OUTPUT

1. New `/news` page listing all press releases
2. Individual page at `/news/hackathon-announcement-2026` with full press release
3. Navigation updated to include "News" or "Press" link
4. Proper SEO meta tags on all new pages
5. Mobile-responsive design matching existing site

## AFTER COMPLETION

Reply with:
1. The live URL of the press release page
2. Confirmation that meta tags are in place
3. Any issues encountered

---

END OF PROMPT
