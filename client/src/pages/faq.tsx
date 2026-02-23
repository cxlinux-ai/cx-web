import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Settings, DollarSign, Cpu, Target, Rocket, Wrench, Search } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

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
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.faq);
    return cleanup;
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  const faqData: FAQCategory[] = [
    {
      category: "Security & Safety",
      icon: Shield,
      questions: [
        {
          q: "Is CX safe? Won't it break my system?",
          a: "CX is designed with security as the #1 priority. Here's how we protect your system:\n\n• Sandboxed Execution: Every command runs in an isolated Firejail container with no direct kernel access\n• Preview Before Execute: You see and approve every command before it runs\n• Instant Rollback: We create snapshots before major changes. Undo anything in seconds.\n• Command Validation: Dangerous commands (like rm -rf /) are blocked automatically\n• Audit Logging: Every action is logged for complete transparency\n\nThink of it like having a professional system administrator who shows you their plan before doing anything."
        },
        {
          q: "How do you prevent dangerous commands like 'rm -rf /'?",
          a: "Multiple layers of protection:\n\n1. Blacklist: Destructive commands are blocked by default\n2. Dry-run mode: Test changes in simulation first\n3. User confirmation: System-wide changes require your explicit approval\n4. Severity scoring: AI classifies command risk level (safe/caution/danger)\n5. Rollback ready: Even approved commands can be undone\n\nYou can review our security architecture on GitHub."
        },
        {
          q: "What if the AI hallucinates or makes mistakes?",
          a: "We've built multiple safeguards:\n\n• Command Validation: Every AI-generated command is validated against known patterns\n• Testing First: Commands are tested in sandbox before running on your system\n• Human-in-the-loop: You approve all critical operations\n• Learning System: When errors occur, CX learns and never repeats them\n• Confidence Scoring: Low-confidence suggestions require extra confirmation\n\nThe AI suggests, you decide. Always."
        },
        {
          q: "Does CX have root access to my system?",
          a: "No. CX runs with the same permissions as your user account. When root/sudo is needed:\n\n1. CX asks for your sudo password (just like any other program)\n2. Shows you exactly what will run with elevated permissions\n3. Waits for your approval\n4. You can always say no\n\nCX never stores your password or runs elevated commands without permission."
        },
        {
          q: "Can I review commands before they execute?",
          a: "Yes, always. The workflow is:\n\n1. You: \"Install Oracle optimized for my GPU\"\n2. CX: Analyzes and shows you the plan:\n   - Will install: CUDA 12.3, Oracle 23c, dependencies X, Y, Z\n   - Will modify: /etc/oracle/config, ~/.bashrc\n   - Estimated time: 4 minutes\n3. You: Approve or reject\n4. CX: Executes only after approval\n\nYou can also enable \"explain mode\" where CX describes what each command does in plain English."
        }
      ]
    },
    {
      category: "How It Works",
      icon: Settings,
      questions: [
        {
          q: "How is CX different from Warp/Gemini CLI/Claude Code?",
          a: "Great question! Here's the key difference:\n\nTERMINAL WRAPPERS (Warp, Gemini CLI):\n• Helps you write individual commands\n• You still need to know what to do\n• No system-wide awareness\n• Single command at a time\n\nCODE EDITORS (Claude Code):\n• Focused on writing code\n• Not designed for system administration\n• Doesn't handle OS-level operations\n\nCX (OS-LEVEL AI LAYER):\n• Executes ANY task you can do on Linux\n• Multi-step workflow orchestration\n• Understands system context and dependencies\n• Hardware-aware optimization\n• Full system administration capabilities\n• Package management is just ONE of unlimited capabilities\n\nExample: \"Set up a secure web server with SSL, monitoring, and automated backups\"\n• Terminal tools: You manually run 50+ commands over hours\n• CX: Understands your intent → Plans multi-step workflow → Installs nginx, certbot, prometheus → Configures firewall → Sets up cron jobs → Verifies everything works"
        },
        {
          q: "What is CX as an 'AI Layer'?",
          a: "CX is an intelligent layer that sits between you and Linux, translating your intent into execution:\n\nTraditional Linux: You → Terminal → Commands → OS\nCX: You → Natural Language → AI Layer → Any Linux Operation → OS\n\nThe AI Layer can execute ANY task on Linux:\n• System administration & configuration\n• Automation scripts & cron jobs\n• Security auditing & hardening\n• Performance tuning & optimization\n• Log analysis & troubleshooting\n• Infrastructure management\n• Development environment setup\n• Data processing pipelines\n• Network configuration\n• And literally anything else Linux can do\n\nPackage management is just one of many capabilities. CX doesn't replace Linux—it enhances it with intelligence."
        },
        {
          q: "Does CX replace Linux or wrap it?",
          a: "CX wraps Ubuntu 24.04 LTS as an intelligent AI Layer. It's built on standard Linux with unlimited capabilities on top.\n\nWhat this means:\n• All your normal Linux tools still work (apt, vim, git, etc.)\n• You can drop to terminal anytime\n• Existing scripts and tools are compatible\n• You choose when to use CX vs manual commands\n• CX can do ANYTHING you could do manually—just faster\n\nThink of it as having a Linux expert available 24/7 who can execute any task."
        },
        {
          q: "Do I need to know Linux to use CX?",
          a: "No, that's the point! CX is designed for:\n\n• Data scientists who need tools but don't want to become Linux experts\n• Developers who want to focus on code, not configuration\n• DevOps engineers who want to automate complex workflows\n• Sysadmins who want an intelligent assistant for any task\n• Students learning programming without OS barriers\n• Anyone who wants to accomplish tasks without memorizing commands\n\nYou can learn Linux through CX. It explains what it's doing and why."
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
          q: "Is CX free or paid?",
          a: "Both!\n\nCORE EDITION: Free tier with essential features\n• Core AI capabilities\n• Basic features\n• Perfect for getting started\n\nPAID TIERS: Core+, Pro, and Enterprise for growing needs\n• Advanced features\n• Priority support (24/7)\n• Compliance & audit features\n• Custom integrations\n• SLA guarantees\n\nFlexible pricing that scales with your needs."
        },
        {
          q: "What's the business model?",
          a: "Tiered subscription model:\n\nRevenue sources:\n1. Subscription licenses (individuals and companies)\n2. Professional services (custom integrations, training)\n3. Cloud hosting (optional managed CX instances)\n\nFree tier: Get started at no cost\nPaid tiers: Unlock advanced features and support"
        },
        {
          q: "Who is CX for?",
          a: "Primary users:\n\n• Developers: Focus on code, not system configuration\n• DevOps Engineers: Automate complex infrastructure tasks\n• Sysadmins: Intelligent assistant for any Linux operation\n• Data Scientists: Eliminate environment setup friction\n• Security Teams: Automated auditing and hardening\n• Students: Learn without OS complexity barriers\n• Enterprises: Compliance + standardized Linux operations\n\nIf you've ever wished you had a Linux expert available 24/7 to handle any task, CX is that expert."
        },
        {
          q: "Can I use it for commercial projects?",
          a: "Yes! All paid tiers are fully commercial-ready:\n\n• Core+, Pro, and Enterprise tiers available\n• Commercial licensing included\n• Enterprise features for compliance\n• Priority support options\n\nChoose the tier that fits your commercial needs."
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
          a: "Yes! If you can run Ubuntu 24.04, you can run CX.\n\nTested on:\n• ThinkPad X1 Carbon (no GPU, cloud mode)\n• Dell XPS 15 (GTX 1650, hybrid mode)\n• System76 Thelio (RTX 4090, local mode)\n• Framework Laptop (integrated graphics, cloud mode)\n\nNo gaming GPU needed unless you want local mode."
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
          q: "What can CX actually do?",
          a: "CX can execute ANY task on Linux. Real examples from beta testers:\n\nINFRASTRUCTURE & AUTOMATION:\n\"Set up automated backups to S3 with encryption\"\n→ Installs rclone, configures encryption, sets up cron schedule, tests restore\n\n\"Deploy a load-balanced web application\"\n→ Configures nginx, sets up upstream servers, SSL termination, health checks\n\nSECURITY & AUDITING:\n\"Audit my system for security vulnerabilities\"\n→ Runs Lynis, checks open ports, reviews user permissions, generates report\n\n\"Harden this server for production\"\n→ Configures firewall, disables unnecessary services, sets up fail2ban, SSH hardening\n\nPERFORMANCE & MONITORING:\n\"Analyze why my server is slow\"\n→ Checks CPU, memory, disk I/O, identifies bottlenecks, suggests optimizations\n\n\"Set up monitoring with alerts\"\n→ Installs Prometheus + Grafana, configures dashboards, sets up alerting\n\nDEVELOPMENT WORKFLOWS:\n\"Create a CI/CD pipeline for my project\"\n→ Sets up GitHub Actions, Docker builds, automated testing, deployment scripts\n\n\"Set up a complete data science environment\"\n→ Installs Python, Jupyter, ML libraries, configures GPU acceleration\n\nPackage management is just one of unlimited capabilities."
        },
        {
          q: "Can you show me real examples?",
          a: "Written examples across different use cases:\n\nEXAMPLE 1: Security Auditing\nYou: \"Check if my server is secure\"\nCX:\n🧠 Running security audit...\n   Scanning: Open ports (found 22, 80, 443 - expected)\n   Checking: SSH configuration (password auth disabled ✅)\n   Reviewing: User accounts (no suspicious accounts)\n   Testing: Firewall rules (properly configured)\n   Analyzing: System logs (no intrusion attempts)\n   ⚠️ Found: 3 packages need security updates\n   ✅ Audit complete. Running: sudo apt upgrade for security patches\n\nEXAMPLE 2: Performance Optimization\nYou: \"My database queries are slow\"\nCX:\n🧠 Analyzing PostgreSQL performance...\n   Checking: Current connections (45/100)\n   Analyzing: Slow query log (found 3 problematic queries)\n   Reviewing: Index usage (2 missing indexes identified)\n   Tuning: shared_buffers (increased to 4GB)\n   Creating: Missing indexes on users.email, orders.created_at\n   ✅ Performance improved by ~60%. Monitoring enabled.\n\nEXAMPLE 3: Automation Script\nYou: \"Automate log rotation and cleanup for my app\"\nCX:\n🧠 Setting up log management...\n   Creating: logrotate config for /var/log/myapp/\n   Configuring: Daily rotation, 7 days retention, compression\n   Setting up: Disk usage monitoring with alerts\n   Testing: Rotation works correctly\n   ✅ Automated log management active. Cron job installed."
        },
        {
          q: "How much time does it save?",
          a: "Based on beta testing across all task types:\n\nAverage time savings:\n• Security audit: 4h manual → 5 minutes (98% faster)\n• Server hardening: 6h manual → 8 minutes (98% faster)\n• CI/CD setup: 8h manual → 12 minutes (97% faster)\n• Database optimization: 3h manual → 6 minutes (97% faster)\n• Monitoring stack: 5h manual → 10 minutes (97% faster)\n• Environment setup: 3h manual → 4 minutes (98% faster)\n\nAverage developer/sysadmin saves: 15-20 hours per week on system tasks.\n\nROI: If you value your time at $50/hour, CX saves you $750-1000/week on any Linux operation."
        },
        {
          q: "What problems does it solve?",
          a: "CX solves ANY Linux frustration:\n\n1. COMPLEXITY ✅\n   Problem: Multi-step tasks require expertise\n   CX: Handles complex workflows with simple requests\n\n2. KNOWLEDGE GAP ✅\n   Problem: Don't know which tools/commands to use\n   CX: Knows best practices for any task\n\n3. DEPENDENCY HELL ✅\n   Problem: Package conflicts and version mismatches\n   CX: Resolves automatically or suggests solutions\n\n4. SECURITY BLIND SPOTS ✅\n   Problem: Don't know what to check or harden\n   CX: Comprehensive auditing and hardening\n\n5. PERFORMANCE MYSTERIES ✅\n   Problem: System is slow but don't know why\n   CX: Analyzes, identifies bottlenecks, optimizes\n\n6. DOCUMENTATION OVERLOAD ✅\n   Problem: Hours reading docs for simple tasks\n   CX: Natural language, instant execution\n\n7. AUTOMATION BARRIERS ✅\n   Problem: Writing scripts takes time and expertise\n   CX: Creates and deploys automation instantly"
        }
      ]
    },
    {
      category: "Getting Started",
      icon: Rocket,
      questions: [
        {
          q: "How do I install CX?",
          a: "Installation guide:\n\nSTEP 1: Install on Ubuntu 24.04\ncurl -s https://install.cxlinux.com | bash\n\nSTEP 2: Configure AI provider\ncx config set-api-key [your-claude-api-key]\n# Or use our managed cloud (free tier available)\n\nSTEP 3: Try your first command\ncx install --help\n\nFull documentation: https://docs.cxlinux.com/getting-started"
        },
        {
          q: "Is it ready to use now?",
          a: "Current status: Public Beta (February 2026)\n\nWhat works:\n✅ Core AI capabilities\n✅ Package installation\n✅ Hardware detection\n✅ Basic dependency resolution\n\nWhat's coming:\n🟡 Advanced error recovery\n🟡 Multi-step orchestration\n🟡 Configuration file generation\n\nReady for: Testing, non-critical environments, learning\nNot yet for: Production servers (use Enterprise beta)"
        },
        {
          q: "When will it be production-ready?",
          a: "Roadmap:\n\nQ1 2026 (Now): Public Beta\n• Core features working\n• Community testing\n• Bug fixes and polish\n\nQ2 2026: Production v1.0\n• Enterprise features complete\n• Security audit completed\n• SLA-backed support available\n\nQ3 2026: Expansion\n• Debian, Fedora support\n• Additional AI models\n• Plugin ecosystem\n\nJoin beta now to influence features!"
        },
        {
          q: "How can I contribute?",
          a: "We welcome contributors! Options:\n\n1. CODE CONTRIBUTIONS\n   • Browse issues: github.com/cxlinux-ai/cx-core/issues\n   • Bounties: $25-500 per merged PR\n   • Filter by: \"priority: critical\" for MVP blockers\n\n2. TESTING & FEEDBACK\n   • Try beta, report bugs\n   • Test bounties: $50-75\n   • Help improve documentation\n\n3. COMMUNITY SUPPORT\n   • Answer questions on Discord\n   • Write tutorials and guides\n   • Share your success stories\n\nFirst PR merged? Get $50 bonus from Instagram recruitment."
        }
      ]
    },
    {
      category: "Troubleshooting",
      icon: Wrench,
      questions: [
        {
          q: "What if something goes wrong?",
          a: "Built-in recovery:\n\n1. INSTANT ROLLBACK\n   cx rollback\n   → Undoes last change in seconds\n\n2. CHECK STATUS\n   cx status\n   → Shows what CX did, current system state\n\n3. VIEW LOGS\n   cx logs\n   → Full audit trail of all commands\n\n4. RESET TO CLEAN STATE\n   cx reset\n   → Removes all CX changes, back to fresh Ubuntu\n\nSupport: Discord community or enterprise@cxlinux.com"
        },
        {
          q: "Can I uninstall CX?",
          a: "Yes, completely:\n\ncx uninstall --full\n\nThis removes:\n✅ All CX components\n✅ AI configuration\n✅ Audit logs (optional: keep for compliance)\n\nKeeps:\n✅ Software installed via CX (your tools stay)\n✅ Your data and configurations\n\nLike it never existed (but your installed software remains)."
        },
        {
          q: "Where can I get help?",
          a: "Multiple support channels:\n\nFREE (Community):\n• Discord: discord.gg/cxlinux\n• GitHub Issues: github.com/cxlinux-ai/cx-core/issues\n• Documentation: docs.cxlinux.com\n• FAQ: This page!\n\nPAID (Enterprise):\n• Email: enterprise@cxlinux.com\n• 24/7 phone support\n• Dedicated Slack channel\n• Custom integration help\n\nAverage response times:\n• Discord: 2-4 hours\n• GitHub: 24 hours\n• Enterprise: 15 minutes (SLA)"
        },
        {
          q: "Is my data private?",
          a: "Privacy commitment:\n\nWHAT WE COLLECT:\n• Command prompts you give CX\n• System metadata (OS version, hardware)\n• Usage analytics (which features you use)\n\nWHAT WE DON'T COLLECT:\n❌ Your actual data or files\n❌ Passwords or credentials\n❌ Source code or proprietary information\n\nYOUR CHOICES:\n• Cloud mode: Prompts sent to AI API (encrypted)\n• Local mode: Nothing leaves your machine\n• Opt-out: Disable analytics anytime"
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
      <section aria-labelledby="faq-heading" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 id="faq-heading" className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-gray-300 via-gray-200 to-blue-400 bg-clip-text text-transparent">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Everything you need to know about CX Linux
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
                  <category.icon className="h-6 w-6 text-blue-300" />
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
                      <AccordionTrigger className="text-left hover:no-underline hover:text-blue-300 transition-colors">
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
              href="https://discord.gg/cxlinux"
              target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              data-testid="link-discord"
            >
              Ask on Discord
            </a>
            <a
              href="mailto:hello@cxlinux.com"
              className="px-6 py-3 border-2 border-blue-400 hover:bg-blue-400/10 text-white font-semibold rounded-lg transition-colors"
              data-testid="link-email"
            >
              Email Us
            </a>
            <a
              href="https://github.com/cxlinux-ai/cx-core/issues"
              target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-blue-400 hover:bg-blue-400/10 text-white font-semibold rounded-lg transition-colors"
              data-testid="link-github"
            >
              Open GitHub Issue
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
