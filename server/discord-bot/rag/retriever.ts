/**
 * RAG Retriever - Enhanced Version
 *
 * Advanced knowledge base retrieval with:
 * - Fuzzy matching for typos
 * - Synonym expansion
 * - Relevance scoring with thresholds
 * - Comprehensive knowledge base
 */

// Synonym mappings for query expansion
const SYNONYMS: Record<string, string[]> = {
  install: ["setup", "download", "get", "put", "add", "installation"],
  hackathon: ["hack", "competition", "contest", "event", "build"],
  referral: ["refer", "invite", "share", "friend", "reward"],
  help: ["support", "assist", "question", "issue", "problem"],
  feature: ["capability", "function", "ability", "can do"],
  price: ["cost", "pay", "money", "subscription", "premium", "pro"],
  community: ["discord", "chat", "server", "group", "people"],
  linux: ["os", "operating system", "distro", "distribution"],
  command: ["terminal", "cli", "shell", "bash", "cmd"],
  natural: ["plain english", "speak", "talk", "say", "voice"],
};

// Comprehensive knowledge base
const KNOWLEDGE_BASE: Array<{
  keywords: string[];
  content: string;
  category: string;
  priority: number; // Higher = more important
}> = [
  // === OVERVIEW ===
  {
    keywords: ["what is", "cx", "about", "explain", "tell me", "overview", "introduction"],
    category: "overview",
    priority: 10,
    content: `CX Linux is an AI-native operating system that lets you control your computer with natural language. Instead of memorizing terminal commands, you just type what you want in plain English. It's built on Arch Linux, so you get all the power and flexibility of Arch with a much friendlier interface. We're fully open source and community-driven.`,
  },
  {
    keywords: ["why", "benefit", "advantage", "better", "special", "unique", "different"],
    category: "overview",
    priority: 8,
    content: `What makes CX Linux special is the AI layer that understands what you mean, not just what you type. You don't need to remember if it's 'ls -la' or 'dir' or whatever. Just say 'show all files including hidden ones' and it figures it out. It's especially great for people new to Linux or anyone who's tired of googling commands.`,
  },

  // === INSTALLATION ===
  {
    keywords: ["install", "installation", "setup", "get started", "download", "iso"],
    category: "installation",
    priority: 10,
    content: `To install CX Linux, download the ISO from cxlinux.com/download, then flash it to a USB with Rufus, Balena Etcher, or the dd command. Boot from the USB and the installer guides you through everything. The AI even helps with disk partitioning so you don't have to stress about that part.`,
  },
  {
    keywords: ["requirements", "specs", "minimum", "need", "ram", "disk", "cpu", "hardware"],
    category: "installation",
    priority: 7,
    content: `For hardware, you need a 64-bit processor, at least 4 gigs of RAM though 8 is recommended for a smoother experience, and about 20 gigs of disk space minimum. Any modern computer from the last 10 years should work fine. Graphics-wise, both Intel integrated and dedicated GPUs work.`,
  },
  {
    keywords: ["dual boot", "windows", "alongside", "keep", "both"],
    category: "installation",
    priority: 6,
    content: `You can totally dual boot CX Linux with Windows. During installation, choose the manual partitioning option and create a separate partition for CX Linux. The bootloader will detect Windows and let you choose which OS to boot. Just make sure to back up your data first, as always with disk operations.`,
  },
  {
    keywords: ["virtual", "vm", "virtualbox", "vmware", "qemu", "virtual machine"],
    category: "installation",
    priority: 6,
    content: `CX Linux runs great in virtual machines. VirtualBox, VMware, and QEMU all work well. Allocate at least 4GB RAM and 2 CPU cores to the VM for decent performance. Enable 3D acceleration if you want a smoother desktop experience. It's a great way to try CX Linux without touching your main system.`,
  },
  {
    keywords: ["mac", "macbook", "apple", "m1", "m2", "silicon", "intel mac"],
    category: "installation",
    priority: 7,
    content: `For Intel Macs, you can dual boot or run CX Linux in a VM like Parallels or VirtualBox. For M1/M2 Apple Silicon Macs, native install isn't supported since we're x86-based, but you can run it in UTM or other ARM-compatible VM software with x86 emulation. Performance won't be as snappy though.`,
  },

  // === FEATURES ===
  {
    keywords: ["natural language", "ai command", "speak", "talk", "ask", "plain english", "how does it work"],
    category: "features",
    priority: 10,
    content: `The core feature is natural language commands. Instead of typing 'find . -size +100M -type f', you just say 'find files larger than 100 megabytes'. Or 'update all my packages' instead of 'sudo pacman -Syu'. The AI understands context too, so 'delete those files' works after you've just listed some files.`,
  },
  {
    keywords: ["example", "commands", "can do", "show me", "demo", "try"],
    category: "features",
    priority: 8,
    content: `Here are some things you can say: 'show my disk usage', 'find large files in downloads', 'install firefox', 'update everything', 'compress this folder', 'show running processes', 'kill chrome', 'connect to wifi', 'show my IP address', 'create a backup of my documents'. Just speak naturally and CX Linux figures out the right commands.`,
  },
  {
    keywords: ["arch", "base", "pacman", "aur", "package", "repository"],
    category: "features",
    priority: 7,
    content: `Under the hood, CX Linux is Arch Linux. You get pacman for package management, access to the official Arch repos, and the AUR which has basically every piece of software you could want. Rolling release means you're always on the latest versions. All your Arch knowledge still applies, the AI is just an additional layer on top.`,
  },
  {
    keywords: ["offline", "internet", "connection", "without wifi", "no internet"],
    category: "features",
    priority: 5,
    content: `The basic AI features work offline using local models. For more complex queries or when you want the best accuracy, it can use cloud AI. You can configure this in settings. Most everyday commands like file operations, package management, and system info work fine without internet.`,
  },
  {
    keywords: ["privacy", "data", "secure", "telemetry", "tracking", "send"],
    category: "features",
    priority: 6,
    content: `Privacy is important to us. When using local mode, nothing leaves your machine. Cloud mode sends your query to process but we don't store personal data. Telemetry is opt-in only. You can check the source code yourself since we're fully open source. Your commands, your data, your control.`,
  },
  {
    keywords: ["desktop", "gui", "kde", "gnome", "interface", "ui"],
    category: "features",
    priority: 5,
    content: `CX Linux comes with a clean desktop environment. The AI assistant is accessible from anywhere with a keyboard shortcut. You can use it alongside traditional GUI apps. We support both KDE and GNOME flavors depending on your preference. The AI works whether you're in a terminal or using graphical apps.`,
  },

  // === HACKATHON ===
  {
    keywords: ["hackathon", "contribute", "prize", "competition", "build", "participate", "join", "enter"],
    category: "hackathon",
    priority: 10,
    content: `The CX Linux Hackathon 2026 has fifteen thousand dollars in total prizes. It's in two phases. The Ideathon runs weeks one through four where you submit feature ideas and can win from the three thousand dollar prize pool distributed across thirty winners: Top 3 get $250 each, Top 10 (ranks 4-10) get $130 each, and Top 30 (ranks 11-30) get $67 each. Then the main Hackathon is weeks five through thirteen where you build features, with twelve thousand in prizes. All skill levels welcome.`,
  },
  {
    keywords: ["ideathon", "idea", "submit", "proposal", "phase 1", "first phase"],
    category: "hackathon",
    priority: 7,
    content: `The Ideathon is the first phase where you don't need to code anything. Just submit your best ideas for CX Linux features. Think about what would make the AI assistant better, what integrations would be useful, or what pain points in Linux could be solved. Three thousand dollars in prizes distributed to thirty winners across three tiers: Top 3 Grand Winners, Top 10 Excellence Winners, and Top 30 Ideathon Winners.`,
  },
  {
    keywords: ["hackathon prize", "win", "reward", "money", "award", "winner"],
    category: "hackathon",
    priority: 8,
    content: `Prize breakdown: Ideathon has three thousand total distributed to 30 winners - Top 3 Grand Winners get $250 each, Top 10 Excellence (ranks 4-10) get $130 each, and Top 30 (ranks 11-30) get $67 each. The main Hackathon has twelve thousand with first place getting five thousand, second three thousand, third two thousand, and ranks 4-7 getting $500 each.`,
  },
  {
    keywords: ["register", "sign up", "hackathon how", "start", "begin"],
    category: "hackathon",
    priority: 8,
    content: `To join the hackathon, head to cxlinux.com/hackathon and register with your email. You'll get access to participant channels, the submission portal, and updates. You can participate solo or form teams of up to four people.`,
  },
  {
    keywords: ["deadline", "when", "date", "timeline", "schedule", "end"],
    category: "hackathon",
    priority: 6,
    content: `The hackathon timeline: Ideathon runs for the first four weeks, then the main build phase is weeks five through thirteen. Check cxlinux.com/hackathon for exact dates and deadlines. There's a midpoint check-in during week nine where you can get feedback on your progress.`,
  },

  // === REFERRAL PROGRAM ===
  {
    keywords: ["referral", "invite", "rewards", "share", "waitlist", "friend", "refer"],
    category: "referral",
    priority: 9,
    content: `Our referral program lets you earn rewards by inviting friends. You get a unique link at cxlinux.com/referrals. As people sign up with your link, you climb tiers: Bronze at one referral gets you a badge and moves you up 100 waitlist spots. Silver at three gets Discord access. It goes all the way to Legendary at fifty referrals with lifetime VIP status.`,
  },
  {
    keywords: ["tier", "bronze", "silver", "gold", "platinum", "diamond", "legendary", "level"],
    category: "referral",
    priority: 7,
    content: `Referral tiers: One referral gets Bronze with a badge and 100 spots up on the waitlist. Three gets Silver with Discord server access. Five gets Gold with a swag pack. Ten gets Platinum with one month of Pro free. Twenty gets Diamond with Ambassador status. Fifty gets Legendary with lifetime VIP access to everything.`,
  },
  {
    keywords: ["waitlist", "early access", "beta", "when release", "launch"],
    category: "referral",
    priority: 6,
    content: `We're currently in beta with a waitlist for the public release. Join at cxlinux.com and refer friends to move up the list faster. Beta testers get early access and can provide feedback that shapes the final product. The more referrals you have, the sooner you'll get access.`,
  },

  // === COMMUNITY ===
  {
    keywords: ["discord", "community", "chat", "help", "support", "contact", "talk to"],
    category: "community",
    priority: 9,
    content: `The Discord community is the best place to get help, chat with other users, and stay updated. We have channels for general discussion, tech support, development talk, and hackathon coordination. The community is super welcoming to newcomers.`,
  },
  {
    keywords: ["github", "source", "code", "contribute", "open source", "repo", "repository"],
    category: "community",
    priority: 7,
    content: `CX Linux is fully open source. Check out our GitHub at github.com/cortexlinux/cortex. You can browse the code, report issues, submit pull requests, or fork it for your own projects. We welcome contributions of all kinds, from code to documentation to translations.`,
  },
  {
    keywords: ["team", "who made", "creator", "behind", "company", "developer"],
    category: "community",
    priority: 5,
    content: `CX Linux is built by a small passionate team that believes Linux should be accessible to everyone. We're backed by the community and focused on making AI-powered computing a reality. Check out cxlinux.com/about for more on the team and our mission.`,
  },

  // === TROUBLESHOOTING ===
  {
    keywords: ["error", "problem", "issue", "fix", "broken", "not working", "help", "stuck", "trouble"],
    category: "troubleshooting",
    priority: 8,
    content: `If you're having issues, first try updating with 'sudo pacman -Syu'. Check system logs with 'journalctl -xe' for error details. For AI-specific problems, restart the service with 'systemctl restart cortex-ai'. Low on disk? Check with 'df -h'. Still stuck? Drop by the support channel on Discord and we'll help you out.`,
  },
  {
    keywords: ["slow", "performance", "lag", "freeze", "hanging", "speed"],
    category: "troubleshooting",
    priority: 6,
    content: `If CX Linux feels slow, check your RAM usage with 'free -h'. The AI works better with more memory available. You can also try switching to local-only mode in settings if cloud queries are slow. Make sure you're not running too many heavy apps simultaneously. An SSD instead of HDD makes a huge difference too.`,
  },
  {
    keywords: ["boot", "grub", "won't start", "black screen", "startup"],
    category: "troubleshooting",
    priority: 7,
    content: `Boot issues usually relate to the bootloader or graphics drivers. Try booting with 'nomodeset' kernel parameter from GRUB. If dual-booting and can't see CX Linux, run 'sudo update-grub' from a live USB. For black screens, it's often a GPU driver issue. Check the Arch Wiki for your specific graphics card.`,
  },
  {
    keywords: ["wifi", "network", "internet", "connect", "ethernet", "no connection"],
    category: "troubleshooting",
    priority: 6,
    content: `For network issues, first check if your interface is up with 'ip link'. Try restarting NetworkManager with 'systemctl restart NetworkManager'. For WiFi, make sure your card is detected with 'lspci | grep Network'. Some WiFi cards need proprietary drivers from the AUR. Ethernet usually just works out of the box.`,
  },

  // === PRICING ===
  {
    keywords: ["pro", "premium", "subscription", "paid", "price", "cost", "free", "pricing"],
    category: "pricing",
    priority: 8,
    content: `CX Linux has a free Community edition with full OS functionality, basic AI commands, and community support. Pro is coming soon with advanced AI features, priority cloud processing, extended command history, custom AI training, and priority support. Join the waitlist through our referral program for early Pro access.`,
  },
  {
    keywords: ["free", "cost nothing", "no money", "free tier", "community edition"],
    category: "pricing",
    priority: 7,
    content: `The Community edition is completely free and always will be. You get the full operating system, local AI capabilities, access to all Arch packages and the AUR, and community support through Discord. Pro just adds extra cloud AI features and priority support for power users.`,
  },

  // === COMPARISON ===
  {
    keywords: ["compare", "vs", "versus", "ubuntu", "fedora", "mint", "other distro", "difference"],
    category: "comparison",
    priority: 6,
    content: `Compared to Ubuntu or Mint, CX Linux is more cutting-edge since it's based on Arch with rolling releases. The main difference is the AI assistant that no other distro has built-in. Compared to plain Arch, we're much more beginner-friendly with guided installation and natural language commands. Think of it as Arch made accessible.`,
  },
  {
    keywords: ["chatgpt", "copilot", "ai assistant", "other ai", "gpt"],
    category: "comparison",
    priority: 5,
    content: `Unlike ChatGPT or Copilot which are chat interfaces, CX Linux AI is deeply integrated into the operating system. It can actually execute commands, manage files, install software, and control your system. It's not just answering questions, it's doing the work. And it understands Linux context natively.`,
  },
];

