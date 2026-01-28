import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Code2,
  Terminal,
  Brain,
  Megaphone,
  Lightbulb,
  TrendingUp,
  Handshake,
  Star,
  Shield,
  ExternalLink,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Github,
  ArrowRight,
  Briefcase,
  Rocket,
} from "lucide-react";
import Footer from "@/components/Footer";

interface JobPosting {
  id: string;
  title: string;
  emoji: string;
  category: "engineering" | "product" | "business" | "community";
  type: "full-time" | "contract" | "bounty" | "advisory" | "contributor";
  location: "remote";
  compensation: string;
  description: string;
  requirements?: string[];
  icon: typeof Code2;
}

const jobPostings: JobPosting[] = [
  {
    id: "senior-python-dev",
    title: "Senior Python Developer",
    emoji: "🐍",
    category: "engineering",
    type: "full-time",
    location: "remote",
    compensation: "Bounties now + salary at funding",
    description:
      "Building an AI-powered package manager for Debian/Ubuntu. Need senior Python devs who've worked with apt, dpkg, or Linux system tooling.",
    requirements: [
      "Python 3.11+",
      "LangChain",
      "SQLite",
      "Firejail",
      "Linux system tooling experience",
    ],
    icon: Code2,
  },
  {
    id: "linux-systems-expert",
    title: "Linux Systems Expert",
    emoji: "🐧",
    category: "engineering",
    type: "advisory",
    location: "remote",
    compensation: "Equity upside in pre-seed startup",
    description:
      "Deep knowledge of apt, systemd, kernel modules, or package management? We're building AI tooling for Linux and need collaborators who know the internals. Not a job post — looking for technical advisors and contributors.",
    requirements: [
      "apt/dpkg expertise",
      "systemd",
      "Kernel modules",
      "Package management systems",
    ],
    icon: Terminal,
  },
  {
    id: "ai-ml-engineer",
    title: "AI/ML Engineer",
    emoji: "🤖",
    category: "engineering",
    type: "bounty",
    location: "remote",
    compensation: "Bounties now + salary at funding",
    description:
      "Working on semantic command translation, caching, and local model fallback (Ollama). Need engineers experienced with LLM integration and prompt engineering.",
    requirements: [
      "LangChain / LlamaIndex",
      "Prompt engineering",
      "Semantic caching (GPTCache)",
      "Local LLM deployment (Ollama)",
    ],
    icon: Brain,
  },
  {
    id: "devrel",
    title: "DevRel / Developer Advocate",
    emoji: "📣",
    category: "community",
    type: "contract",
    location: "remote",
    compensation: "Flexible arrangement",
    description:
      'Can you explain complex tech simply? Create demos that make people say "holy shit"? We need someone to build community around an AI package manager.',
    requirements: [
      "Documentation",
      "Tutorials",
      "Demo videos",
      "Community engagement",
    ],
    icon: Megaphone,
  },
  {
    id: "technical-advisor",
    title: "Technical Advisor / Consultant",
    emoji: "💡",
    category: "business",
    type: "advisory",
    location: "remote",
    compensation: "Advisory equity",
    description:
      "Pre-seed startup building AI-native Linux tooling. Looking for advisors with backgrounds in enterprise Linux, package management, AI/ML infrastructure, or open source commercialization.",
    requirements: [
      "Enterprise Linux (Red Hat, Canonical, SUSE alumni)",
      "Package management systems",
      "AI/ML infrastructure",
      "Developer tools commercialization",
    ],
    icon: Lightbulb,
  },
  {
    id: "marketing-lead",
    title: "Marketing Lead",
    emoji: "📈",
    category: "business",
    type: "contract",
    location: "remote",
    compensation: "Per project, salary at funding",
    description:
      'Help position "the AI layer for Linux" in a $50B+ market. Need someone who understands developer marketing, open source dynamics, and B2B enterprise sales cycles.',
    requirements: [
      "Dev tools marketing",
      "Technical content",
      "Community growth",
      "B2B enterprise experience",
    ],
    icon: TrendingUp,
  },
  {
    id: "business-development",
    title: "Business Development / Channel Sales",
    emoji: "🤝",
    category: "business",
    type: "contract",
    location: "remote",
    compensation: "Commission-based",
    description:
      "Building partnerships with MSPs, cloud providers, and enterprise IT. Need someone who can open doors and close deals in the Linux/infrastructure space.",
    requirements: [
      "Existing relationships with IT decision-makers",
      "Understanding of open-core business models",
      "MSP/cloud provider network",
    ],
    icon: Handshake,
  },
  {
    id: "contributors",
    title: "Community Contributors",
    emoji: "⭐",
    category: "community",
    type: "contributor",
    location: "remote",
    compensation: "$25-175 bounties, 2x bonus at funding",
    description:
      "CX Linux translates natural language to Linux commands. We pay bounties for merged PRs, with 2x bonus at funding. Good first issues available.",
    requirements: ["Python", "Documentation", "Testing", "Security"],
    icon: Star,
  },
  {
    id: "security-engineer",
    title: "Security Engineer",
    emoji: "🔐",
    category: "engineering",
    type: "bounty",
    location: "remote",
    compensation: "Bounty-based, matched at funding",
    description:
      "Implementing Firejail sandboxing, AppArmor policies, and secure command execution for an AI-powered Linux tool. Need someone paranoid about security.",
    requirements: [
      "Firejail sandboxing",
      "AppArmor policies",
      "Secure command execution",
      "Linux security hardening",
    ],
    icon: Shield,
  },
];

const categoryLabels = {
  engineering: "Engineering",
  product: "Product",
  business: "Business",
  community: "Community",
};

