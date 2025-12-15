// Landing page content data

export const problemPoints = [
  {
    icon: "X",
    text: "47 Stack Overflow tabs to install CUDA",
    testid: "problem-cuda"
  },
  {
    icon: "X",
    text: "Days wasted on dependency conflicts",
    testid: "problem-dependencies"
  },
  {
    icon: "X",
    text: '"Works on my machine" syndrome',
    testid: "problem-works-on-machine"
  },
  {
    icon: "X",
    text: "Configuration files in ancient runes",
    testid: "problem-config"
  }
];

export const solutionFeatures = [
  {
    title: "Natural Language Commands",
    icon: "MessageSquare",
    description: "Tell Cortex what you need in plain English. It understands intent, not just keywords.",
    example: "cortex install tensorflow --optimize-gpu",
    testid: "feature-natural-language"
  },
  {
    title: "Hardware-Aware Optimization",
    icon: "Cpu",
    description: "Automatically detects your GPU, CPU, and memory. Configures software for maximum performance.",
    example: "Detects NVIDIA RTX 4090 → Installs CUDA 12.3",
    testid: "feature-hardware-aware"
  },
  {
    title: "Self-Healing Configuration",
    icon: "RotateCcw",
    description: "Fixes broken dependencies automatically. Rollback if anything goes wrong. Never repeat errors.",
    example: "Dependency conflict? Cortex resolves it.",
    testid: "feature-self-healing"
  }
];

export const securityFeatures = [
  {
    icon: "Lock",
    title: "Sandboxed Execution",
    description: "AI never has direct kernel access. Every command runs in isolated Firejail container.",
    testid: "security-sandboxed"
  },
  {
    icon: "Search",
    title: "Preview Before Execute",
    description: "Review all commands before they run. You approve every system change.",
    testid: "security-preview"
  },
  {
    icon: "RotateCcw",
    title: "Instant Rollback",
    description: "Undo any change in seconds. Full system snapshots before major operations.",
    testid: "security-rollback"
  },
  {
    icon: "FileText",
    title: "Complete Audit Logging",
    description: "Track every command, every change. Full transparency for compliance.",
    testid: "security-audit"
  }
];

export const comparisonData = {
  tools: ["Feature", "Warp/Gemini CLI", "Claude Code", "Cortex Linux"],
  features: [
    { name: "AI-assisted commands", warp: true, claude: true, cortex: true },
    { name: "Hardware detection", warp: false, claude: false, cortex: true },
    { name: "Dependency resolution", warp: false, claude: false, cortex: true },
    { name: "GPU optimization", warp: false, claude: false, cortex: true },
    { name: "System configuration", warp: false, claude: false, cortex: true },
    { name: "OS-level integration", warp: false, claude: false, cortex: true },
    { name: "Preview commands", warp: true, claude: true, cortex: true },
    { name: "Rollback capability", warp: false, claude: false, cortex: true }
  ]
};

export const useCases = [
  {
    title: "Data Scientists",
    before: "6 hours installing CUDA + TensorFlow + dependencies across 47 Stack Overflow tabs",
    after: "cortex install tensorflow --optimize-gpu (5 minutes)",
    timeSaved: "5h 55m",
    testid: "usecase-data-scientists"
  },
  {
    title: "DevOps Engineers",
    before: "4 hours configuring Oracle DB with manual dependency resolution",
    after: "cortex setup oracle-23-ai production-ready (4 minutes)",
    timeSaved: "3h 56m",
    testid: "usecase-devops"
  },
  {
    title: "ML Engineers",
    before: "Version conflicts between PyTorch and CUDA, 3 hours debugging",
    after: "cortex install pytorch stable --compatible-cuda (automatic resolution)",
    timeSaved: "3h",
    testid: "usecase-ml-engineers"
  },
  {
    title: "Students",
    before: '"Works on my machine" but crashes on professor\'s system',
    after: "Reproducible environments, exact dependency versions",
    timeSaved: "Frustration: Eliminated",
    testid: "usecase-students"
  }
];

export const testimonials = [
  {
    quote: "This saved me 20 hours on my last project setup.",
    author: "Beta Tester",
    testid: "testimonial-1"
  },
  {
    quote: "Finally, Linux that works with you.",
    author: "Beta Tester",
    testid: "testimonial-2"
  },
  {
    quote: "Security features give me confidence to use AI at system level.",
    author: "Beta Tester",
    testid: "testimonial-3"
  }
];

export const communityFeatures = [
  "Full AI capabilities",
  "All core features",
  "Open source (Apache 2.0)",
  "Community support",
  "Unlimited personal use"
];

export const enterpriseFeatures = [
  "Everything in Community",
  "Priority support (24/7)",
  "Compliance reporting",
  "Role-based access control",
  "Custom integrations",
  "SLA guarantees"
];