// Track stats
let stats = {
  totalDocuments: KNOWLEDGE_BASE.length,
  categories: {} as Record<string, number>,
};

// Calculate category counts
KNOWLEDGE_BASE.forEach((doc) => {
  stats.categories[doc.category] = (stats.categories[doc.category] || 0) + 1;
});

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if two words are similar (fuzzy match)
 */
function isSimilar(word1: string, word2: string, threshold = 2): boolean {
  if (word1.length < 4 || word2.length < 4) return word1 === word2;
  return levenshteinDistance(word1, word2) <= threshold;
}

/**
 * Expand query with synonyms
 */
function expandQuery(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set(words);

  for (const word of words) {
    // Check if word has synonyms
    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
      if (word === key || synonyms.includes(word)) {
        expanded.add(key);
        synonyms.forEach((s) => expanded.add(s));
      }
    }
  }

  return Array.from(expanded);
}

/**
 * Get relevant context for a question with smart matching
 */
export async function getRelevantContext(question: string): Promise<string[]> {
  const expandedTerms = expandQuery(question);
  const lowerQuestion = question.toLowerCase();
  const results: Array<{ content: string; score: number; priority: number }> = [];

  for (const doc of KNOWLEDGE_BASE) {
    let score = 0;

    // Check keyword matches with expanded terms
    for (const keyword of doc.keywords) {
      const keywordLower = keyword.toLowerCase();

      // Exact phrase match in question
      if (lowerQuestion.includes(keywordLower)) {
        score += 15;
        continue;
      }

      // Check expanded terms
      for (const term of expandedTerms) {
        if (keywordLower.includes(term) || term.includes(keywordLower)) {
          score += 10;
        } else if (isSimilar(term, keywordLower)) {
          score += 5; // Fuzzy match
        }
      }

      // Partial word match
      const keywordWords = keywordLower.split(" ");
      for (const kw of keywordWords) {
        if (kw.length > 3 && expandedTerms.some((t) => t.includes(kw) || kw.includes(t))) {
          score += 3;
        }
      }
    }

    // Add priority bonus
    if (score > 0) {
      score += doc.priority;
      results.push({ content: doc.content, score, priority: doc.priority });
    }
  }

  // Sort by score and return top results
  results.sort((a, b) => b.score - a.score);

  // Only return if score is above threshold (relevance filtering)
  const RELEVANCE_THRESHOLD = 10;
  const relevant = results.filter((r) => r.score >= RELEVANCE_THRESHOLD);

  // Return top 2-3 based on scores
  const top = relevant.slice(0, 3);

  console.log(
    `[RAG] Query: "${question.slice(0, 50)}..." -> ${top.length} relevant docs (scores: ${top.map((r) => r.score).join(", ")})`
  );

  return top.map((r) => r.content);
}

/**
 * Refresh the knowledge base
 */
export async function refreshKnowledgeBase(): Promise<typeof stats> {
  console.log("[RAG] Knowledge base refreshed");
  return stats;
}

/**
 * Get RAG stats
 */
export function getStats(): typeof stats {
  return stats;
}

/**
 * Get the knowledge base for embeddings initialization
 */
export function getKnowledgeBase(): typeof KNOWLEDGE_BASE {
  return KNOWLEDGE_BASE;
}

export default {
  getRelevantContext,
  refreshKnowledgeBase,
  getStats,
  getKnowledgeBase,
};
