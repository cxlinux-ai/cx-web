// Comparison Page Data Configuration
// Centralized config for all competitor comparison pages with A/B testing variants

export interface ComparisonFeature {
  name: string;
  cortex: 'yes' | 'no' | 'partial';
  cortexNote?: string;
  competitor: 'yes' | 'no' | 'partial';
  competitorNote?: string;
  tooltip?: string;
}

export interface UseCase {
  title: string;
  description: string;
  cortexCommand: string;
  cortexTime: string;
  cortexSteps: number;
  competitorCommands: string[];
  competitorTime: string;
  competitorSteps: number;
  errorRisk: 'low' | 'medium' | 'high';
  timeSaved: string;
}

export interface WhenToUse {
  cortexBetter: string[];
  competitorBetter: string[];
  whoShouldNotSwitch: string[];
}

export interface MigrationStep {
  step: number;
  title: string;
  description: string;
  command?: string;
  note?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ABVariant {
  id: string;
  weight: number;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaSecondary?: string;
  featureTableOrder?: string[];
  useCaseOrder?: number[];
  ctaPlacement?: 'above-fold' | 'after-use-cases' | 'both';
  ctaStyle?: 'soft' | 'strong';
}

export interface ComparisonExperiment {
  name: string;
  variants: ABVariant[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  ogImage?: string;
}

export interface ComparisonData {
  slug: string;
  competitorName: string;
  competitorDisplayName: string;
  tagline: string;
  seo: SEOMetadata;
  experiment: ComparisonExperiment;
  summaryTable: { label: string; cortex: string; competitor: string }[];
  features: ComparisonFeature[];
  useCases: UseCase[];
  whenToUse: WhenToUse;
  migrationSteps: MigrationStep[];
  faqs: FAQItem[];
  internalLinks: { text: string; href: string }[];
}

// ============================================
// APT COMPARISON
// ============================================
export const aptComparison: ComparisonData = {
  slug: 'apt',
  competitorName: 'apt',
  competitorDisplayName: 'APT Package Manager',
  tagline: 'Natural language meets package management',
  seo: {
    title: 'Cortex Linux vs APT: The Intelligent Alternative | Cortex Linux',
    description: 'Compare Cortex Linux with APT package manager. Discover how natural language commands can simplify package management while Cortex wraps APT under the hood.',
    keywords: ['apt alternative', 'apt package manager', 'linux package management', 'natural language linux', 'cortex vs apt'],
    canonicalPath: '/compare/apt',
  },
  experiment: {
    name: 'compare_apt_v1',
    variants: [
      {
        id: 'control',
        weight: 50,
        headline: 'Cortex Linux vs APT',
        subheadline: 'Natural language package management that wraps APT under the hood',
        ctaText: 'Try Cortex Free',
        ctaSecondary: 'View Documentation',
        ctaPlacement: 'above-fold',
        ctaStyle: 'strong',
      },
      {
        id: 'variant_safety',
        weight: 25,
        headline: 'APT, But Smarter',
        subheadline: 'Preview every command before execution. Rollback instantly if something goes wrong.',
        ctaText: 'See It In Action',
        ctaSecondary: 'Read the Docs',
        ctaPlacement: 'after-use-cases',
        ctaStyle: 'soft',
      },
      {
        id: 'variant_speed',
        weight: 25,
        headline: 'Stop Googling APT Commands',
        subheadline: 'Describe what you want in plain English. Cortex handles the apt commands for you.',
        ctaText: 'Start Building',
        ctaSecondary: 'Explore Features',
        ctaPlacement: 'both',
        ctaStyle: 'strong',
      },
    ],
  },
  summaryTable: [
    { label: 'Learning Curve', cortex: 'Speak naturally', competitor: 'Memorize syntax' },
    { label: 'Dependency Resolution', cortex: 'AI-optimized', competitor: 'Manual research' },
    { label: 'Preview Before Execute', cortex: 'Always', competitor: 'Sometimes (-s flag)' },
    { label: 'Rollback', cortex: 'Instant', competitor: 'Manual snapshots' },
    { label: 'Hardware Optimization', cortex: 'Automatic', competitor: 'Manual flags' },
  ],
  features: [
    {
      name: 'Natural Language Commands',
      cortex: 'yes',
      cortexNote: 'Describe intent in plain English',
      competitor: 'no',
      competitorNote: 'Requires exact syntax',
      tooltip: 'Cortex translates natural language to precise apt commands',
    },
    {
      name: 'Package Installation',
      cortex: 'yes',
      cortexNote: 'Wraps apt install',
      competitor: 'yes',
      competitorNote: 'Native apt install',
      tooltip: 'Both can install packages; Cortex uses apt under the hood',
    },
    {
      name: 'Dependency Resolution',
      cortex: 'yes',
      cortexNote: 'AI-assisted optimization',
      competitor: 'yes',
      competitorNote: 'Automatic but basic',
      tooltip: 'Cortex can suggest optimal dependency configurations',
    },
    {
      name: 'Preview Commands',
      cortex: 'yes',
      cortexNote: 'Dry-run by default',
      competitor: 'partial',
      competitorNote: 'Requires -s flag',
      tooltip: 'Cortex shows what will happen before executing',
    },
    {
      name: 'Instant Rollback',
      cortex: 'yes',
      cortexNote: 'Built-in state management',
      competitor: 'no',
      competitorNote: 'Requires manual snapshots',
      tooltip: 'Undo any operation instantly with Cortex',
    },
    {
      name: 'Hardware-Aware Installation',
      cortex: 'yes',
      cortexNote: 'Detects and optimizes',
      competitor: 'no',
      competitorNote: 'Manual configuration',
      tooltip: 'Cortex optimizes installations for your specific hardware',
    },
    {
      name: 'Multi-Package Operations',
      cortex: 'yes',
      cortexNote: '"Install a LAMP stack"',
      competitor: 'partial',
      competitorNote: 'apt install pkg1 pkg2...',
      tooltip: 'Cortex understands composite requests like "LAMP stack"',
    },
    {
      name: 'Offline Mode',
      cortex: 'yes',
      cortexNote: 'Local AI available',
      competitor: 'yes',
      competitorNote: 'With cached packages',
      tooltip: 'Both work offline with proper setup',
    },
  ],
  useCases: [
    {
      title: 'Install Nginx Optimized for Your Hardware',
      description: 'Set up Nginx with performance tuning based on your CPU cores and available memory.',
      cortexCommand: 'cortex "Install nginx optimized for my 8-core server with 32GB RAM"',
      cortexTime: '2 minutes',
      cortexSteps: 1,
      competitorCommands: [
        'apt update',
        'apt install nginx',
        'cat /proc/cpuinfo | grep processor | wc -l',
        'free -m',
        'nano /etc/nginx/nginx.conf',
        '# Manually set worker_processes, worker_connections, etc.',
        'nginx -t',
        'systemctl restart nginx',
      ],
      competitorTime: '15-30 minutes',
      competitorSteps: 8,
      errorRisk: 'medium',
      timeSaved: '13-28 minutes',
    },
    {
      title: 'Set Up a Complete Development Environment',
      description: 'Install Node.js, Python, Docker, and development tools for a new project.',
      cortexCommand: 'cortex "Set up a full-stack dev environment with Node 20, Python 3.11, Docker, and VS Code"',
      cortexTime: '5 minutes',
      cortexSteps: 1,
      competitorCommands: [
        'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -',
        'apt install nodejs',
        'apt install python3.11 python3.11-venv python3-pip',
        'apt install docker.io docker-compose',
        'usermod -aG docker $USER',
        'wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg',
        '# ... more VS Code setup steps',
      ],
      competitorTime: '30-45 minutes',
      competitorSteps: 12,
      errorRisk: 'high',
      timeSaved: '25-40 minutes',
    },
    {
      title: 'Clean Up Unused Packages',
      description: 'Remove orphaned dependencies and free up disk space safely.',
      cortexCommand: 'cortex "Clean up unused packages and free disk space, show me what will be removed first"',
      cortexTime: '1 minute',
      cortexSteps: 1,
      competitorCommands: [
        'apt autoremove --dry-run',
        'apt autoremove',
        'apt autoclean',
        'apt clean',
      ],
      competitorTime: '5 minutes',
      competitorSteps: 4,
      errorRisk: 'low',
      timeSaved: '4 minutes',
    },
  ],
  whenToUse: {
    cortexBetter: [
      'You want to describe what you need instead of memorizing commands',
      'You need hardware-optimized configurations automatically',
      'You value preview-before-execute and instant rollback',
      'You frequently set up development environments',
      'You are new to Linux package management',
    ],
    competitorBetter: [
      'You are scripting and need deterministic, repeatable commands',
      'You are working on air-gapped systems without AI capabilities',
      'You need the absolute minimal resource footprint',
      'You are an expert who prefers direct control',
      'You are using automation tools that expect apt syntax',
    ],
    whoShouldNotSwitch: [
      'Teams with existing apt-based automation pipelines',
      'Environments where AI access is restricted by policy',
      'Systems where you need bit-for-bit reproducibility',
    ],
  },
  migrationSteps: [
    {
      step: 1,
      title: 'Install Cortex Alongside APT',
      description: 'Cortex works with apt, not against it. Your existing apt workflows remain unchanged.',
      command: 'curl -fsSL https://get.cxlinux-ai.com | sh',
      note: 'Cortex uses apt under the hood for package operations',
    },
    {
      step: 2,
      title: 'Try a Simple Command',
      description: 'Start with something low-risk to see how Cortex works.',
      command: 'cortex "Show me what packages are installed"',
      note: 'This runs apt list --installed with additional context',
    },
    {
      step: 3,
      title: 'Use Preview Mode',
      description: 'Before making changes, use dry-run to see what Cortex will do.',
      command: 'cortex --dry-run "Install the latest stable nginx"',
      note: 'Preview mode is on by default for new users',
    },
    {
      step: 4,
      title: 'Enable Rollback Points',
      description: 'Configure automatic snapshots before system changes.',
      command: 'cortex config set rollback.auto true',
      note: 'Rollback points use minimal disk space with deduplication',
    },
    {
      step: 5,
      title: 'Gradually Adopt',
      description: 'Use Cortex for new tasks while keeping apt for existing scripts.',
      note: 'There is no migration deadline—use both as long as you want',
    },
  ],
  faqs: [
    {
      question: 'Does Cortex replace APT?',
      answer: 'No. Cortex wraps APT and uses it under the hood for package operations. Your existing apt knowledge and scripts continue to work. Cortex adds a natural language interface and safety features on top of the tools you already trust.',
    },
    {
      question: 'Will Cortex break my existing apt configurations?',
      answer: 'Cortex does not modify your apt sources, preferences, or configurations. It reads your existing setup and uses it for package operations. You can uninstall Cortex at any time with no impact on apt.',
    },
    {
      question: 'How does Cortex handle sudo and permissions?',
      answer: 'Cortex respects your existing sudo configuration. For privileged operations, it shows you the exact commands before executing and prompts for confirmation. You maintain full control over what runs with elevated privileges.',
    },
    {
      question: 'Can I use Cortex offline?',
      answer: 'Yes. Cortex supports local AI models like Ollama for offline operation. Package installation still requires network access to apt repositories, but intent processing and command generation work fully offline.',
    },
    {
      question: 'Is Cortex safe for production servers?',
      answer: 'Cortex is designed with production safety in mind. Dry-run mode previews all changes, rollback provides instant recovery, and the sandbox prevents unintended side effects. Many teams use Cortex in production alongside their existing tools.',
    },
  ],
  internalLinks: [
    { text: 'Getting Started Guide', href: '/getting-started' },
    { text: 'Security Architecture', href: '/security' },
    { text: 'Feature Overview', href: '/#features' },
    { text: 'Pricing', href: '/#pricing' },
  ],
};

// ============================================
// NIX / NIXOS COMPARISON
// ============================================
export const nixComparison: ComparisonData = {
  slug: 'nix',
  competitorName: 'nix',
  competitorDisplayName: 'Nix / NixOS',
  tagline: 'AI intent meets declarative configuration',
  seo: {
    title: 'Cortex Linux vs Nix: Intent-Driven Alternative | Cortex Linux',
    description: 'Compare Cortex Linux with Nix and NixOS. See how AI-powered intent processing offers a different approach to reproducible environments.',
    keywords: ['nix alternative', 'nixos alternative', 'declarative linux', 'reproducible environments', 'cortex vs nix'],
    canonicalPath: '/compare/nix',
  },
  experiment: {
    name: 'compare_nix_v1',
    variants: [
      {
        id: 'control',
        weight: 50,
        headline: 'Cortex Linux vs Nix',
        subheadline: 'Intent-driven automation alongside declarative configuration',
        ctaText: 'Try Cortex Free',
        ctaSecondary: 'View Documentation',
        ctaPlacement: 'above-fold',
        ctaStyle: 'strong',
      },
      {
        id: 'variant_coexist',
        weight: 25,
        headline: 'Nix + Cortex: Better Together',
        subheadline: 'Use AI to write Nix expressions. Get declarative guarantees with natural language input.',
        ctaText: 'See the Integration',
        ctaSecondary: 'Read the Docs',
        ctaPlacement: 'after-use-cases',
        ctaStyle: 'soft',
      },
      {
        id: 'variant_learning',
        weight: 25,
        headline: 'Skip the Nix Learning Curve',
        subheadline: 'Get reproducible environments now. Learn Nix at your own pace.',
        ctaText: 'Start Instantly',
        ctaSecondary: 'Compare Approaches',
        ctaPlacement: 'both',
        ctaStyle: 'strong',
      },
    ],
  },
  summaryTable: [
    { label: 'Learning Curve', cortex: 'Minutes', competitor: 'Weeks to months' },
    { label: 'Reproducibility', cortex: 'Intent-based', competitor: 'Deterministic' },
    { label: 'Rollback', cortex: 'Instant', competitor: 'Generation-based' },
    { label: 'Expression Syntax', cortex: 'Natural language', competitor: 'Nix language' },
    { label: 'Ecosystem Size', cortex: 'All Linux packages', competitor: 'Nixpkgs (80k+)' },
  ],
  features: [
    {
      name: 'Reproducible Builds',
      cortex: 'partial',
      cortexNote: 'Intent-based reproducibility',
      competitor: 'yes',
      competitorNote: 'Deterministic by design',
      tooltip: 'Nix offers stronger guarantees; Cortex offers easier adoption',
    },
    {
      name: 'Natural Language Input',
      cortex: 'yes',
      cortexNote: 'Primary interface',
      competitor: 'no',
      competitorNote: 'Requires Nix expression language',
      tooltip: 'Cortex translates intent; Nix requires declarative expressions',
    },
    {
      name: 'Rollback Capability',
      cortex: 'yes',
      cortexNote: 'Instant, any point',
      competitor: 'yes',
      competitorNote: 'Generation-based',
      tooltip: 'Both support rollback with different mechanisms',
    },
    {
      name: 'Isolation/Sandboxing',
      cortex: 'yes',
      cortexNote: 'Firejail-based',
      competitor: 'yes',
      competitorNote: 'Build-time isolation',
      tooltip: 'Different isolation approaches for different use cases',
    },
    {
      name: 'Development Shells',
      cortex: 'yes',
      cortexNote: '"Create a Python 3.11 env"',
      competitor: 'yes',
      competitorNote: 'nix-shell, devShells',
      tooltip: 'Both create isolated development environments',
    },
    {
      name: 'Declarative Configuration',
      cortex: 'partial',
      cortexNote: 'Can generate configs',
      competitor: 'yes',
      competitorNote: 'Core design principle',
      tooltip: 'Nix is declarative-first; Cortex is intent-first',
    },
    {
      name: 'Cross-Platform',
      cortex: 'partial',
      cortexNote: 'Linux-focused',
      competitor: 'yes',
      competitorNote: 'Linux, macOS, WSL',
      tooltip: 'Nix has broader platform support currently',
    },
    {
      name: 'Offline AI Processing',
      cortex: 'yes',
      cortexNote: 'Local models supported',
      competitor: 'no',
      competitorNote: 'N/A',
      tooltip: 'Cortex can work fully offline with local AI',
    },
  ],
  useCases: [
    {
      title: 'Create a Reproducible Development Environment',
      description: 'Set up a consistent dev environment for a team working on a Python ML project.',
      cortexCommand: 'cortex "Create a dev environment with Python 3.11, PyTorch, CUDA support, and Jupyter"',
      cortexTime: '3 minutes',
      cortexSteps: 1,
      competitorCommands: [
        '# Create flake.nix with python, pytorch, cuda overlays',
        '# Configure devShell with proper dependencies',
        '# Handle CUDA unfree packages',
        '# nix develop or direnv integration',
        '# Debug any version conflicts',
      ],
      competitorTime: '30 minutes - 2 hours',
      competitorSteps: 5,
      errorRisk: 'high',
      timeSaved: '27 minutes - 2 hours',
    },
    {
      title: 'Quick Package Testing',
      description: 'Try a new tool without affecting your system.',
      cortexCommand: 'cortex "Let me try ripgrep without installing it permanently"',
      cortexTime: '30 seconds',
      cortexSteps: 1,
      competitorCommands: [
        'nix-shell -p ripgrep',
        '# or nix run nixpkgs#ripgrep',
      ],
      competitorTime: '30 seconds',
      competitorSteps: 1,
      errorRisk: 'low',
      timeSaved: '0 minutes',
    },
    {
      title: 'System Configuration Changes',
      description: 'Add a new service and configure system settings.',
      cortexCommand: 'cortex "Set up PostgreSQL with automatic backups to /backup and 8GB shared buffers"',
      cortexTime: '5 minutes',
      cortexSteps: 1,
      competitorCommands: [
        '# Edit configuration.nix',
        '# Add services.postgresql configuration',
        '# Configure backup service',
        '# nixos-rebuild switch',
        '# Test and debug',
      ],
      competitorTime: '20-40 minutes',
      competitorSteps: 5,
      errorRisk: 'medium',
      timeSaved: '15-35 minutes',
    },
  ],
  whenToUse: {
    cortexBetter: [
      'You need to be productive immediately without learning a new language',
      'You want AI-assisted exploration and configuration',
      'Your team has mixed experience levels',
      'You prefer natural language over declarative syntax',
      'You want easy integration with existing non-Nix systems',
    ],
    competitorBetter: [
      'You need cryptographic guarantees of reproducibility',
      'You are building CI/CD pipelines requiring determinism',
      'You want the full NixOS ecosystem and community',
      'You are willing to invest time in learning for long-term benefits',
      'You need bit-for-bit reproducible builds across machines',
    ],
    whoShouldNotSwitch: [
      'Teams with existing Nix infrastructure investments',
      'Projects requiring NixOS-specific features (generations, profiles)',
      'Environments where deterministic builds are compliance requirements',
    ],
  },
  migrationSteps: [
    {
      step: 1,
      title: 'Understand the Difference',
      description: 'Cortex and Nix solve different problems. Nix offers deterministic builds; Cortex offers intent-driven automation. They can coexist.',
      note: 'Many users run Cortex on NixOS for the best of both worlds',
    },
    {
      step: 2,
      title: 'Install Cortex on Your System',
      description: 'Cortex installs alongside Nix without conflicts.',
      command: 'curl -fsSL https://get.cxlinux-ai.com | sh',
      note: 'On NixOS, you can also add Cortex to your configuration.nix',
    },
    {
      step: 3,
      title: 'Use Cortex for Quick Tasks',
      description: 'Start with ad-hoc tasks while keeping Nix for reproducible configurations.',
      command: 'cortex "Help me write a Nix expression for a Python dev environment"',
      note: 'Cortex can help you learn and write Nix expressions',
    },
    {
      step: 4,
      title: 'Hybrid Workflow',
      description: 'Use Cortex for exploration and prototyping, then codify in Nix for production.',
      note: 'This gives you speed and reproducibility where each matters most',
    },
  ],
  faqs: [
    {
      question: 'Is Cortex a replacement for Nix?',
      answer: 'No. Cortex and Nix have different design goals. Nix provides deterministic, reproducible builds through declarative configuration. Cortex provides intent-driven automation through natural language. Many users find value in using both together.',
    },
    {
      question: 'Can Cortex generate Nix expressions?',
      answer: 'Yes. You can ask Cortex to help write Nix expressions, flakes, or NixOS configurations. This makes Cortex useful as a learning tool and productivity aid even for experienced Nix users.',
    },
    {
      question: 'Does Cortex work on NixOS?',
      answer: 'Yes. Cortex runs on any Linux distribution, including NixOS. You can install it via the standard installer or add it to your NixOS configuration.',
    },
    {
      question: 'Which offers better reproducibility?',
      answer: 'Nix offers stronger reproducibility guarantees through its deterministic build system. Cortex focuses on intent reproducibility—given the same request, it aims to produce consistent results. For compliance requirements demanding bit-for-bit reproducibility, Nix is the better choice.',
    },
    {
      question: 'Can I use Cortex to manage Nix packages?',
      answer: 'Cortex can interact with Nix commands and help you work with the Nix ecosystem. It treats Nix as one of the tools it can leverage, similar to how it uses apt, dnf, or pacman.',
    },
  ],
  internalLinks: [
    { text: 'Getting Started Guide', href: '/getting-started' },
    { text: 'Security Architecture', href: '/security' },
    { text: 'Feature Overview', href: '/#features' },
    { text: 'Pricing', href: '/#pricing' },
  ],
};

// ============================================
// MANUAL CLI COMPARISON
// ============================================
export const manualCliComparison: ComparisonData = {
  slug: 'manual-cli',
  competitorName: 'manual-cli',
  competitorDisplayName: 'Manual CLI / Docs',
  tagline: 'From docs and Stack Overflow to instant execution',
  seo: {
    title: 'Cortex Linux vs Manual CLI: Stop Googling Commands | Cortex Linux',
    description: 'Compare Cortex Linux with manual CLI workflows. See how much time you can save by replacing docs searches with natural language commands.',
    keywords: ['linux cli', 'command line alternative', 'linux automation', 'stop googling linux commands', 'cortex linux'],
    canonicalPath: '/compare/manual-cli',
  },
  experiment: {
    name: 'compare_manual_cli_v1',
    variants: [
      {
        id: 'control',
        weight: 50,
        headline: 'Cortex Linux vs Manual CLI',
        subheadline: 'Stop context-switching between terminals and documentation',
        ctaText: 'Try Cortex Free',
        ctaSecondary: 'View Documentation',
        ctaPlacement: 'above-fold',
        ctaStyle: 'strong',
      },
      {
        id: 'variant_time',
        weight: 25,
        headline: 'Save Hours Every Week',
        subheadline: 'The average developer spends 30% of CLI time reading docs. Cortex gives that time back.',
        ctaText: 'Reclaim Your Time',
        ctaSecondary: 'See Examples',
        ctaPlacement: 'both',
        ctaStyle: 'strong',
      },
      {
        id: 'variant_errors',
        weight: 25,
        headline: 'Fewer Typos, Fewer Mistakes',
        subheadline: 'Copy-paste errors cause 23% of production incidents. Describe intent, let AI handle syntax.',
        ctaText: 'Reduce Errors',
        ctaSecondary: 'View Safety Features',
        ctaPlacement: 'after-use-cases',
        ctaStyle: 'soft',
      },
    ],
  },
  summaryTable: [
    { label: 'Time to Execute', cortex: 'Seconds', competitor: 'Minutes to hours' },
    { label: 'Error Rate', cortex: 'AI-validated', competitor: 'Human-dependent' },
    { label: 'Context Switching', cortex: 'None', competitor: 'Constant (docs, SO, forums)' },
    { label: 'Learning Required', cortex: 'Describe intent', competitor: 'Memorize syntax' },
    { label: 'Preview Before Execute', cortex: 'Always', competitor: 'Manual effort' },
  ],
  features: [
    {
      name: 'Natural Language Input',
      cortex: 'yes',
      cortexNote: 'Describe what you want',
      competitor: 'no',
      competitorNote: 'Exact syntax required',
      tooltip: 'Skip the documentation—just say what you need',
    },
    {
      name: 'Command Validation',
      cortex: 'yes',
      cortexNote: 'AI checks before execution',
      competitor: 'no',
      competitorNote: 'Trial and error',
      tooltip: 'Cortex validates commands before running them',
    },
    {
      name: 'Context Awareness',
      cortex: 'yes',
      cortexNote: 'Understands your system',
      competitor: 'no',
      competitorNote: 'Generic docs',
      tooltip: 'Cortex knows your distro, installed packages, and hardware',
    },
    {
      name: 'Multi-Step Automation',
      cortex: 'yes',
      cortexNote: 'Chains commands intelligently',
      competitor: 'partial',
      competitorNote: 'Manual scripting',
      tooltip: 'Cortex handles complex multi-step operations',
    },
    {
      name: 'Instant Rollback',
      cortex: 'yes',
      cortexNote: 'Built-in recovery',
      competitor: 'no',
      competitorNote: 'Manual backups required',
      tooltip: 'Undo any operation with a single command',
    },
    {
      name: 'Offline Documentation',
      cortex: 'yes',
      cortexNote: 'Embedded knowledge + local AI',
      competitor: 'partial',
      competitorNote: 'man pages, --help',
      tooltip: 'Cortex works offline with local models',
    },
    {
      name: 'Error Explanation',
      cortex: 'yes',
      cortexNote: 'Plain English explanations',
      competitor: 'no',
      competitorNote: 'Cryptic error codes',
      tooltip: 'When things fail, Cortex explains why and how to fix it',
    },
    {
      name: 'Learning Path',
      cortex: 'yes',
      cortexNote: 'Shows commands it runs',
      competitor: 'yes',
      competitorNote: 'Deep learning required',
      tooltip: 'Cortex teaches you by showing what it does',
    },
  ],
  useCases: [
    {
      title: 'Set Up PostgreSQL Replication',
      description: 'Configure primary-replica PostgreSQL replication with automatic failover.',
      cortexCommand: 'cortex "Set up PostgreSQL streaming replication with a primary on this server and configure it for a replica at 192.168.1.50"',
      cortexTime: '10 minutes',
      cortexSteps: 1,
      competitorCommands: [
        '# Research PostgreSQL replication methods (30 min)',
        '# Edit postgresql.conf for wal_level, max_wal_senders',
        '# Edit pg_hba.conf for replication access',
        '# Create replication user',
        '# Configure recovery.conf on replica',
        '# Set up pg_basebackup',
        '# Start replication and verify',
        '# Test failover procedure',
        '# Debug any connection issues',
      ],
      competitorTime: '2-4 hours',
      competitorSteps: 9,
      errorRisk: 'high',
      timeSaved: '2-4 hours',
    },
    {
      title: 'Debug Disk Space Issues',
      description: 'Find what is consuming disk space and safely clean it up.',
      cortexCommand: 'cortex "Find what is using the most disk space in /var and suggest what I can safely delete"',
      cortexTime: '1 minute',
      cortexSteps: 1,
      competitorCommands: [
        'du -sh /var/*',
        'find /var -type f -size +100M',
        'ls -la /var/log',
        'journalctl --disk-usage',
        '# Research each directory before deleting',
        '# Manually clean up identified files',
      ],
      competitorTime: '15-30 minutes',
      competitorSteps: 6,
      errorRisk: 'medium',
      timeSaved: '14-29 minutes',
    },
    {
      title: 'Configure Firewall Rules',
      description: 'Set up iptables rules to allow web traffic and SSH while blocking everything else.',
      cortexCommand: 'cortex "Configure firewall to allow HTTP, HTTPS, and SSH from my office IP 203.0.113.50, block everything else"',
      cortexTime: '2 minutes',
      cortexSteps: 1,
      competitorCommands: [
        '# Research iptables vs nftables vs ufw',
        'iptables -F',
        'iptables -A INPUT -i lo -j ACCEPT',
        'iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT',
        'iptables -A INPUT -p tcp --dport 22 -s 203.0.113.50 -j ACCEPT',
        'iptables -A INPUT -p tcp --dport 80 -j ACCEPT',
        'iptables -A INPUT -p tcp --dport 443 -j ACCEPT',
        'iptables -A INPUT -j DROP',
        'iptables-save > /etc/iptables.rules',
        '# Make rules persistent',
      ],
      competitorTime: '20-45 minutes',
      competitorSteps: 10,
      errorRisk: 'high',
      timeSaved: '18-43 minutes',
    },
    {
      title: 'SSL Certificate Setup',
      description: 'Install and configure Let\'s Encrypt SSL for a domain.',
      cortexCommand: 'cortex "Set up free SSL certificate for example.com with automatic renewal"',
      cortexTime: '3 minutes',
      cortexSteps: 1,
      competitorCommands: [
        'apt install certbot python3-certbot-nginx',
        'certbot --nginx -d example.com -d www.example.com',
        '# Answer interactive prompts',
        '# Verify certificate installation',
        'certbot renew --dry-run',
        '# Configure cron for renewal',
      ],
      competitorTime: '15-30 minutes',
      competitorSteps: 6,
      errorRisk: 'medium',
      timeSaved: '12-27 minutes',
    },
  ],
  whenToUse: {
    cortexBetter: [
      'You frequently perform unfamiliar system administration tasks',
      'You want to reduce time spent searching documentation',
      'You value safety features like preview and rollback',
      'You are learning Linux and want guided assistance',
      'You manage multiple servers and need to work quickly',
    ],
    competitorBetter: [
      'You are writing deterministic automation scripts',
      'You prefer memorizing commands for muscle memory',
      'You are in environments where AI cannot be used',
      'You need to audit every character of every command',
      'You are troubleshooting issues that require deep system knowledge',
    ],
    whoShouldNotSwitch: [
      'Those who prefer complete manual control for learning purposes',
      'Environments with strict security policies against AI tools',
      'Tasks where you need bit-perfect command reproducibility',
    ],
  },
  migrationSteps: [
    {
      step: 1,
      title: 'Install Cortex',
      description: 'One command to get started. Works alongside your existing tools.',
      command: 'curl -fsSL https://get.cxlinux-ai.com | sh',
      note: 'No configuration required—Cortex detects your system automatically',
    },
    {
      step: 2,
      title: 'Start with Preview Mode',
      description: 'Every command shows what will run before execution.',
      command: 'cortex "What would happen if I ran apt upgrade?"',
      note: 'Dry-run by default for new users',
    },
    {
      step: 3,
      title: 'Use for Complex Tasks First',
      description: 'Start with tasks that would normally require documentation searches.',
      command: 'cortex "Help me set up a cron job to backup /home every night at 2am"',
      note: 'Cortex shines brightest on multi-step tasks',
    },
    {
      step: 4,
      title: 'Learn as You Go',
      description: 'Cortex shows the commands it runs, so you learn real Linux skills.',
      note: 'Use "explain" mode to understand each step',
    },
    {
      step: 5,
      title: 'Keep Your Terminal Skills',
      description: 'Cortex supplements your knowledge—it does not replace it.',
      note: 'Many power users mix Cortex with direct CLI for different tasks',
    },
  ],
  faqs: [
    {
      question: 'Will using Cortex prevent me from learning Linux?',
      answer: 'No. Cortex shows every command it runs, explaining what each does and why. Many users report that Cortex accelerated their Linux learning because they see real commands in context rather than isolated examples from documentation.',
    },
    {
      question: 'How accurate are the commands Cortex generates?',
      answer: 'Cortex validates commands before execution and understands your specific system context. It knows your distribution, installed packages, and configuration. This context-awareness typically produces more accurate commands than generic documentation.',
    },
    {
      question: 'What if Cortex generates a wrong or dangerous command?',
      answer: 'Cortex shows all commands before execution in dry-run mode. You can review, modify, or reject any suggestion. For critical operations, Cortex creates automatic rollback points. You always maintain final approval over what runs.',
    },
    {
      question: 'Does Cortex work offline?',
      answer: 'Yes. Cortex supports local AI models like Ollama for fully offline operation. Your system data never leaves your machine when using local models. This makes Cortex suitable for air-gapped or security-sensitive environments.',
    },
    {
      question: 'How is this different from ChatGPT for Linux commands?',
      answer: 'Cortex is purpose-built for Linux system operations. It understands your specific system state, can execute commands directly, provides instant rollback, and works offline. It is not a general chatbot—it is a specialized system automation tool with built-in safety features.',
    },
  ],
  internalLinks: [
    { text: 'Getting Started Guide', href: '/getting-started' },
    { text: 'Security Architecture', href: '/security' },
    { text: 'Feature Overview', href: '/#features' },
    { text: 'Pricing', href: '/#pricing' },
  ],
};

// Export all comparisons
export const comparisons: Record<string, ComparisonData> = {
  apt: aptComparison,
  nix: nixComparison,
  'manual-cli': manualCliComparison,
};

export function getComparisonBySlug(slug: string): ComparisonData | undefined {
  return comparisons[slug];
}

export function getAllComparisonSlugs(): string[] {
  return Object.keys(comparisons);
}
