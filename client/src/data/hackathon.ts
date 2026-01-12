export interface ChampionAmbassador {
  name: string;
  title: string;
  achievement: string;
  achievementDetail: string;
  reach: string;
  github: string;
  avatar: string;
  linkedin?: string;
  quote?: string;
  roles: string[];
  liveCodingSchedule?: string;
}

export const championAmbassador: ChampionAmbassador = {
  name: "Suyash Dongre",
  title: "Champion Ambassador",
  achievement: "Smart India Hackathon Grand Final Winner",
  achievementDetail: "Won ₹300,000 (300K) in India's largest hackathon",
  reach: "50K+ India developer network",
  github: "suyashdongre",
  avatar: "https://github.com/suyashdongre.png",
  linkedin: "suyashdongre",
  quote: "The best hackathons are BUILD competitions. Ship code, not slide decks.",
  roles: [
    "Champion Ambassador",
    "Live Coding Streams",
    "Technical Mentor",
    "Judge & Reviewer"
  ],
  liveCodingSchedule: "Weekly sessions during Build Sprint"
};

export interface HackathonPhase {
  id: string;
  number: number;
  title: string;
  weeks: string;
  duration: string;
  goal: string;
  description: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  requirements?: string[];
  rewards?: string[];
  prizes?: { place: string; amount: string }[];
  prizeTotal?: string;
  activities?: string[];
  criteria?: { name: string; weight: string; description: string }[];
  cta?: {
    text: string;
    href: string;
    external?: boolean;
  };
}

export const hackathonPhases: HackathonPhase[] = [
  {
    id: "onboarding",
    number: 1,
    title: "Onboarding",
    weeks: "Weeks 1-2",
    duration: "2 weeks",
    goal: "Eliminate non-builders early",
    description: "Get set up with Cortex Linux, complete the guided tutorial, and join the community. This phase ensures every participant has a working environment and understands the codebase before the build sprint begins.",
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/10 to-transparent",
    borderColor: "border-emerald-500/20",
    requirements: [
      "Install Cortex Linux on your system",
      "Complete the guided onboarding tutorial",
      "Join Discord and introduce yourself",
      "Star the GitHub repository",
      "Submit your first 'hello world' command"
    ],
    rewards: [
      "Digital completion certificate",
      "Limited edition hackathon swag",
      "Early Contributor badge on profile",
      "Access to exclusive Discord channels"
    ],
    cta: {
      text: "Start Onboarding",
      href: "/getting-started",
      external: false
    }
  },
  {
    id: "build-sprint",
    number: 2,
    title: "Build Sprint",
    weeks: "Weeks 3-8",
    duration: "6 weeks",
    goal: "Ship real things",
    description: "The main event. Build a Cortex feature, plugin, extension, or integration. Solo or team. What matters is what you ship. Code quality, usefulness, and documentation are what get judged.",
    color: "text-blue-400",
    bgGradient: "from-blue-500/10 to-transparent",
    borderColor: "border-blue-500/20",
    requirements: [
      "Build a Cortex feature, plugin, or extension",
      "Create an integration (CLI, infra, AI tool, etc.)",
      "Submit via GitHub Pull Request",
      "Include comprehensive documentation",
      "Write tests for your code"
    ],
    prizes: [
      { place: "1st Place", amount: "$4,500" },
      { place: "2nd Place", amount: "$3,000" },
      { place: "3rd Place", amount: "$2,250" },
      { place: "4th-6th Place", amount: "$750 each" }
    ],
    prizeTotal: "$12,000",
    criteria: [
      { name: "Code Quality", weight: "30%", description: "Readability, structure, best practices" },
      { name: "Usefulness", weight: "25%", description: "Real-world value, problem solved" },
      { name: "Architecture", weight: "20%", description: "Design patterns, extensibility" },
      { name: "Documentation", weight: "15%", description: "README, comments, API docs" },
      { name: "Test Coverage", weight: "10%", description: "Unit & integration tests" }
    ],
    cta: {
      text: "View Open Issues",
      href: "https://github.com/cortexlinux/cortex/issues",
      external: true
    }
  },
  {
    id: "demo-week",
    number: 3,
    title: "Demo Week",
    weeks: "Weeks 9-10",
    duration: "2 weeks",
    goal: "Visibility + social proof",
    description: "Show off what you built. Create a short demo video, make your GitHub repo public, and let the community vote. This is where your work gets recognized and shared.",
    color: "text-purple-400",
    bgGradient: "from-purple-500/10 to-transparent",
    borderColor: "border-purple-500/20",
    requirements: [
      "Create a 2-5 minute demo video",
      "Public GitHub repository or merged PR",
      "Written walkthrough or blog post",
      "Share on social media with #CortexHackathon"
    ],
    prizes: [
      { place: "Best Demo", amount: "$1,200" },
      { place: "Community Choice", amount: "$900" },
      { place: "Most Creative", amount: "$600" },
      { place: "Runner-ups (2)", amount: "$150 each" }
    ],
    prizeTotal: "$3,000",
    activities: [
      "Community voting on demos",
      "Maintainer technical review",
      "Live demo showcase stream",
      "Social media amplification"
    ],
    cta: {
      text: "Submit Demo",
      href: "https://github.com/cortexlinux/cortex/discussions",
      external: true
    }
  },
  {
    id: "merge-ship",
    number: 4,
    title: "Merge & Ship",
    weeks: "Weeks 11-13",
    duration: "3 weeks",
    goal: "Convert builders into maintainers",
    description: "The final phase where your code gets production-ready. Work directly with maintainers on code reviews, get your PRs merged, and potentially become a long-term contributor to Cortex Linux.",
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/10 to-transparent",
    borderColor: "border-yellow-500/20",
    activities: [
      "One-on-one code reviews with maintainers",
      "PR refinement and iteration",
      "Merge into main branch",
      "Maintainer onboarding for top contributors"
    ],
    rewards: [
      "Maintainer role for top contributors",
      "Public recognition in release notes",
      "Long-term influence over Cortex roadmap",
      "Direct access to core team",
      "Reference letter for future opportunities"
    ],
    cta: {
      text: "View Pull Requests",
      href: "https://github.com/cortexlinux/cortex/pulls",
      external: true
    }
  }
];

