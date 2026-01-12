/**
 * RAG Retriever
 *
 * Simple knowledge base retrieval system for Cortex Linux documentation.
 * Uses keyword matching and semantic similarity for relevant context.
 */

// Knowledge base with Cortex Linux documentation
const KNOWLEDGE_BASE: Array<{
  keywords: string[];
  content: string;
  category: string;
}> = [
  {
    keywords: ["install", "installation", "setup", "get started", "download"],
    category: "installation",
    content: `**Installing Cortex Linux:**
1. Download the ISO from https://cortexlinux.com/download
2. Create a bootable USB using tools like Rufus or dd
3. Boot from USB and follow the installer
4. The AI assistant will guide you through partitioning and configuration

Requirements:
- 64-bit processor
- 4GB RAM minimum (8GB recommended)
- 20GB disk space minimum`,
  },
  {
    keywords: ["natural language", "ai command", "speak", "talk", "ask"],
    category: "features",
    content: `**Natural Language Commands:**
Cortex Linux understands plain English commands:
- "find large files in downloads" → finds files > 100MB
- "install chrome" → handles package installation
- "update everything" → runs system updates
- "show disk usage" → displays storage info
- "compress this folder" → creates archive

Just type naturally and Cortex translates to the right Linux commands.`,
  },
  {
    keywords: ["hackathon", "contribute", "prize", "competition", "build"],
    category: "community",
    content: `**Cortex Hackathon 2026:**
Join our open-source hackathon with $15,000 in prizes!

Phase 1 - Ideathon (Weeks 1-4): Submit feature ideas, $3,000 prizes
Phase 2 - Hackathon (Weeks 5-13): Build features, $12,000 prizes

Register: https://cortexlinux.com/hackathon
All skill levels welcome!`,
  },
  {
    keywords: ["referral", "invite", "rewards", "share", "waitlist"],
    category: "community",
    content: `**Referral Program:**
Earn rewards by inviting friends to Cortex Linux!

Tiers:
- 1 referral: Bronze badge + 100 spots up
- 3 referrals: Silver + Discord access
- 5 referrals: Gold + Swag pack
- 10 referrals: Platinum + 1 month Pro
- 20 referrals: Diamond + Ambassador status
- 50 referrals: Legendary + Lifetime VIP

Get your link: https://cortexlinux.com/referrals`,
  },
  {
    keywords: ["discord", "community", "chat", "help", "support"],
    category: "community",
    content: `**Join Our Community:**
- Discord: https://discord.gg/cortexlinux
- GitHub: https://github.com/cortexlinux/cortex
- Twitter: @cortexlinux

Our Discord has:
- #general for chat
- #support for help
- #dev for contributors
- #announcements for news`,
  },
  {
    keywords: ["arch", "base", "package", "pacman", "aur"],
    category: "technical",
    content: `**Technical Foundation:**
Cortex Linux is built on Arch Linux, giving you:
- Rolling release updates
- Access to Arch repos and AUR
- Pacman package manager
- Latest software versions

The AI layer adds natural language processing on top of standard Linux commands.`,
  },
  {
    keywords: ["error", "problem", "issue", "fix", "broken", "not working"],
    category: "troubleshooting",
    content: `**Troubleshooting Steps:**
1. Check system logs: \`journalctl -xe\`
2. Update system: \`sudo pacman -Syu\`
3. Check disk space: \`df -h\`
4. Check memory: \`free -h\`

For AI-specific issues:
- Restart AI service: \`systemctl restart cortex-ai\`
- Check API status: \`cortex status\`

Still stuck? Ask in #support on Discord!`,
  },
  {
    keywords: ["pro", "premium", "subscription", "paid", "price"],
    category: "pricing",
    content: `**Cortex Linux Editions:**

**Free (Community)**
- Full OS functionality
- Basic AI commands
- Community support

**Pro (Coming Soon)**
- Advanced AI features
- Priority support
- Extended command history
- Custom AI training

Join the waitlist for Pro access: https://cortexlinux.com/referrals`,
  },
];

// Track stats
let stats = {
  totalDocuments: KNOWLEDGE_BASE.length,
  sources: {
    installation: 1,
    features: 1,
    community: 3,
    technical: 1,
    troubleshooting: 1,
    pricing: 1,
  },
};

/**
 * Get relevant context for a question
 */
export async function getRelevantContext(question: string): Promise<string[]> {
  const lowerQuestion = question.toLowerCase();
  const results: Array<{ content: string; score: number }> = [];

  for (const doc of KNOWLEDGE_BASE) {
    let score = 0;

    // Check keyword matches
    for (const keyword of doc.keywords) {
      if (lowerQuestion.includes(keyword)) {
        score += 10;
      }
      // Partial match
      const words = keyword.split(" ");
      for (const word of words) {
        if (lowerQuestion.includes(word) && word.length > 3) {
          score += 3;
        }
      }
    }

    if (score > 0) {
      results.push({ content: doc.content, score });
    }
  }

  // Sort by score and return top 2
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 2).map((r) => r.content);
}

/**
 * Refresh the knowledge base
 */
export async function refreshKnowledgeBase(): Promise<typeof stats> {
  // In production, this would fetch from a database or external source
  console.log("[RAG] Knowledge base refreshed");
  return stats;
}

/**
 * Get RAG stats
 */
export function getStats(): typeof stats {
  return stats;
}

export default {
  getRelevantContext,
  refreshKnowledgeBase,
  getStats,
};
