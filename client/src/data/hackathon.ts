// ============================================
// Ideathon Submission Template
// ============================================
export interface IdeathonSubmissionField {
  id: string;
  label: string;
  description: string;
  required: boolean;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

export const ideathonSubmissionTemplate: IdeathonSubmissionField[] = [
  {
    id: "feature_name",
    label: "Feature Name",
    description: "A clear, concise name for your proposed feature",
    required: true,
    type: "text",
    placeholder: "e.g., Enterprise SSO Integration"
  },
  {
    id: "problem_statement",
    label: "Problem Statement / Pain Point",
    description: "What specific problem does this feature solve? Who experiences this pain?",
    required: true,
    type: "textarea",
    placeholder: "Describe the problem in detail..."
  },
  {
    id: "proposed_solution",
    label: "Proposed Solution",
    description: "A short description of how your feature addresses the problem",
    required: true,
    type: "textarea",
    placeholder: "Explain your solution approach..."
  },
  {
    id: "target_audience",
    label: "Target Audience",
    description: "Who will benefit from this feature?",
    required: true,
    type: "select",
    options: ["Enterprise Users", "Startups", "Individual Developers", "DevOps Teams", "Data Scientists", "System Administrators"]
  },
  {
    id: "monetization_impact",
    label: "Expected Monetization Impact",
    description: "How could this feature generate revenue for Cortex Linux?",
    required: true,
    type: "textarea",
    placeholder: "e.g., Premium tier feature, usage-based pricing, enterprise licensing..."
  },
  {
    id: "implementation_outline",
    label: "Implementation Outline",
    description: "Technical approach, dependencies, and estimated complexity",
    required: true,
    type: "textarea",
    placeholder: "Describe technical requirements, API integrations, dependencies..."
  },
  {
    id: "prototype_link",
    label: "Optional Prototype / Mockup",
    description: "Link to Figma, screenshot, or demo (optional but encouraged)",
    required: false,
    type: "text",
    placeholder: "https://figma.com/..."
  }
];

// ============================================
// Roadmap / Tasks Checklist
// ============================================
export interface RoadmapTask {
  id: string;
  number: number;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  category: "planning" | "website" | "legal" | "launch" | "tracking";
}

export const roadmapTasks: RoadmapTask[] = [
  {
    id: "define-template",
    number: 1,
    title: "Define Phase 1 Template",
    description: "Finalize Ideathon submission fields & examples",
    status: "completed",
    category: "planning"
  },
  {
    id: "update-copy",
    number: 2,
    title: "Update Hackathon Page Copy",
    description: "Brand Ideathon vs Hackathon phases clearly",
    status: "completed",
    category: "website"
  },
  {
    id: "create-pdf",
    number: 3,
    title: "Create Downloadable PDF",
    description: "Professional layout with rules, legal, and branding",
    status: "in-progress",
    category: "legal"
  },
  {
    id: "website-integration",
    number: 4,
    title: "Website Integration",
    description: "PDF download button, timeline, progress tracker",
    status: "in-progress",
    category: "website"
  },
  {
    id: "email-registration",
    number: 5,
    title: "Email Registration & Tracking",
    description: "Ensure all participants are captured in database",
    status: "completed",
    category: "tracking"
  },
  {
    id: "legal-review",
    number: 6,
    title: "Internal Legal Review",
    description: "IP rights, prize rules, and conduct policy check",
    status: "pending",
    category: "legal"
  },
  {
    id: "launch-phase1",
    number: 7,
    title: "Launch Phase 1 (Ideathon)",
    description: "Communicate branding & submission instructions",
    status: "pending",
    category: "launch"
  },
  {
    id: "collect-submissions",
    number: 8,
    title: "Collect Submissions",
    description: "Review Ideathon ideas using template criteria",
    status: "pending",
    category: "tracking"
  },
  {
    id: "launch-phase2",
    number: 9,
    title: "Launch Phase 2 (Hackathon)",
    description: "Start code-first building with approved ideas",
    status: "pending",
    category: "launch"
  },
  {
    id: "track-metrics",
    number: 10,
    title: "Track Participation & Metrics",
    description: "GitHub contributions, demos, engagement stats",
    status: "pending",
    category: "tracking"
  }
];

// ============================================
// Champion Ambassador
// ============================================
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
  achievementDetail: "Won against 300,000+ contestants in India's largest hackathon",
  reach: "50K+ India developer network",
  github: "suyashdongre",
  avatar: "/assets/suyash.png",
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

// ============================================
// Ideathon Phase (Phase 1)
// ============================================
export interface IdeathonPhase {
  id: string;
  title: string;
  subtitle: string;
  weeks: string;
  duration: string;
  goal: string;
  description: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  judgingCriteria: { name: string; weight: string; description: string }[];
  prizes: { place: string; amount: string }[];
  prizeTotal: string;
  cta: { text: string; href: string; external?: boolean };
}

export const ideathonPhase: IdeathonPhase = {
  id: "ideathon",
  title: "Cortex Ideathon",
  subtitle: "Idea-to-Feature",
  weeks: "Weeks 1-4",
  duration: "4 weeks",
  goal: "Generate monetizable feature ideas",
  description: "Submit structured product ideas for monetizable features in Cortex Linux. Focus on enterprise services, premium integrations, and revenue-generating capabilities. No marketing or sales strategies—just actionable product ideas.",
  color: "text-amber-400",
  bgGradient: "from-amber-500/10 to-transparent",
  borderColor: "border-amber-500/20",
  judgingCriteria: [
    { name: "Innovation & Originality", weight: "30%", description: "Novel approach to the problem" },
    { name: "Feasibility", weight: "25%", description: "Realistic for Cortex Linux implementation" },
    { name: "Monetization Potential", weight: "25%", description: "Clear revenue generation path" },
    { name: "Completeness", weight: "20%", description: "Full use of submission template" }
  ],
  prizes: [
    { place: "1st Place", amount: "$1,000" },
    { place: "2nd Place", amount: "$750" },
    { place: "3rd Place", amount: "$250" },
    { place: "4th–10th Place", amount: "$100 each" }
  ],
  prizeTotal: "$3,000",
  cta: {
    text: "Submit Your Idea",
    href: "https://forms.cortexlinux.com/ideathon",
    external: true
  }
};

// ============================================
// Hackathon Phases (Phase 2)
// ============================================
export const hackathonPhases: HackathonPhase[] = [
  {
    id: "build-sprint",
    number: 1,
    title: "Build Sprint",
    weeks: "Weeks 5-9",
    duration: "5 weeks",
    goal: "Ship real things",
    description: "The main event. Build a Cortex feature, plugin, extension, or integration based on Ideathon ideas or your own. Solo or team. What matters is what you ship. Code quality, usefulness, and documentation are what get judged.",
    color: "text-blue-300",
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
      { place: "1st Place", amount: "$5,000" },
      { place: "2nd Place", amount: "$3,000" },
      { place: "3rd Place", amount: "$2,000" },
      { place: "4th-7th Place", amount: "$500 each" }
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
    id: "review-period",
    number: 2,
    title: "Review Period",
    weeks: "Weeks 10-13",
    duration: "4 weeks",
    goal: "Code review & judging",
    description: "Submissions are reviewed by the Cortex maintainer team. We evaluate code quality, usefulness, architecture, and documentation. Winners are announced at the end of Week 13.",
    color: "text-purple-400",
    bgGradient: "from-purple-500/10 to-transparent",
    borderColor: "border-purple-500/20",
    activities: [
      "One-on-one code reviews with maintainers",
      "PR refinement and iteration",
      "Final judging by core team",
      "Winner announcements"
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
    color: "text-blue-300"
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
  tagline: "From Ideas to Code. From Code to Production.",
  startDate: new Date("2026-02-17T00:00:00"),
  totalWeeks: 14,
  totalPrizePool: "$15,000",
  ideathonPrize: "$3,000",
  buildSprintPrize: "$12,000",
  expectedParticipants: "5,000+",
  expectedIdeas: "4000+",
  expectedPRs: "100+",
  githubUrl: "https://github.com/cortexlinux/cortex",
  discordUrl: "https://discord.gg/ASvzWcuTfk",
  rulesDocUrl: "/hackathon-rules",
  philosophy: {
    principle: "Ideas become features. Features become revenue.",
    description: "Phase 1 (Ideathon) generates monetizable product ideas. Phase 2 (Hackathon) turns those ideas into real code. Every submission creates value for Cortex Linux.",
    values: [
      "Actionable ideas over vague concepts",
      "Monetizable features over marketing strategies",
      "Shipped code over slide decks",
      "Long-term contributors over one-time participants"
    ]
  }
};

export const hackathonFaqs = [
  {
    question: "What's the difference between Ideathon and Hackathon?",
    answer: "Ideathon (Phase 1, Weeks 1-4) is for submitting monetizable feature ideas using our structured template. Hackathon (Phase 2, Weeks 5-13) is for building those ideas into real code. You can participate in both or just Phase 2 if you want to code from day one."
  },
  {
    question: "Do I need technical skills for the Ideathon?",
    answer: "Not necessarily! Ideathon focuses on product thinking—identifying pain points and proposing features. However, understanding technical feasibility helps. Your idea should be something that could realistically be built into Cortex Linux."
  },
  {
    question: "Can I build my own idea in Phase 2?",
    answer: "Yes! You can build from approved Ideathon ideas or bring your own. What matters is that you ship real code via GitHub PRs. Original ideas still need to follow the feature guidelines."
  },
  {
    question: "Can I participate solo or do I need a team?",
    answer: "Both! Solo developers are welcome. Teams of 2-5 are great for larger features. What matters is what you ship, not how many people shipped it."
  },
  {
    question: "What if my PR doesn't get merged during the hackathon?",
    answer: "The Review Period (Weeks 10-13) is specifically for this. You'll work directly with maintainers to refine your code. Quality contributions will eventually merge."
  },
  {
    question: "What do I need to participate?",
    answer: "For Ideathon: Just a web browser and good ideas. For Hackathon: A Linux system (native, VM, or WSL), basic programming skills, and Git knowledge. Cortex works with Python 3.8+ and most Linux distributions."
  },
  {
    question: "How are submissions judged?",
    answer: "Ideathon: Innovation (30%), Feasibility (25%), Monetization Potential (25%), Completeness (20%). Hackathon: Code Quality (30%), Usefulness (25%), Architecture (20%), Documentation (15%), Test Coverage (10%)."
  },
  {
    question: "Is there a registration fee?",
    answer: "100% free. This is open source. You're contributing to a community project that benefits everyone. No fees, no catches, no hidden costs."
  },
  {
    question: "Where can I find the official rules?",
    answer: "Download the complete Rules & Expectations PDF from the hackathon page. It covers eligibility, submission guidelines, IP rights, prizes, and code of conduct."
  }
];

export const hackathonBenefits = [
  {
    title: "Two Ways to Contribute",
    description: "Submit feature ideas in Ideathon (no coding required) or build real code in Hackathon. Both paths lead to recognition and rewards."
  },
  {
    title: "Mentorship from Champions",
    description: "Learn directly from Suyash Dongre (winner against 300K+ contestants) and the Cortex core team through live coding sessions and code reviews."
  },
  {
    title: "Build Your Portfolio",
    description: "Merged PRs on a growing open-source project look great on your resume. Hiring managers love candidates with real contribution history."
  },
  {
    title: "Join a Builder Community",
    description: "Connect with 3,000+ developers globally who ship real products, not just tutorials. Builders who became maintainers started right here."
  },
  {
    title: "Compete for $15,000 in Prizes",
    description: "Real money for real contributions. $3,000 for Ideathon, $9,000 for Build Sprint, $3,000 for Demo Week. Plus maintainer roles and swag."
  },
  {
    title: "Shape the Future of Cortex",
    description: "Top contributors get long-term influence over the Cortex roadmap. Your ideas and code can define where this project goes."
  }
];
