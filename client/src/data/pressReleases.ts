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
    ],
    image: "/og-image.png"
  },
  {
    slug: "cortex-linux-raises-5m-seed-funding",
    title: "Cortex Linux Raises $5M Seed Funding to Accelerate AI-Native Operating System Development",
    headline: "Cortex Linux Raises $5M Seed Funding to Accelerate AI-Native Operating System Development",
    date: "2026-01-05",
    dateline: "Salt Lake City, UT",
    summary: "Cortex Linux secures $5 million in seed funding to scale development of its AI-native operating system. The investment will accelerate hiring, expand enterprise features, and drive adoption of the AI Linux platform among developers and startups building next-generation AI infrastructure.",
    content: [
      "Cortex Linux, the AI-native operating system built for developers and AI-first teams, today announced the close of a $5 million seed funding round. The investment will accelerate product development, expand the engineering team, and support go-to-market initiatives as Cortex Linux prepares for broader enterprise adoption.",
      "The funding round was led by prominent venture capital firms focused on developer tools, open-source infrastructure, and artificial intelligence. Angel investors with deep experience in Linux, cloud computing, and AI research also participated, signaling strong confidence in the market opportunity for an AI-native approach to operating system design.",
      "With this capital, Cortex Linux plans to triple its engineering headcount, expand enterprise-grade security and compliance capabilities, and deepen integrations with popular AI frameworks and cloud platforms. The company is also investing in community programs, including an expanded bounty system and developer advocacy initiatives."
    ],
    subheadings: [
      {
        title: "Addressing a Growing Market Need",
        paragraphs: [
          "Traditional Linux distributions were not designed with AI workloads as a primary concern. Cortex Linux was purpose-built to bridge this gap, embedding intelligent automation, natural language system control, and AI-aware resource management directly into the operating system layer.",
          "As AI becomes central to software development and infrastructure, demand for operating systems that understand and optimize for AI workflows is accelerating. Cortex Linux is positioned to capture this emerging market segment."
        ]
      },
      {
        title: "Strategic Investment for Long-Term Growth",
        paragraphs: [
          "The seed funding will enable Cortex Linux to execute on its roadmap, including enhanced AI automation features, improved developer tooling, and enterprise deployment capabilities. The company plans to release significant platform updates throughout 2026.",
          "Investors cited Cortex Linux's unique technical approach, strong early community traction, and the team's deep expertise in systems engineering and AI as key factors in their decision to invest."
        ]
      },
      {
        title: "What's Next for Cortex Linux",
        paragraphs: [
          "With the funding secured, Cortex Linux is focused on scaling its team, shipping major product milestones, and expanding partnerships with cloud providers and enterprise customers. The company remains committed to its open-source core while building premium features for teams that require additional capabilities.",
          "Cortex Linux invites developers, AI researchers, and infrastructure engineers to join the community, contribute to the project, and help shape the future of AI-native operating systems."
        ]
      }
    ],
    links: [
      { label: "Official Website", url: "https://cortexlinux.com" },
      { label: "GitHub Repository", url: "https://github.com/cortexlinux/cortex" },
      { label: "Join the Community", url: "https://cortexlinux.com/community" }
    ],
    contactInfo: {
      name: "Press Team",
      title: "Cortex Linux",
      email: "press@cortexlinux.com"
    },
    boilerplate: "Cortex Linux is an AI-native Linux operating system designed for developers, AI founders, and modern engineering teams. By integrating intelligence directly into the OS, Cortex Linux aims to reduce friction, accelerate development, and enable new classes of AI-driven workflows — without sacrificing transparency, performance, or control. The project is built with an open-source core and a strong emphasis on developer experience, security, and long-term maintainability.",
    tags: ["Funding", "Seed Round", "AI", "Venture Capital", "Startup", "Linux", "Investment"],
    keywords: [
      "Cortex Linux funding",
      "AI Linux seed round",
      "AI-native operating system investment",
      "Linux startup funding",
      "AI infrastructure funding",
      "developer tools investment",
      "open source funding",
      "Cortex Linux venture capital",
      "AI OS startup",
      "Linux distribution funding 2026"
    ],
    image: "/og-image.png"
  },
  {
    slug: "cortex-linux-v25-released-enhanced-ai-automation",
    title: "Cortex Linux v2.5 Released with Enhanced AI Automation and Developer Productivity Features",
    headline: "Cortex Linux v2.5 Released with Enhanced AI Automation and Developer Productivity Features",
    date: "2025-12-15",
    dateline: "Salt Lake City, UT",
    summary: "Cortex Linux v2.5 delivers major AI automation upgrades, including natural language system commands, intelligent package management, and automated security patching. This release marks the most significant update to the AI-native operating system, bringing production-ready features for developers and enterprise teams.",
    content: [
      "Cortex Linux today announced the release of version 2.5, a major update that significantly expands the AI-native capabilities of the operating system. The release introduces advanced natural language command processing, intelligent workflow automation, and enhanced security features designed for production environments.",
      "Version 2.5 represents months of development informed by community feedback and real-world usage patterns. The update focuses on reliability, performance, and deeper AI integration at every layer of the operating system, from package management to system configuration.",
      "Developers can now interact with Cortex Linux using conversational commands, automate complex multi-step workflows with minimal configuration, and benefit from AI-driven system optimization that adapts to their workloads over time."
    ],
    subheadings: [
      {
        title: "Key Features in v2.5",
        paragraphs: [
          "Natural Language System Control now supports complex, multi-step commands with context awareness. Users can describe what they want to accomplish in plain English, and Cortex Linux translates those requests into safe, verified system operations.",
          "Intelligent Package Management learns from user behavior to suggest relevant packages, resolve dependency conflicts automatically, and optimize installation workflows. The AI layer also monitors for security vulnerabilities and can apply patches with user approval.",
          "Automated Security Patching introduces a proactive approach to system security. Cortex Linux continuously monitors for critical vulnerabilities and can schedule or apply patches during low-usage periods, minimizing disruption while maximizing protection."
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
          "The v2.5 release is available immediately for all users through the standard Cortex Linux update channels. Enterprise customers receive additional features including centralized fleet management, advanced audit logging, and priority support.",
          "Cortex Linux encourages developers to upgrade, explore the new features, and share feedback through the community Discord and GitHub repository."
        ]
      }
    ],
    bulletPoints: [
      {
        heading: "Highlights of Cortex Linux v2.5",
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
      { label: "Download v2.5", url: "https://cortexlinux.com/download" },
      { label: "Release Notes", url: "https://cortexlinux.com/releases/v2.5" },
      { label: "GitHub Repository", url: "https://github.com/cortexlinux/cortex" }
    ],
    contactInfo: {
      name: "Press Team",
      title: "Cortex Linux",
      email: "press@cortexlinux.com"
    },
    boilerplate: "Cortex Linux is an AI-native Linux operating system designed for developers, AI founders, and modern engineering teams. By integrating intelligence directly into the OS, Cortex Linux aims to reduce friction, accelerate development, and enable new classes of AI-driven workflows — without sacrificing transparency, performance, or control. The project is built with an open-source core and a strong emphasis on developer experience, security, and long-term maintainability.",
    tags: ["Product Release", "v2.5", "AI Automation", "Natural Language", "Security", "Linux", "Update"],
    keywords: [
      "Cortex Linux v2.5",
      "AI Linux release",
      "AI-native operating system update",
      "natural language Linux commands",
      "intelligent package management",
      "automated security patching",
      "AI automation Linux",
      "Cortex Linux features",
      "Linux AI integration",
      "developer productivity Linux"
    ],
    image: "/og-image.png"
  },
  {
    slug: "cortex-linux-reaches-50000-downloads-milestone",
    title: "Cortex Linux Reaches 50,000 Downloads Milestone, Signaling Strong Developer Adoption",
    headline: "Cortex Linux Reaches 50,000 Downloads Milestone, Signaling Strong Developer Adoption",
    date: "2025-11-20",
    dateline: "Salt Lake City, UT",
    summary: "Cortex Linux surpasses 50,000 downloads, demonstrating rapid adoption of its AI-native operating system among developers and AI teams worldwide. The milestone reflects growing demand for Linux distributions designed specifically for AI-first development workflows and intelligent system automation.",
    content: [
      "Cortex Linux today announced that its AI-native operating system has surpassed 50,000 downloads, marking a significant milestone in the project's growth. The achievement reflects strong interest from developers, AI researchers, and engineering teams seeking an operating system purpose-built for modern AI workloads.",
      "Since its initial release, Cortex Linux has attracted users from over 80 countries, with particularly strong adoption in North America, Europe, and Asia-Pacific regions. The download milestone comes amid accelerating interest in AI-native infrastructure and intelligent developer tools.",
      "The Cortex Linux community has grown in parallel with downloads, with thousands of active contributors, Discord members, and GitHub participants helping shape the platform's direction. Community contributions have driven several major features and bug fixes in recent releases."
    ],
    subheadings: [
      {
        title: "Why Developers Are Choosing Cortex Linux",
        paragraphs: [
          "Feedback from users highlights several key factors driving adoption: the seamless integration of AI capabilities at the operating system level, the natural language command interface, and the focus on developer experience. Many users report significant productivity gains after switching from traditional Linux distributions.",
          "Cortex Linux appeals particularly to AI engineers, machine learning practitioners, and startup teams who need an operating system that understands their workflows rather than requiring extensive manual configuration."
        ]
      },
      {
        title: "Community Growth and Contributions",
        paragraphs: [
          "The 50,000 download milestone is accompanied by a thriving open-source community. Over 200 contributors have submitted pull requests, reported issues, or participated in feature discussions. The community Discord server hosts daily conversations about AI development, system optimization, and best practices.",
          "Cortex Linux's bounty program has distributed thousands of dollars to contributors who have tackled high-priority issues, documentation improvements, and new feature development. This model has proven effective at attracting talented developers to the project."
        ]
      },
      {
        title: "Looking Ahead",
        paragraphs: [
          "With this milestone achieved, Cortex Linux is focused on the next phase of growth. Upcoming priorities include expanded enterprise features, deeper cloud platform integrations, and continued investment in AI capabilities that differentiate Cortex Linux from traditional operating systems.",
          "The team thanks the community for their support and encourages new users to download Cortex Linux, join the Discord, and contribute to the project's future."
        ]
      }
    ],
    links: [
      { label: "Download Cortex Linux", url: "https://cortexlinux.com/download" },
      { label: "Join the Community", url: "https://cortexlinux.com/community" },
      { label: "GitHub Repository", url: "https://github.com/cortexlinux/cortex" }
    ],
    contactInfo: {
      name: "Press Team",
      title: "Cortex Linux",
      email: "press@cortexlinux.com"
    },
    boilerplate: "Cortex Linux is an AI-native Linux operating system designed for developers, AI founders, and modern engineering teams. By integrating intelligence directly into the OS, Cortex Linux aims to reduce friction, accelerate development, and enable new classes of AI-driven workflows — without sacrificing transparency, performance, or control. The project is built with an open-source core and a strong emphasis on developer experience, security, and long-term maintainability.",
    tags: ["Milestone", "Downloads", "Community", "Adoption", "Growth", "AI", "Linux", "Open Source"],
    keywords: [
      "Cortex Linux downloads",
      "AI Linux adoption",
      "AI-native operating system growth",
      "Linux distribution downloads",
      "Cortex Linux community",
      "developer adoption Linux",
      "AI Linux milestone",
      "open source Linux growth",
      "Cortex Linux users",
      "AI infrastructure adoption"
    ],
    image: "/og-image.png"
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
