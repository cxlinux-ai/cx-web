export interface PressRelease {
  slug: string;
  title: string;
  headline: string;
  date: string;
  dateline: string;
  summary: string;
  content: string[];
  subheadings?: { title: string; paragraphs: string[] }[];
  quotes?: {
    text: string;
    author: string;
    title: string;
  }[];
  bulletPoints?: { heading: string; items: string[] }[];
  links?: { label: string; url: string }[];
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };
  boilerplate?: string;
  companyBoilerplate?: string;
  tags?: string[];
  image?: string;
  keywords?: string[];
}

export const pressReleases: PressRelease[] = [
  {
    slug: "cortex-linux-announces-global-ai-hackathon",
    title: "Cortex Linux Announces Global AI Hackathon for Developers Worldwide",
    headline: "Cortex Linux Announces Global AI Hackathon for Developers Worldwide",
    date: "2026-01-11",
    dateline: "SALT LAKE CITY, UT",
    summary: "First hackathon for AI-native Linux operating system opens registration — prizes to be announced at launch. AI Venture Holdings announces the Cortex Linux Hackathon 2026, a global competition for developers to build features for Cortex Linux.",
    content: [
      "AI Venture Holdings LLC today announced the Cortex Linux Hackathon 2026, a global competition inviting developers to build the future of AI-powered Linux system administration. The hackathon launches February 17, 2026, with cash prizes and additional rewards to be announced on launch day.",
      "Cortex Linux is an open-source, AI-native Linux distribution that translates natural language commands into system operations. Instead of memorizing complex terminal syntax or searching through documentation, users describe what they want in plain English — like \"install a secure web server with SSL certificates\" — and the Cortex AI package manager handles the installation, configuration, and troubleshooting automatically."
    ],
    quotes: [
      {
        text: "We're building the AI layer for Linux. Enterprise teams spend billions on system administration that AI can streamline. This hackathon invites the global developer community to help shape what AI-powered infrastructure should become.",
        author: "Michael J. Morgan",
        title: "CEO and Founder, AI Venture Holdings LLC"
      }
    ],
    subheadings: [
      {
        title: "Two-Phase Competition Structure",
        paragraphs: [
          "Phase 1: Ideation — Participants submit innovative proposals for new features, enterprise integrations, monetization strategies, and technical improvements to the Cortex Linux platform. The best ideas advance to Phase 2 and receive cash awards.",
          "Phase 2: Implementation — Selected teams build their proposals as working code, submitted via GitHub pull requests to the official Cortex Linux repository. Winning implementations become part of the core platform, with contributors credited in the project.",
          "Prize amounts and category awards will be announced on the February 17 launch date. Registration is now open."
        ]
      },
      {
        title: "Beyond Prizes: Real Career Value",
        paragraphs: [
          "The Cortex Linux Hackathon offers participants more than cash prizes:"
        ]
      },
      {
        title: "Why AI-Native Linux Matters",
        paragraphs: [
          "Linux powers 96% of cloud infrastructure, yet system administration remains largely manual. Administrators memorize thousands of commands, flags, and configuration patterns — knowledge that takes years to acquire. Cortex Linux bridges this gap with AI that understands intent and translates it to action.",
          "The project targets a massive market opportunity: enterprise IT teams seeking to reduce training costs, documentation overhead, and human error in system operations. With provisional patents filed and an Apache 2.0 open-source license, Cortex Linux combines community-driven development with enterprise-ready features."
        ]
      },
      {
        title: "How to Participate",
        paragraphs: [
          "Developers of all skill levels can register now:"
        ]
      }
    ],
    bulletPoints: [
      {
        heading: "Beyond Prizes: Real Career Value",
        items: [
          "GitHub Contributions — Merged pull requests to a growing open-source AI infrastructure project",
          "Certificates — Official participation certificates for all contributors",
          "Mentorship — Direct access to senior Linux and AI developers",
          "Community — Networking with developers worldwide through Discord and live events",
          "Recognition — LinkedIn endorsements and portfolio-worthy project experience"
        ]
      }
    ],
    links: [
      { label: "Official Website", url: "https://cortexlinux.com" },
      { label: "Hackathon Details", url: "https://cortexlinux.com/hackathon" },
      { label: "GitHub Repository", url: "https://github.com/cortexlinux/cortex" },
      { label: "YouTube Channel", url: "https://youtube.com/@cortexlinux" },
      { label: "Discord Community", url: "https://discord.gg/cortexlinux" }
    ],
    contactInfo: {
      name: "Michael J. Morgan",
      title: "CEO and Founder, AI Venture Holdings LLC",
      email: "press@cortexlinux.com"
    },
    boilerplate: "Cortex Linux is the AI layer for Linux — an open-source AI-native operating system that translates natural language into system commands. Built on Debian/Ubuntu, Cortex combines the stability of enterprise Linux with intelligent automation powered by large language models. The project is developed by AI Venture Holdings LLC, a Utah-based technology company focused on AI-powered infrastructure tools.",
    companyBoilerplate: "AI Venture Holdings LLC develops AI-powered tools for enterprise infrastructure. The company's flagship project, Cortex Linux, targets the growing demand for intelligent system administration in cloud and on-premises environments. Learn more at https://cortexlinux.com.",
    tags: ["Hackathon", "AI", "Open Source", "Developer Community", "Linux", "Competition"],
    keywords: [
      "AI Linux distribution",
      "AI-native operating system",
      "Linux hackathon 2026",
      "natural language Linux",
      "AI package manager",
      "open source AI infrastructure",
      "Cortex Linux",
      "AI system administration",
      "Linux automation",
      "developer hackathon",
      "open source hackathon",
      "enterprise Linux AI"
    ]
  }
];

export function getPressReleaseBySlug(slug: string): PressRelease | undefined {
  return pressReleases.find(pr => pr.slug === slug);
}

export function getRecentPressReleases(count: number = 5): PressRelease[] {
  return [...pressReleases]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
