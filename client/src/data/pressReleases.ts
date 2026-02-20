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
    slug: "cx-linux-announces-global-ai-hackathon",
    title: "CX Linux Announces Global AI Hackathon for Developers Worldwide",
    headline: "CX Linux Announces Global AI Hackathon for Developers Worldwide",
    date: "2026-01-11",
    dateline: "Salt Lake City, UT",
    summary: "CX Linux today announced its first global AI Hackathon, inviting developers, researchers, and builders from around the world to participate in shaping the future of AI-native operating systems.",
    content: [
      "CX Linux today announced its first global AI Hackathon, inviting developers, researchers, and builders from around the world to participate in shaping the future of AI-native operating systems. The event marks a major milestone for CX Linux as it opens its ecosystem to the global developer community and accelerates innovation around AI-first system design.",
      "Designed for engineers who want to build closer to the system layer, the hackathon challenges participants to explore how artificial intelligence can be embedded directly into the operating system — not as an add-on, but as a foundational capability. CX Linux positions itself as an AI-native Linux distribution built specifically for developers, startups, and AI-first teams who need performance, security, and intelligence working together by default."
    ],
    subheadings: [
      {
        title: "A Hackathon Built for the Next Generation of System-Level AI",
        paragraphs: [
          "Unlike traditional hackathons that focus on applications or surface-level integrations, the CX Linux AI Hackathon emphasizes deep technical innovation. Participants are encouraged to build tools, workflows, and system-level enhancements that leverage CX Linux's AI layer, automation primitives, and developer-first architecture.",
          "By focusing on the operating system itself, CX Linux aims to unlock entirely new categories of AI-powered software that are not constrained by traditional application boundaries."
        ]
      },
      {
        title: "Open, Global, and Community-Driven",
        paragraphs: [
          "The hackathon is open to developers worldwide, with participation available fully online. CX Linux is committed to fostering an open and inclusive developer ecosystem, welcoming contributors ranging from independent hackers and students to startup teams and experienced system engineers.",
          "As a community-driven project, CX Linux views this hackathon as more than a competition — it is an invitation to co-create the platform. Selected submissions may influence future roadmap decisions, core features, and long-term architectural direction.",
          "Prizes, recognition, and post-hackathon opportunities will be announced closer to launch, with a focus on rewarding projects that demonstrate technical depth, originality, and real-world impact."
        ]
      },
      {
        title: "Why This Matters",
        paragraphs: [
          "As AI systems grow more powerful, the limitations of traditional operating systems become increasingly apparent. CX Linux was created to address this gap by rethinking how intelligence, automation, and security should exist below the application layer.",
          "This hackathon represents a concrete step toward that vision — empowering developers to experiment, prototype, and push boundaries at the system level, where the next wave of AI innovation is expected to emerge."
        ]
      }
    ],
    bulletPoints: [
      {
        heading: "Focus Areas for Participants",
        items: [
          "AI-assisted system administration and observability",
          "Intelligent developer tooling embedded at the OS level",
          "Autonomous infrastructure workflows",
          "Secure AI-driven system optimization",
          "New paradigms for human–machine interaction at the operating system layer"
        ]
      }
    ],
    links: [
      { label: "Official Website", url: "https://cxlinux.com" },
      { label: "Hackathon Details", url: "https://cxlinux.com/hackathon" },
      { label: "GitHub Repository", url: "https://github.com/cxlinux-ai/cx-core" }
    ],
    contactInfo: {
      name: "Press Team",
      title: "CX Linux",
      email: "press@cxlinux.com"
    },
    boilerplate: "CX Linux is an AI-native Linux operating system designed for developers, AI founders, and modern engineering teams. By integrating intelligence directly into the OS, CX Linux aims to reduce friction, accelerate development, and enable new classes of AI-driven workflows — without sacrificing transparency, performance, or control. The project is built with a strong emphasis on developer experience, security, and long-term maintainability.",
    companyBoilerplate: "For more information about the hackathon, participation details, and upcoming announcements, visit cxlinux.com.",
    tags: ["Hackathon", "AI", "Developer Community", "Linux", "Global Event"],
    keywords: [
      "AI Linux distribution",
      "AI-native operating system",
      "Linux hackathon 2026",
      "global AI hackathon",
      "system-level AI",
      "AI infrastructure",
      "CX Linux",
      "developer hackathon",
      "AI-first system design"
    ],
    image: "/images/coding_hackathon_dev_1f49254e.jpg"
  },
  {
    slug: "cx-linux-v25-released-enhanced-ai-automation",
    title: "CX Linux v2.5 Released with Enhanced AI Automation and Developer Productivity Features",
    headline: "CX Linux v2.5 Released with Enhanced AI Automation and Developer Productivity Features",
    date: "2025-12-15",
    dateline: "Salt Lake City, UT",
    summary: "CX Linux v2.5 delivers major AI automation upgrades, including natural language system commands, intelligent package management, and automated security patching. This release marks the most significant update to the AI-native operating system, bringing production-ready features for developers and enterprise teams.",
    content: [
      "CX Linux today announced the release of version 2.5, a major update that significantly expands the AI-native capabilities of the operating system. The release introduces advanced natural language command processing, intelligent workflow automation, and enhanced security features designed for production environments.",
      "Version 2.5 represents months of development informed by community feedback and real-world usage patterns. The update focuses on reliability, performance, and deeper AI integration at every layer of the operating system, from package management to system configuration.",
      "Developers can now interact with CX Linux using conversational commands, automate complex multi-step workflows with minimal configuration, and benefit from AI-driven system optimization that adapts to their workloads over time."
    ],
    subheadings: [
      {
        title: "Key Features in v2.5",
        paragraphs: [
          "Natural Language System Control now supports complex, multi-step commands with context awareness. Users can describe what they want to accomplish in plain English, and CX Linux translates those requests into safe, verified system operations.",
          "Intelligent Package Management learns from user behavior to suggest relevant packages, resolve dependency conflicts automatically, and optimize installation workflows. The AI layer also monitors for security vulnerabilities and can apply patches with user approval.",
          "Automated Security Patching introduces a proactive approach to system security. CX Linux continuously monitors for critical vulnerabilities and can schedule or apply patches during low-usage periods, minimizing disruption while maximizing protection."
        ]
      },
      {
        title: "Performance and Reliability Improvements",
        paragraphs: [
          "Version 2.5 includes substantial performance optimizations, reducing AI inference latency by 40% and improving overall system responsiveness. Memory management has been refined to better support long-running AI workloads and containerized applications.",
          "Reliability enhancements include improved rollback capabilities, more granular system snapshots, and better error recovery. These features ensure that developers can experiment confidently, knowing they can restore previous states quickly if needed."
        ]
      },
      {
        title: "Community and Enterprise Adoption",
        paragraphs: [
          "The v2.5 release is available immediately for all users through the standard CX Linux update channels. Enterprise customers receive additional features including centralized fleet management, advanced audit logging, and priority support.",
          "CX Linux encourages developers to upgrade, explore the new features, and share feedback through the community Discord and GitHub repository."
        ]
      }
    ],
    bulletPoints: [
      {
        heading: "Highlights of CX Linux v2.5",
        items: [
          "Natural language command processing with multi-step context awareness",
          "AI-powered package recommendations and dependency resolution",
          "Automated security patching with scheduled deployment options",
          "40% reduction in AI inference latency",
          "Enhanced rollback and system snapshot capabilities",
          "Improved memory management for AI and containerized workloads"
        ]
      }
    ],
    links: [
      { label: "Download v2.5", url: "https://cxlinux.com/download" },
      { label: "Release Notes", url: "https://cxlinux.com/releases/v2.5" },
      { label: "GitHub Repository", url: "https://github.com/cxlinux-ai/cx-core" }
    ],
    contactInfo: {
      name: "Press Team",
      title: "CX Linux",
      email: "press@cxlinux.com"
    },
    boilerplate: "CX Linux is an AI-native Linux operating system designed for developers, AI founders, and modern engineering teams. By integrating intelligence directly into the OS, CX Linux aims to reduce friction, accelerate development, and enable new classes of AI-driven workflows — without sacrificing transparency, performance, or control. The project is built with a strong emphasis on developer experience, security, and long-term maintainability.",
    tags: ["Product Release", "v2.5", "AI Automation", "Natural Language", "Security", "Linux", "Update"],
    keywords: [
      "CX Linux v2.5",
      "AI Linux release",
      "AI-native operating system update",
      "natural language Linux commands",
      "intelligent package management",
      "automated security patching",
      "AI automation Linux",
      "CX Linux features",
      "Linux AI integration",
      "developer productivity Linux"
    ],
    image: "/images/software_development_fa9eac1f.jpg"
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