export interface BuildTrack {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  examples: string[];
  color: string;
}

export const buildTracks: BuildTrack[] = [
  {
    id: "cli-commands",
    title: "CLI Commands",
    description: "Build new natural language commands that extend Cortex capabilities",
    difficulty: "Beginner",
    examples: [
      "Custom file organization commands",
      "Git workflow automation",
      "System monitoring commands"
    ],
    color: "text-emerald-400"
  },
  {
    id: "plugins",
    title: "Plugins & Extensions",
    description: "Create modular extensions that add new functionality to Cortex",
    difficulty: "Intermediate",
    examples: [
      "IDE integrations (VS Code, Neovim)",
      "Cloud provider connectors",
      "Database management plugins"
    ],
    color: "text-blue-400"
  },
  {
    id: "ai-integrations",
    title: "AI Integrations",
    description: "Integrate new AI models, providers, or enhance reasoning capabilities",
    difficulty: "Advanced",
    examples: [
      "Local LLM support (Ollama, llama.cpp)",
      "Multi-modal input handling",
      "Custom reasoning pipelines"
    ],
    color: "text-purple-400"
  },
  {
    id: "infra-tools",
    title: "Infrastructure Tools",
    description: "Build tools for DevOps, deployment, and system administration",
    difficulty: "Intermediate",
    examples: [
      "Docker/Kubernetes automation",
      "CI/CD pipeline helpers",
      "Server provisioning scripts"
    ],
    color: "text-yellow-400"
  }
];

export interface GrowthChannel {
  platform: string;
  description: string;
  strategy: string;
  expectedReach: string;
  links?: { text: string; href: string }[];
}

export const growthStrategy: GrowthChannel[] = [
  {
    platform: "DEV.to / Hashnode",
    description: "Technical blog posts",
    strategy: "Publish build tutorials, hackathon updates, and winner spotlights",
    expectedReach: "50K+ developers",
    links: [
      { text: "Read our DEV.to", href: "https://dev.to/cortexlinux" },
      { text: "Hashnode Blog", href: "https://cortexlinux.hashnode.dev" }
    ]
  },
  {
    platform: "Reddit",
    description: "r/linux, r/selfhosted, r/homelab",
    strategy: "Authentic community engagement, project showcases, AMA sessions",
    expectedReach: "100K+ Linux enthusiasts",
    links: [
      { text: "r/linux", href: "https://reddit.com/r/linux" },
      { text: "r/selfhosted", href: "https://reddit.com/r/selfhosted" }
    ]
  },
  {
    platform: "Product Hunt",
    description: "Launch as build hackathon",
    strategy: "Frame as 'Open Source AI Hackathon' with community voting",
    expectedReach: "25K+ makers",
    links: [
      { text: "Follow on PH", href: "https://producthunt.com/products/cortex-linux" }
    ]
  },
  {
    platform: "YouTube",
    description: "Creator collaborations",
    strategy: "Partner with Linux YouTubers for install + build walkthroughs",
    expectedReach: "50K+ viewers",
    links: [
      { text: "Watch Demos", href: "https://youtube.com/@cortexlinux" }
    ]
  }
];