const typeLabels = {
  "full-time": "Full-time",
  contract: "Contract",
  bounty: "Bounty",
  advisory: "Advisory",
  contributor: "Contributor",
};

const typeColors = {
  "full-time": "bg-green-500/20 text-green-400 border-green-500/30",
  contract: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  bounty: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advisory: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  contributor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function CareersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredJobs =
    selectedCategory === "all"
      ? jobPostings
      : jobPostings.filter((job) => job.category === selectedCategory);

  const categories = ["all", "engineering", "business", "community"];

  return (
    <div id="careers-page-container" className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section id="careers-hero-section" className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-violet-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
              JOIN THE TEAM
            </span>
            <h1 id="careers-hero-title" className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-gray-300 via-gray-200 to-violet-400 bg-clip-text text-transparent">
                Build the Future of
              </span>{" "}
              <span className="text-violet-400">Linux</span>
            </h1>
            <p id="careers-hero-subtitle" className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              We're building the AI layer for Linux. Join a pre-seed startup
              tackling a $50B+ market with natural language system administration.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm text-gray-500">Remote</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">Pre-Seed</div>
                <div className="text-sm text-gray-500">Stage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">BSL</div>
                <div className="text-sm text-gray-500">Licensed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">$50B+</div>
                <div className="text-sm text-gray-500">Market</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://discord.gg/cxlinux"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[#5865F2] text-white font-semibold rounded-lg hover:bg-[#4752C4] transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Join Discord
              </a>
              <a
                href="https://github.com/cxlinux-ai/cx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/5 transition-all"
              >
                <Github className="w-5 h-5" />
                View GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join Section */}
      <section id="careers-why-section" className="py-16 px-4 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why CX Linux?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We're not just building another tool — we're creating the AI-native
              interface for Linux that will change how millions of developers and
              sysadmins work.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <Rocket className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ground Floor Opportunity</h3>
              <p className="text-gray-400 text-sm">
                Pre-seed startup with massive market potential. Early team members
                get significant equity and shape the product direction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <Users className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Flexible Arrangements</h3>
              <p className="text-gray-400 text-sm">
                100% remote. Bounty-based, contract, advisory, or full-time once
                funded. Work on your terms while building something meaningful.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <Star className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Source Available</h3>
              <p className="text-gray-400 text-sm">
                BSL licensed with Apache 2.0 conversion. Your contributions are visible,
                credited, and help shape the future of Linux tooling.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section id="careers-listings-section" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 id="careers-listings-title" className="text-3xl sm:text-4xl font-bold mb-4">
              Open Positions
            </h2>
            <p className="text-gray-400 mb-8">
              Find the role that fits your skills and interests
            </p>

            {/* Category Filter */}
            <div id="careers-filter-container" className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  id={`careers-filter-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-violet-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {cat === "all" ? "All Roles" : categoryLabels[cat as keyof typeof categoryLabels]}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Job Cards */}
          <div id="careers-jobs-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                id={`careers-job-card-${job.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-violet-500/50 hover:bg-white/[0.07] transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{job.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-violet-400 transition-colors">
                        {job.title}
                      </h3>
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded border ${
                          typeColors[job.type]
                        }`}
                      >
                        {typeLabels[job.type]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Requirements */}
                {job.requirements && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {job.requirements.slice(0, 4).map((req, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-white/5 rounded text-gray-300"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 4 && (
                        <span className="text-xs px-2 py-1 text-gray-500">
                          +{job.requirements.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Remote
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {job.compensation}
                  </span>
                </div>

                {/* CTA */}
                <a
                  href="https://discord.gg/cxlinux"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-violet-500/20 text-violet-400 rounded-lg font-medium hover:bg-violet-500/30 transition-all"
                >
                  Apply via Discord
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section id="careers-apply-section" className="py-16 px-4 bg-gradient-to-b from-transparent to-violet-950/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-2xl p-8 md:p-12"
          >
            <h2 id="careers-apply-title" className="text-2xl font-bold mb-6 text-center">
              How to Apply
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-violet-400">1</span>
                </div>
                <h3 className="font-semibold mb-2">Join Discord</h3>
                <p className="text-sm text-gray-400">
                  Introduce yourself in #introductions
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-violet-400">2</span>
                </div>
                <h3 className="font-semibold mb-2">Start Contributing</h3>
                <p className="text-sm text-gray-400">
                  Pick a good first issue or share your ideas
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-violet-400">3</span>
                </div>
                <h3 className="font-semibold mb-2">Get Paid</h3>
                <p className="text-sm text-gray-400">
                  Earn bounties for merged PRs
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://discord.gg/cxlinux"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-3 bg-[#5865F2] text-white font-semibold rounded-lg hover:bg-[#4752C4] transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Join Discord
              </a>
              <a
                href="https://github.com/cxlinux-ai/cx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-3 border border-violet-400 text-violet-400 font-semibold rounded-lg hover:bg-violet-400/10 transition-all"
              >
                <Github className="w-5 h-5" />
                View Good First Issues
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bounty Info */}
      <section id="careers-bounty-section" className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-4">Bounty Program</h2>
            <p className="text-gray-400 mb-8">
              Can't commit full-time? Earn money for individual contributions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">$25</div>
                <div className="text-sm text-gray-400">Documentation</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">$50</div>
                <div className="text-sm text-gray-400">Bug Fixes</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-violet-400">$100</div>
                <div className="text-sm text-gray-400">Features</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-400">$175</div>
                <div className="text-sm text-gray-400">Security</div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              All bounties receive 2x bonus match at funding
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
