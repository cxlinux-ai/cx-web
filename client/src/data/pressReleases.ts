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
    dateline: "Salt Lake City, UT",
    summary: "Cortex Linux today announced its first global AI Hackathon, inviting developers, researchers, and builders from around the world to participate in shaping the future of AI-native operating systems.",
    content: [
      "Cortex Linux today announced its first global AI Hackathon, inviting developers, researchers, and builders from around the world to participate in shaping the future of AI-native operating systems. The event marks a major milestone for Cortex Linux as it opens its ecosystem to the global developer community and accelerates innovation around AI-first system design.",
      "Designed for engineers who want to build closer to the system layer, the hackathon challenges participants to explore how artificial intelligence can be embedded directly into the operating system — not as an add-on, but as a foundational capability. Cortex Linux positions itself as an AI-native Linux distribution built specifically for developers, startups, and AI-first teams who need performance, security, and intelligence working together by default."
    ],
    subheadings: [
      {
        title: "A Hackathon Built for the Next Generation of System-Level AI",
        paragraphs: [
          "Unlike traditional hackathons that focus on applications or surface-level integrations, the Cortex Linux AI Hackathon emphasizes deep technical innovation. Participants are encouraged to build tools, workflows, and system-level enhancements that leverage Cortex Linux's AI layer, automation primitives, and developer-first architecture.",
          "By focusing on the operating system itself, Cortex Linux aims to unlock entirely new categories of AI-powered software that are not constrained by traditional application boundaries."
        ]
      },
      {
        title: "Open, Global, and Community-Driven",
        paragraphs: [
          "The hackathon is open to developers worldwide, with participation available fully online. Cortex Linux is committed to fostering an open and inclusive developer ecosystem, welcoming contributors ranging from independent hackers and students to startup teams and experienced system engineers.",
          "As an open-source–driven project, Cortex Linux views this hackathon as more than a competition — it is an invitation to co-create the platform. Selected submissions may influence future roadmap decisions, core features, and long-term architectural direction.",
          "Prizes, recognition, and post-hackathon opportunities will be announced closer to launch, with a focus on rewarding projects that demonstrate technical depth, originality, and real-world impact."
        ]
      },
      {
        title: "Why This Matters",
        paragraphs: [
          "As AI systems grow more powerful, the limitations of traditional operating systems become increasingly apparent. Cortex Linux was created to address this gap by rethinking how intelligence, automation, and security should exist below the application layer.",
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
      { label: "Official Website", url: "https://cortexlinux.com" },
      { label: "Hackathon Details", url: "https://cortexlinux.com/hackathon" },
      { label: "GitHub Repository", url: "https://github.com/cortexlinux/cortex" }
    ],
    contactInfo: {
      name: "Press Team",
      title: "Cortex Linux",
      email: "press@cortexlinux.com"
    },
    boilerplate: "Cortex Linux is an AI-native Linux operating system designed for developers, AI founders, and modern engineering teams. By integrating intelligence directly into the OS, Cortex Linux aims to reduce friction, accelerate development, and enable new classes of AI-driven workflows — without sacrificing transparency, performance, or control. The project is built with an open-source core and a strong emphasis on developer experience, security, and long-term maintainability.",
    companyBoilerplate: "For more information about the hackathon, participation details, and upcoming announcements, visit cortexlinux.com.",
    tags: ["Hackathon", "AI", "Open Source", "Developer Community", "Linux", "Global Event"],
    keywords: [
      "AI Linux distribution",
      "AI-native operating system",
      "Linux hackathon 2026",
      "global AI hackathon",
      "system-level AI",
      "AI infrastructure",
      "Cortex Linux",
      "developer hackathon",
      "open source hackathon",
      "AI-first system design"
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