export const hackathonConfig = {
  name: "Cortex Hackathon 2026",
  tagline: "Code is the currency. Shipping is the signal.",
  startDate: new Date("2026-02-17T00:00:00"),
  totalWeeks: 13,
  totalPrizePool: "$15,000",
  buildSprintPrize: "$12,000",
  demoPrize: "$3,000",
  expectedParticipants: "500+",
  expectedPRs: "100+",
  githubUrl: "https://github.com/cortexlinux/cortex",
  discordUrl: "https://discord.gg/cortexlinux",
  philosophy: {
    principle: "Code is the currency. Shipping is the signal.",
    description: "This hackathon requires installation and usage of Cortex, produces real GitHub PRs, generates demos and technical content, and turns participants into contributors—not spectators.",
    values: [
      "Builders over idea people",
      "Shipped code over slide decks",
      "Real PRs over theoretical proposals",
      "Long-term contributors over one-time participants"
    ]
  }
};

export const hackathonFaqs = [
  {
    question: "What makes this hackathon different?",
    answer: "This is a CODE-FIRST hackathon. No pitch decks, no business plans, no monetization strategies. You must install Cortex, write code, and ship something real. We're looking for builders who become long-term contributors, not idea people."
  },
  {
    question: "Do I need to be an expert developer?",
    answer: "You need to be able to write code and use Git. Phase 1 ensures everyone can get Cortex running. If you can complete the onboarding tutorial, you can participate. We have tracks for all skill levels from CLI commands to advanced AI integrations."
  },
  {
    question: "Can I participate solo or do I need a team?",
    answer: "Both! Solo developers are welcome. Teams of 2-5 are also great for larger features. What matters is what you ship, not how many people shipped it."
  },
  {
    question: "What if my PR doesn't get merged during the hackathon?",
    answer: "Phase 4 (Merge & Ship) is specifically designed for this. You'll work directly with maintainers to refine your code. Even if it takes a few iterations, quality contributions will eventually merge. Many successful open-source contributors started with rejected PRs."
  },
  {
    question: "What do I need to participate?",
    answer: "A Linux system (native, VM, or WSL), basic programming skills, and Git knowledge. Cortex works with Python 3.8+ and most Linux distributions. The onboarding phase will help you get everything set up."
  },
  {
    question: "How are submissions judged?",
    answer: "Build Sprint (Phase 2) is judged on Code Quality (30%), Usefulness (25%), Architecture (20%), Documentation (15%), and Test Coverage (10%). Demo Week includes community voting plus maintainer review. Three judges minimum per submission."
  },
  {
    question: "Is there a registration fee?",
    answer: "100% free. This is open source. You're contributing to a community project that benefits everyone. No fees, no catches, no hidden costs."
  },
  {
    question: "Can I participate from anywhere?",
    answer: "Yes! This is a global, async hackathon. Work on your own schedule, from anywhere in the world. All communication happens on GitHub and Discord. Weekly live sessions are recorded for different time zones."
  }
];

export const hackathonBenefits = [
  {
    title: "Real Open Source Experience",
    description: "Your code becomes part of a production project with real users. This isn't a toy—it's software people depend on."
  },
  {
    title: "Mentorship from Champions",
    description: "Learn directly from Suyash Dongre (300K hackathon winner) and the Cortex core team through live coding sessions and code reviews."
  },
  {
    title: "Build Your Portfolio",
    description: "Merged PRs on a growing open-source project look great on your resume. Hiring managers love candidates with real contribution history."
  },
  {
    title: "Join a Builder Community",
    description: "Connect with 500+ developers globally who ship real products, not just tutorials. Builders who became maintainers started right here."
  },
  {
    title: "Compete for $15,000 in Prizes",
    description: "Real money for real code. $12,000 for Build Sprint, $3,000 for Demo Week. Plus maintainer roles, swag, and recognition."
  },
  {
    title: "Shape the Future of Cortex",
    description: "Top contributors get long-term influence over the Cortex roadmap. Your ideas and code can define where this project goes."
  }
];
