import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Settings, DollarSign, Cpu, Target, Rocket, Wrench, Search } from "lucide-react";
import Footer from "@/components/Footer";

interface Question {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  icon: typeof Shield;
  questions: Question[];
}

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const faqData: FAQCategory[] = [
    {
      category: "Security & Safety",
      icon: Shield,
      questions: [
        {
          q: "Is Cortex safe? Won't it break my system?",
          a: "Cortex is designed with security as the #1 priority. Here's how we protect your system:\n\n• Sandboxed Execution: Every command runs in an isolated Firejail container with no direct kernel access\n• Preview Before Execute: You see and approve every command before it runs\n• Instant Rollback: We create snapshots before major changes. Undo anything in seconds.\n• Command Validation: Dangerous commands (like rm -rf /) are blocked automatically\n• Audit Logging: Every action is logged for complete transparency\n\nThink of it like having a professional system administrator who shows you their plan before doing anything."
        },
        {
          q: "How do you prevent dangerous commands like 'rm -rf /'?",
          a: "Multiple layers of protection:\n\n1. Blacklist: Destructive commands are blocked by default\n2. Dry-run mode: Test changes in simulation first\n3. User confirmation: System-wide changes require your explicit approval\n4. Severity scoring: AI classifies command risk level (safe/caution/danger)\n5. Rollback ready: Even approved commands can be undone\n\nYou can review our security architecture on GitHub."
        },
        {
          q: "What if the AI hallucinates or makes mistakes?",
          a: "We've built multiple safeguards:\n\n• Command Validation: Every AI-generated command is validated against known patterns\n• Testing First: Commands are tested in sandbox before running on your system\n• Human-in-the-loop: You approve all critical operations\n• Learning System: When errors occur, Cortex learns and never repeats them\n• Confidence Scoring: Low-confidence suggestions require extra confirmation\n\nThe AI suggests, you decide. Always."
        },
        {
          q: "Does Cortex have root access to my system?",
          a: "No. Cortex runs with the same permissions as your user account. When root/sudo is needed:\n\n1. Cortex asks for your sudo password (just like any other program)\n2. Shows you exactly what will run with elevated permissions\n3. Waits for your approval\n4. You can always say no\n\nCortex never stores your password or runs elevated commands without permission."
        },
        {
          q: "Can I review commands before they execute?",
          a: "Yes, always. The workflow is:\n\n1. You: \"Install Oracle optimized for my GPU\"\n2. Cortex: Analyzes and shows you the plan:\n   - Will install: CUDA 12.3, Oracle 23c, dependencies X, Y, Z\n   - Will modify: /etc/oracle/config, ~/.bashrc\n   - Estimated time: 4 minutes\n3. You: Approve or reject\n4. Cortex: Executes only after approval\n\nYou can also enable \"explain mode\" where Cortex describes what each command does in plain English."
        }
      ]
    },
    {
      category: "How It Works",
      icon: Settings,
      questions: [
        {
          q: "How is Cortex different from Warp/Gemini CLI/Claude Code?",
          a: "Great question! Here's the key difference:\n\nTERMINAL WRAPPERS (Warp, Gemini CLI):\n• Helps you write commands\n• You still need to know what to install\n• No hardware awareness\n• No dependency resolution\n\nCODE EDITORS (Claude Code):\n• Focused on writing code\n• Not designed for system administration\n• Doesn't handle OS-level configuration\n\nCORTEX (OS-LEVEL):\n• Understands what you're trying to accomplish\n• Detects your hardware automatically\n• Resolves dependencies for you\n• Configures entire stack (not just one command)\n• Optimizes for your specific system\n\nExample: \"Install TensorFlow optimized for my GPU\"\n• Warp: Helps you write \"pip install tensorflow\"\n• Cortex: Detects RTX 4090 → Installs CUDA 12.3 → Installs TensorFlow-GPU 2.15 → Configures for your card → Runs verification"
        },
        {
          q: "What does \"AI-native OS\" mean technically?",
          a: "Cortex is NOT replacing the Linux kernel. It's a layer that sits between you and the operating system:\n\nTraditional Linux: You → Terminal → Commands → OS\nCortex Linux: You → Natural Language → AI Layer → Commands → OS\n\nThe AI layer:\n• Translates your intent into commands\n• Understands hardware and dependencies\n• Generates installation plans\n• Executes in sandboxed environment\n• Learns from outcomes\n\nUnder the hood, it's still Ubuntu 24.04. We're just making it understand you."
        },
        {
          q: "Does Cortex replace Linux or wrap it?",
          a: "Cortex wraps Ubuntu 24.04 LTS. It's built on standard Debian packaging with an AI layer on top.\n\nWhat this means:\n• All your normal Linux tools still work (apt, vim, git, etc.)\n• You can drop to terminal anytime\n• Existing scripts and tools are compatible\n• You choose when to use Cortex vs manual commands\n\nThink of it as a smart assistant, not a replacement."
        },
        {
          q: "Do I need to know Linux to use Cortex?",
          a: "No, that's the point! Cortex is designed for:\n\n• Data scientists who need tools but don't want to become Linux experts\n• Developers who want to focus on code, not configuration\n• Students learning programming without OS configuration barriers\n• Anyone frustrated by \"dependency hell\"\n\nYou can learn Linux through Cortex. It explains what it's doing and why."
        },
        {
          q: "Does it work offline or require internet?",
          a: "Hybrid approach:\n\n• Cloud Mode (default): Uses Claude API, works on any machine\n• Local Mode (optional): Runs LLM locally, requires GPU\n• Hybrid Mode (best): Local for simple tasks, cloud for complex ones\n\nYou choose based on your privacy needs and hardware."
        }
      ]
    },
    {
      category: "Business & Pricing",
      icon: DollarSign,
      questions: [
        {
          q: "Is Cortex free or paid?",
          a: "Both!\n\nCOMMUNITY EDITION: Free forever, open source (Apache 2.0)\n• Full AI capabilities\n• All core features\n• Perfect for individual developers and students\n\nENTERPRISE EDITION: Paid subscriptions for companies\n• Everything in Community\n• Priority support (24/7)\n• Compliance & audit features\n• Custom integrations\n• SLA guarantees\n\nSimilar to Red Hat's model: Open core, enterprise support."
        },
        {
          q: "What's the business model?",
          a: "Open source community edition with enterprise subscriptions:\n\nRevenue sources:\n1. Enterprise licenses (companies pay for support & compliance)\n2. Professional services (custom integrations, training)\n3. Cloud hosting (optional managed Cortex instances)\n\nIndividual developers: Always free\nCompanies: Pay for support, compliance, SLA"
        },
        {
          q: "Who is Cortex for?",
          a: "Primary users:\n\n• Data Scientists: Tired of CUDA installation hell\n• ML Engineers: Want tools working, not dependency debugging\n• DevOps Teams: Need reproducible environments\n• Students: Learning to code, not managing system configuration\n• Enterprises: Need compliance + easy Linux deployment\n\nIf you've ever spent hours on Stack Overflow trying to install something, Cortex is for you."
        },
        {
          q: "Can I use it for commercial projects?",
          a: "Yes! Apache 2.0 license means:\n\n• Free for commercial use\n• Can modify and distribute\n• No licensing fees\n• Patent protection included\n\nEnterprise edition adds support and compliance, but Community edition is fully commercial-ready."
        }
      ]
    },
    {
      category: "Technical Requirements",
      icon: Cpu,
      questions: [
        {
          q: "What hardware do I need?",
          a: "Cloud Mode (recommended): Any Linux machine\n• CPU: Any modern processor\n• RAM: 4GB+ recommended\n• Disk: 10GB+ free space\n• Internet: Required for AI API calls\n\nLocal Mode (optional): Requires GPU\n• GPU: NVIDIA RTX 3060+ or AMD equivalent\n• RAM: 16GB+ recommended\n• VRAM: 8GB+ on GPU\n\nMost users run cloud mode. Local is for air-gapped environments."
        },
        {
          q: "Does it work on my laptop?",
          a: "Yes! If you can run Ubuntu 24.04, you can run Cortex.\n\nTested on:\n• ThinkPad X1 Carbon (no GPU, cloud mode)\n• Dell XPS 15 (GTX 1650, hybrid mode)\n• System76 Thelio (RTX 4090, local mode)\n• Framework Laptop (integrated graphics, cloud mode)\n\nNo gaming GPU needed unless you want local mode."
        },
        {
          q: "Which Linux distributions are supported?",
          a: "Currently: Ubuntu 24.04 LTS (official support)\n\nComing soon:\n• Debian 12\n• Fedora 40\n• Arch Linux (community port)\n\nWe started with Ubuntu because it has the largest user base and best package ecosystem."
        },
        {
          q: "Do I need a GPU?",
          a: "Not required! GPU is optional and only needed for:\n\n• Running AI locally (privacy/air-gapped environments)\n• Heavy ML workloads you're installing\n\nThe AI assistance itself works fine in cloud mode on any machine."
        }
      ]
    },
    {
      category: "Use Cases",
      icon: Target,
      questions: [
        {
          q: "What can Cortex actually do?",
          a: "Real examples from beta testers:\n\n\"Install Oracle 23 AI optimized for my GPU\"\n→ Detects hardware, installs CUDA 12.3, Oracle 23c, configures for RTX 4090, runs tests\n\n\"Set up a Python data science environment\"\n→ Installs Python 3.11, Jupyter, NumPy, Pandas, Matplotlib, TensorFlow (GPU), all compatible versions\n\n\"Fix my broken NVIDIA driver\"\n→ Analyzes error logs, identifies conflict, suggests fix, rolls back if needed\n\n\"Install Kubernetes cluster for testing\"\n→ Sets up minikube with correct versions, configures networking, provides sample deployment\n\nAnything you'd normally spend hours on Stack Overflow for."
        },
        {
          q: "Can you show me real examples?",
          a: "Written examples:\n\nEXAMPLE 1: Data Scientist Installing TensorFlow\nYou: \"I need TensorFlow for GPU training\"\nCortex:\n🧠 Detected: NVIDIA RTX 3080 (10GB VRAM)\n   Installing: CUDA 11.8 (compatible with RTX 3080)\n   Installing: cuDNN 8.6\n   Installing: TensorFlow-GPU 2.15.0\n   Testing: GPU acceleration... ✅ Working\n   ✅ Ready! Try: python -c \"import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))\"\n\nEXAMPLE 2: DevOps Setting Up PostgreSQL\nYou: \"Install PostgreSQL production-ready with replication\"\nCortex:\n🧠 Planning installation...\n   Installing: PostgreSQL 15\n   Configuring: Max connections (300), shared buffers (4GB)\n   Setting up: Streaming replication (1 primary, 2 replicas)\n   Securing: Password policy, SSL certificates\n   Testing: Connection pooling, backup script\n   ✅ PostgreSQL ready at localhost:5432\n\nTime saved: Traditional setup = 3-4 hours. Cortex = 6 minutes."
        },
        {
          q: "How much time does it save?",
          a: "Based on beta testing:\n\nAverage time savings by task:\n• CUDA installation: 5h 30m → 4 minutes (98% faster)\n• Oracle DB setup: 4h 15m → 5 minutes (98% faster)\n• Python ML environment: 2h 45m → 3 minutes (98% faster)\n• Kubernetes cluster: 6h 20m → 8 minutes (98% faster)\n\nAverage developer saves: 12-15 hours per week on environment setup and troubleshooting.\n\nROI: If you value your time at $50/hour, Cortex saves you $600-750/week."
        },
        {
          q: "What problems does it solve?",
          a: "The top 5 Linux frustrations:\n\n1. DEPENDENCY HELL ✅\n   Problem: Package A needs version 1, Package B needs version 2\n   Cortex: Resolves automatically or suggests containerization\n\n2. HARDWARE INCOMPATIBILITY ✅\n   Problem: Installed software, but GPU not working\n   Cortex: Detects hardware first, installs compatible drivers\n\n3. \"WORKS ON MY MACHINE\" ✅\n   Problem: Different environments = different results\n   Cortex: Reproducible installations with locked versions\n\n4. DOCUMENTATION OVERLOAD ✅\n   Problem: 50-page install guides for simple tools\n   Cortex: Natural language, no reading required\n\n5. TIME WASTE ✅\n   Problem: 30% of dev time on environment setup\n   Cortex: 98% time reduction on average"
        }
      ]
    },
    {
      category: "Getting Started",
      icon: Rocket,
      questions: [
        {
          q: "How do I install Cortex?",
          a: "Installation guide:\n\nSTEP 1: Install on Ubuntu 24.04\ncurl -s https://install.cortexlinux.com | bash\n\nSTEP 2: Configure AI provider\ncortex config set-api-key [your-claude-api-key]\n# Or use our managed cloud (free tier available)\n\nSTEP 3: Try your first command\ncortex install --help\n\nFull documentation: https://docs.cortexlinux.com/getting-started"
        },
        {
          q: "Is it ready to use now?",
          a: "Current status: Public Beta (November 2025)\n\nWhat works:\n✅ Core AI capabilities\n✅ Package installation\n✅ Hardware detection\n✅ Basic dependency resolution\n\nWhat's coming:\n🟡 Advanced error recovery\n🟡 Multi-step orchestration\n🟡 Configuration file generation\n\nReady for: Testing, non-critical environments, learning\nNot yet for: Production servers (use Enterprise beta)"
        },
        {
          q: "When will it be production-ready?",
          a: "Roadmap:\n\nQ4 2025 (Now): Public Beta\n• Core features working\n• Community testing\n• Bug fixes and polish\n\nQ1 2026: Production v1.0\n• Enterprise features complete\n• Security audit completed\n• SLA-backed support available\n\nQ2 2026: Expansion\n• Debian, Fedora support\n• Additional AI models\n• Plugin ecosystem\n\nJoin beta now to influence features!"
        },
        {
          q: "How can I contribute?",
          a: "We welcome contributors! Options:\n\n1. CODE CONTRIBUTIONS\n   • Browse issues: github.com/cortexlinux/cortex/issues\n   • Bounties: $25-500 per merged PR\n   • Filter by: \"priority: critical\" for MVP blockers\n\n2. TESTING & FEEDBACK\n   • Try beta, report bugs\n   • Test bounties: $50-75\n   • Help improve documentation\n\n3. COMMUNITY SUPPORT\n   • Answer questions on Discord\n   • Write tutorials and guides\n   • Share your success stories\n\nFirst PR merged? Get $50 bonus from Instagram recruitment."
        }
      ]
    },
    {
      category: "Troubleshooting",
      icon: Wrench,
      questions: [
        {
          q: "What if something goes wrong?",
          a: "Built-in recovery:\n\n1. INSTANT ROLLBACK\n   cortex rollback\n   → Undoes last change in seconds\n\n2. CHECK STATUS\n   cortex status\n   → Shows what Cortex did, current system state\n\n3. VIEW LOGS\n   cortex logs\n   → Full audit trail of all commands\n\n4. RESET TO CLEAN STATE\n   cortex reset\n   → Removes all Cortex changes, back to fresh Ubuntu\n\nSupport: Discord community or enterprise@cortexlinux.com"
        },
        {
          q: "Can I uninstall Cortex?",
          a: "Yes, completely:\n\ncortex uninstall --full\n\nThis removes:\n✅ All Cortex components\n✅ AI configuration\n✅ Audit logs (optional: keep for compliance)\n\nKeeps:\n✅ Software installed via Cortex (your tools stay)\n✅ Your data and configurations\n\nLike it never existed (but your installed software remains)."
        },
        {
          q: "Where can I get help?",
          a: "Multiple support channels:\n\nFREE (Community):\n• Discord: discord.gg/uCqHvxjU83\n• GitHub Issues: github.com/cortexlinux/cortex/issues\n• Documentation: docs.cortexlinux.com\n• FAQ: This page!\n\nPAID (Enterprise):\n• Email: enterprise@cortexlinux.com\n• 24/7 phone support\n• Dedicated Slack channel\n• Custom integration help\n\nAverage response times:\n• Discord: 2-4 hours\n• GitHub: 24 hours\n• Enterprise: 15 minutes (SLA)"
        },
        {
          q: "Is my data private?",
          a: "Privacy commitment:\n\nWHAT WE COLLECT:\n• Command prompts you give Cortex\n• System metadata (OS version, hardware)\n• Usage analytics (which features you use)\n\nWHAT WE DON'T COLLECT:\n❌ Your actual data or files\n❌ Passwords or credentials\n❌ Source code or proprietary information\n\nYOUR CHOICES:\n• Cloud mode: Prompts sent to AI API (encrypted)\n• Local mode: Nothing leaves your machine\n• Opt-out: Disable analytics anytime"
        }
      ]
    }
  ];

  const filteredFAQ = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqData;
    }

    const lowerSearch = searchTerm.toLowerCase();
    
    return faqData.map(category => ({
      ...category,
      questions: category.questions.filter(q => 
        q.q.toLowerCase().includes(lowerSearch) || 
        q.a.toLowerCase().includes(lowerSearch)
      )
    })).filter(category => category.questions.length > 0);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-gray-300 via-gray-200 to-blue-400 bg-clip-text text-transparent">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Everything you need to know about Cortex Linux
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-input"
              className="pl-10 h-12 bg-white/5 border-white/10 backdrop-blur-xl text-white placeholder:text-gray-500 focus-visible:ring-blue-400"
            />
          </div>
        </div>

        <div className="space-y-8">
          {filteredFAQ.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              data-testid={`category-${categoryIndex}`}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {category.category}
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((question, questionIndex) => {
                  const globalQuestionIndex = faqData
                    .slice(0, categoryIndex)
                    .reduce((acc, cat) => acc + cat.questions.length, 0) + questionIndex;
                  
                  return (
                    <AccordionItem
                      key={questionIndex}
                      value={`question-${globalQuestionIndex}`}
                      data-testid={`question-${globalQuestionIndex}`}
                      className="border-white/10"
                    >
                      <AccordionTrigger className="text-left hover:no-underline hover:text-blue-400 transition-colors">
                        <span className="text-lg font-semibold pr-4">
                          {question.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                          {question.a}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          ))}

          {filteredFAQ.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No questions found matching "{searchTerm}"
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try a different search term or browse all categories above
              </p>
            </div>
          )}
        </div>

        <div className="mt-16 text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
          <p className="text-gray-400 mb-6">
            Can't find your answer? We're here to help:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://discord.gg/uCqHvxjU83"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              data-testid="link-discord"
            >
              Ask on Discord
            </a>
            <a
              href="mailto:hello@cortexlinux.com"
              className="px-6 py-3 border-2 border-blue-400 hover:bg-blue-400/10 text-white font-semibold rounded-lg transition-colors"
              data-testid="link-email"
            >
              Email Us
            </a>
            <a
              href="https://github.com/cortexlinux/cortex/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-blue-400 hover:bg-blue-400/10 text-white font-semibold rounded-lg transition-colors"
              data-testid="link-github"
            >
              Open GitHub Issue
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
