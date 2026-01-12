import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Star,
  Users,
  Zap,
  Trophy,
  Code2,
  GitPullRequest,
  Brain,
  Terminal,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Lightbulb,
  Shield,
  Gift,
  BookOpen,
  FileText,
  Layers,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

const GITHUB_URL = "https://github.com/cortexlinux/cortex";
const GITHUB_ISSUES_URL = "https://github.com/cortexlinux/cortex/issues";
const HACKATHON_DATE = new Date("2026-02-17T00:00:00");

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = HACKATHON_DATE.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 sm:p-4 min-w-[60px] sm:min-w-[80px]">
            <span className="text-2xl sm:text-4xl font-bold text-brand-blue font-mono">
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-400 mt-2 block capitalize">{unit}</span>
        </div>
      ))}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-xl"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
        data-testid={`faq-toggle-${question.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
      >
        <span className="font-medium text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="text-brand-blue flex-shrink-0" size={20} />
        ) : (
          <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-5"
        >
          <p className="text-gray-400">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Hackathon() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.hackathon);
    return cleanup;
  }, []);

  const phase1Details = {
    title: "Phase 1: Ideation",
    weeks: "Weeks 1-4",
    description: "Submit monetization strategies and feature ideas via GitHub Issues. Monetization weighted at 40% — our top priority.",
    prizes: [
      { place: "1st Place", amount: "$200" },
      { place: "2nd Place", amount: "$150" },
      { place: "3rd Place", amount: "$100" },
      { place: "4th-10th", amount: "$50 each" },
    ],
    total: "$850",
    categories: [
      { name: "Monetization", weight: "40%", description: "Revenue models, pricing strategies" },
      { name: "Features", weight: "30%", description: "New capabilities, integrations" },
      { name: "Marketing", weight: "20%", description: "Growth tactics, community building" },
      { name: "Other", weight: "10%", description: "Operations, partnerships, docs" },
    ],
  };

  const phase2Details = {
    title: "Phase 2: Execution",
    weeks: "Weeks 6-13",
    description: "Build real features via GitHub PRs. Teams of 2-5 convert ideas into production code.",
    prizes: [
      { place: "1st Place", amount: "$2,000" },
      { place: "2nd Place", amount: "$1,500" },
      { place: "3rd Place", amount: "$1,000" },
    ],
    total: "$4,500",
    criteria: [
      { name: "Code Quality", weight: "25%", description: "Readability, structure, best practices" },
      { name: "Completeness", weight: "25%", description: "Full functionality, edge cases" },
      { name: "Documentation", weight: "20%", description: "README, comments, API docs" },
      { name: "Test Coverage", weight: "15%", description: "Unit & integration tests" },
      { name: "Architecture", weight: "15%", description: "Style guide, patterns" },
    ],
  };

  const benefits = [
    {
      icon: Brain,
      title: "Learn AI Development",
      description: "Get hands-on experience building real AI-powered tools that developers actually use.",
    },
    {
      icon: Code2,
      title: "Build Your Portfolio",
      description: "Your contributions become part of a growing open-source project with 1,200+ stars.",
    },
    {
      icon: Users,
      title: "Join 1,000+ Builders",
      description: "Connect with developers globally who ship real products, not just tutorials.",
    },
    {
      icon: Trophy,
      title: "Win $5,350 in Prizes",
      description: "Compete for prizes across two phases, plus mentorship and recognition.",
    },
  ];

  const tracks = [
    {
      icon: Terminal,
      title: "CLI Commands",
      description: "Build new natural language commands for Cortex",
      difficulty: "Beginner",
      color: "text-emerald-400",
    },
    {
      icon: Brain,
      title: "AI Integrations",
      description: "Integrate new AI models and providers",
      difficulty: "Intermediate",
      color: "text-blue-400",
    },
    {
      icon: Shield,
      title: "Security Features",
      description: "Enhance sandbox and permission systems",
      difficulty: "Advanced",
      color: "text-purple-400",
    },
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Write guides, tutorials, and examples",
      difficulty: "Beginner",
      color: "text-yellow-400",
    },
  ];

  const faqs = [
    {
      question: "What is the two-phase structure?",
      answer: "Phase 1 (Weeks 1-4) focuses on ideation—submit ideas via GitHub Issues. Phase 2 (Weeks 6-13) is execution—teams build and submit code via Pull Requests. This design maximizes idea capture while ensuring quality code delivery.",
    },
    {
      question: "Do I need to be an expert developer?",
      answer: "Not at all! Phase 1 requires only ideas—no coding needed. Phase 2 has issues for all skill levels. If you can write code and use Git, you can contribute.",
    },
    {
      question: "Is this really free to participate?",
      answer: "100% free. This is open-source. You're contributing to a community project that benefits everyone. No fees, no catches.",
    },
    {
      question: "How are submissions judged?",
      answer: "Phase 1 uses a 100-point rubric across market potential, clarity, feasibility, originality, and alignment. Phase 2 evaluates code quality, completeness, documentation, test coverage, and architecture. Three judges per submission.",
    },
    {
      question: "What if my PR doesn't get merged?",
      answer: "Every attempt is a learning opportunity. You'll get feedback from maintainers, and you can iterate. Many successful contributors started with rejected PRs.",
    },
    {
      question: "Can I participate from anywhere?",
      answer: "Yes! This is a global, async hackathon. Work on your own schedule, from anywhere in the world. All communication happens on GitHub and Discord.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
          >
            <div className="flex -space-x-2">
              {[
                "https://avatars.githubusercontent.com/u/1?v=4",
                "https://avatars.githubusercontent.com/u/2?v=4",
                "https://avatars.githubusercontent.com/u/3?v=4",
                "https://avatars.githubusercontent.com/u/4?v=4",
              ].map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt={`Contributor ${i + 1}`}
                  className="w-6 h-6 rounded-full border-2 border-black object-cover"
                />
              ))}
            </div>
            <span className="text-sm text-gray-300">
              <span className="text-white font-semibold">1,000+</span> participants expected
            </span>
          </motion.div>

          {/* PAS: Problem */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg mb-4"
          >
            Want to build with AI but don't know where to start?
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
              Cortex Hackathon 2026
            </span>
          </motion.h1>

          {/* Date Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-sm sm:text-base text-gray-500 tracking-widest uppercase mb-6"
          >
            February 17, 2026 · 13-Week Program · Two Phases
          </motion.p>

          {/* PAS: Agitate & Solution */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8"
          >
            A two-phase program designed to <span className="text-terminal-green font-bold">crowdsource monetization strategies</span> and 
            convert the best ideas into production code with measurable ROI.
            <span className="text-brand-blue font-medium"> Contribute to Cortex Linux</span> — the open-source AI layer for Linux.
          </motion.p>

          {/* Urgency: Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-sm text-gray-400 mb-4 flex items-center justify-center gap-2">
              <Clock size={16} className="text-brand-blue" />
              Hackathon starts in:
            </p>
            <CountdownTimer />
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-8 py-4 bg-brand-blue hover:opacity-90 rounded-xl text-white font-semibold text-lg shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:shadow-[0_0_40px_rgba(0,102,255,0.6)] transition-all duration-300"
              data-testid="hero-cta-github"
            >
              <Github size={24} />
              Start Building Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <div className="flex items-center gap-2 text-gray-400">
              <Gift size={18} className="text-emerald-400" />
              <span className="text-sm">100% Free to participate</span>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-12 pt-8 border-t border-white/10"
          >
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">1,000+</p>
              <p className="text-sm text-gray-400">Participants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">$5.35K</p>
              <p className="text-sm text-gray-400">Prize Pool</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">13</p>
              <p className="text-sm text-gray-400">Weeks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">30+</p>
              <p className="text-sm text-gray-400">Merged PRs</p>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Two-Phase Overview Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-terminal-green/30 text-terminal-green text-sm mb-6">
              <Target size={16} />
              Main Goal: Crowdsource Monetization Strategies
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Two Phases, <span className="text-brand-blue">One Goal</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Generate features that enable sustainable revenue. Phase 1 captures monetization ideas. Phase 2 turns them into production code.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Phase 1 Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Lightbulb className="text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{phase1Details.title}</h3>
                  <p className="text-purple-400 text-sm font-medium">{phase1Details.weeks}</p>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6">{phase1Details.description}</p>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Prize Pool: <span className="text-terminal-green glow-terminal-green">{phase1Details.total}</span></h4>
                <div className="grid grid-cols-2 gap-2">
                  {phase1Details.prizes.map((prize) => (
                    <div key={prize.place} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-gray-400 text-sm">{prize.place}</span>
                      <span className="text-terminal-green font-semibold">{prize.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Judging Categories</h4>
                <div className="space-y-2">
                  {phase1Details.categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-terminal-green font-mono text-sm w-12">{cat.weight}</span>
                      <span className="text-white font-medium">{cat.name}</span>
                      <span className="text-gray-500 text-sm hidden sm:block">— {cat.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Phase 2 Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center">
                  <Code2 className="text-brand-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{phase2Details.title}</h3>
                  <p className="text-brand-blue text-sm font-medium">{phase2Details.weeks}</p>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6">{phase2Details.description}</p>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Prize Pool: <span className="text-terminal-green glow-terminal-green">{phase2Details.total}</span></h4>
                <div className="grid grid-cols-3 gap-2">
                  {phase2Details.prizes.map((prize) => (
                    <div key={prize.place} className="text-center bg-white/5 rounded-lg px-3 py-3">
                      <span className="text-terminal-green font-bold text-lg block">{prize.amount}</span>
                      <span className="text-gray-400 text-xs">{prize.place}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Code Judging Criteria</h4>
                <div className="space-y-2">
                  {phase2Details.criteria.map((crit) => (
                    <div key={crit.name} className="flex items-center gap-3">
                      <span className="text-brand-blue font-mono text-sm w-12">{crit.weight}</span>
                      <span className="text-white font-medium">{crit.name}</span>
                      <span className="text-gray-500 text-sm hidden sm:block">— {crit.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Timeline Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h4 className="text-center text-white font-semibold mb-6">13-Week Timeline</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-400">Phase 1: 4 weeks</span>
              </div>
              <ArrowRight className="text-gray-600 hidden sm:block" size={20} />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500" />
                <span className="text-sm text-gray-400">Transition: 1 week</span>
              </div>
              <ArrowRight className="text-gray-600 hidden sm:block" size={20} />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-400">Phase 2: 8 weeks</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Why Builders <span className="text-brand-blue">Choose Cortex</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              This isn't just another hackathon. It's your entry into the AI revolution.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-brand-blue/50 hover:shadow-[0_0_30px_rgba(0,102,255,0.15)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="text-brand-blue" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Participate */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              How to <span className="text-brand-blue">Participate</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              No applications. No waitlists. Just start building.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-brand-blue/30 font-mono">01</span>
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center">
                  <Star className="text-brand-blue" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Star & Fork</h3>
              <p className="text-gray-400 text-sm mb-4">Star the repo and fork it to your GitHub account. Takes 30 seconds.</p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue/80 font-medium text-sm transition-colors"
                data-testid="link-step-star"
              >
                Star on GitHub
                <ArrowRight size={16} />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-blue-400/30 font-mono">02</span>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Lightbulb className="text-purple-400" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Phase 1: Submit Ideas</h3>
              <p className="text-gray-400 text-sm mb-4">Open a GitHub Issue with your idea. Monetization, features, marketing—all welcome.</p>
              <a
                href={GITHUB_ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
                data-testid="link-step-ideas"
              >
                Submit an Idea
                <ArrowRight size={16} />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-brand-blue/30 font-mono">03</span>
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center">
                  <GitPullRequest className="text-brand-blue" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Phase 2: Ship Code</h3>
              <p className="text-gray-400 text-sm mb-4">Form a team (2-5 people), build your idea, and submit a Pull Request.</p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue/80 font-medium text-sm transition-colors"
                data-testid="link-step-code"
              >
                Start Building
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>

          {/* Terminal Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-gray-400 text-sm ml-2 font-mono">terminal</span>
            </div>
            <div className="p-6 font-mono text-sm">
              <p className="text-gray-400">
                <span className="text-emerald-400">$</span> git clone {GITHUB_URL}
              </p>
              <p className="text-gray-400 mt-2">
                <span className="text-emerald-400">$</span> cd cortex
              </p>
              <p className="text-gray-400 mt-2">
                <span className="text-emerald-400">$</span> npm install && npm run dev
              </p>
              <p className="text-brand-blue mt-4">
                <span className="text-terminal-green">✓</span> Ready to build something amazing!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-brand-blue">Track</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Pick what excites you. Every contribution counts.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tracks.map((track, index) => (
              <motion.a
                key={track.title}
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-brand-blue/50 transition-all duration-300 cursor-pointer"
                data-testid={`track-${track.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <track.icon className={track.color} size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{track.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{track.description}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  track.difficulty === "Beginner" ? "bg-emerald-500/20 text-emerald-400" :
                  track.difficulty === "Intermediate" ? "bg-blue-500/20 text-blue-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>
                  {track.difficulty}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Got Questions?
            </h2>
            <p className="text-gray-400">
              We've got answers. If not, ask on Discord.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-terminal-green/30 text-terminal-green text-sm mb-6">
              <Sparkles size={16} />
              <span className="font-bold">$5,350</span> in prizes across both phases
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Stop Learning. <span className="text-brand-blue">Start Shipping.</span>
            </h2>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              The best way to learn AI is to build with it. Join 1,000+ developers in a 
              13-week program designed to turn your ideas into production code.
            </p>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-brand-blue hover:opacity-90 rounded-xl text-white font-semibold text-xl shadow-[0_0_40px_rgba(0,102,255,0.5)] hover:shadow-[0_0_60px_rgba(0,102,255,0.7)] transition-all duration-300"
              data-testid="final-cta-github"
            >
              <Github size={28} />
              Join the Hackathon
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="text-sm">Free to participate</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="text-sm">Global & async</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="text-sm">All skill levels</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
