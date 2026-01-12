import { useState, useEffect } from "react";
import { Link } from "wouter";
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
  Shield,
  Gift,
  BookOpen,
  Layers,
  Calendar,
  CheckCircle2,
  Quote,
  Video,
  Rocket,
  Globe,
  Play,
  Award,
  MessageSquare,
  FileText,
  Lightbulb,
  Download,
  ClipboardList,
} from "lucide-react";
import { FaTwitter, FaDiscord } from "react-icons/fa";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";
import analytics from "@/lib/analytics";
import {
  championAmbassador,
  hackathonPhases,
  buildTracks,
  hackathonConfig,
  hackathonBenefits,
  hackathonFaqs,
  ideathonPhase,
  ideathonSubmissionTemplate,
} from "@/data/hackathon";

const GITHUB_URL = hackathonConfig.githubUrl;
const DISCORD_URL = hackathonConfig.discordUrl;
const HACKATHON_DATE = hackathonConfig.startDate;

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
            <span className="text-2xl sm:text-4xl font-bold text-blue-300 font-mono">
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
          <ChevronUp className="text-blue-300 flex-shrink-0" size={20} />
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

function PhaseCard({ phase, index }: { phase: typeof hackathonPhases[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gradient-to-br ${phase.bgGradient} border ${phase.borderColor} rounded-2xl p-6 relative overflow-hidden h-full flex flex-col`}
    >
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
        <span className={`text-2xl font-bold ${phase.color}`}>{phase.number}</span>
      </div>
      
      <div className="mb-4">
        <span className={`text-xs font-semibold uppercase tracking-wide ${phase.color}`}>
          {phase.weeks}
        </span>
        <h3 className="text-xl font-bold text-white mt-1">{phase.title}</h3>
        <p className="text-sm text-gray-500 italic mt-1">Goal: {phase.goal}</p>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">{phase.description}</p>
      
      {phase.requirements && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wide mb-2">Requirements</h4>
          <ul className="space-y-1">
            {phase.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <CheckCircle2 size={14} className={`${phase.color} flex-shrink-0 mt-0.5`} />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {phase.prizes && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wide mb-2">
            Prize Pool: <span className="text-terminal-green">{phase.prizeTotal}</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {phase.prizes.map((prize, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-xs">{prize.place}</span>
                <span className="text-terminal-green font-semibold text-sm">{prize.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {phase.criteria && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wide mb-2">Judging Criteria</h4>
          <div className="space-y-1">
            {phase.criteria.map((crit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`${phase.color} font-mono w-10`}>{crit.weight}</span>
                <span className="text-white">{crit.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {phase.activities && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wide mb-2">Activities</h4>
          <ul className="space-y-1">
            {phase.activities.map((activity, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <Play size={14} className={`${phase.color} flex-shrink-0 mt-0.5`} />
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {phase.rewards && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wide mb-2">Rewards</h4>
          <ul className="space-y-1">
            {phase.rewards.map((reward, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <Gift size={14} className={`${phase.color} flex-shrink-0 mt-0.5`} />
                <span>{reward}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {phase.cta && (
        <a
          href={phase.cta.href}
          target={phase.cta.external ? "_blank" : undefined}
          rel={phase.cta.external ? "noopener noreferrer" : undefined}
          className={`mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
            phase.number === 1 ? "bg-blue-500 hover:bg-blue-600 text-white" :
            phase.number === 2 ? "bg-purple-500 hover:bg-purple-600 text-white" :
            "bg-yellow-500 hover:bg-yellow-600 text-black"
          }`}
          data-testid={`phase-${phase.id}-cta`}
        >
          {phase.cta.text}
          <ArrowRight size={16} />
        </a>
      )}
    </motion.div>
  );
}

export default function Hackathon() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.hackathon);
    return cleanup;
  }, []);

  const trackIcons: Record<string, typeof Terminal> = {
    "cli-commands": Terminal,
    "plugins": Layers,
    "ai-integrations": Brain,
    "infra-tools": Shield,
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col justify-center px-4 pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Contributor Avatars + Participants */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="flex -space-x-3">
              {[
                { name: "Mike", avatar: "https://github.com/mikejmorgan-ai.png" },
                { name: "Suyash", avatar: "/assets/suyash.png" },
                { name: "Dhruv", avatar: "/assets/dhruv.png" },
                { name: "Ansh", avatar: "https://github.com/Anshgrover23.png" }
              ].map((contributor, i) => (
                <img
                  key={i}
                  src={contributor.avatar}
                  alt={contributor.name}
                  className="w-10 h-10 rounded-full border-2 border-black object-cover"
                  title={contributor.name}
                />
              ))}
            </div>
            <span className="text-gray-400 text-sm">
              <span className="text-white font-semibold">1,000+</span> participants expected
            </span>
          </motion.div>

          {/* Problem Statement */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-gray-400 text-base mb-4"
          >
            Want to build with AI but don't know where to start?
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
          >
            <span className="gradient-text">Cortex Hackathon 2026</span>
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

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            A two-phase program designed to crowdsource monetization strategies and convert the best ideas into production code with measurable ROI. Contribute to{" "}
            <span className="text-blue-300 font-medium">Cortex Linux</span> — the open-source AI layer for Linux.
          </motion.p>

          {/* Urgency: Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <p className="text-sm text-gray-400 mb-4 flex items-center justify-center gap-2">
              <Clock size={16} className="text-blue-300" />
              Hackathon starts in:
            </p>
            <CountdownTimer />
          </motion.div>

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Link
              href="/register"
              onClick={() => {
                analytics.trackCTAClick('register_now', 'hackathon_hero');
                analytics.trackConversion('hackathon_signup');
              }}
              className="group flex items-center gap-3 px-6 py-3 bg-brand-blue hover:opacity-90 rounded-xl text-white font-semibold shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_30px_rgba(0,102,255,0.5)] transition-all duration-300"
              data-testid="hero-cta-register"
            >
              <ClipboardList size={20} />
              Register Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 border border-white/20 hover:border-white/40 rounded-xl text-white font-medium transition-colors"
              data-testid="hero-cta-discord"
              onClick={() => {
                analytics.trackCTAClick('join_discord', 'hackathon_hero');
              }}
            >
              <FaDiscord size={18} />
              Join Discord
            </a>
            <a
              href={hackathonConfig.rulesDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 rounded-xl text-amber-400 font-medium transition-colors"
              data-testid="download-rules-pdf"
              onClick={() => {
                analytics.trackCTAClick('download_rules', 'hackathon_hero');
              }}
            >
              <FileText size={18} />
              Rules
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-4 text-gray-400 mt-4"
          >
            <span className="flex items-center gap-2 text-sm">
              <Gift size={16} className="text-emerald-400" />
              100% Free
            </span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-2 text-sm">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-terminal-green font-semibold">$15,000</span> in Prizes
            </span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-2 text-sm">
              <Users size={16} className="text-blue-300" />
              Open to Everyone
            </span>
          </motion.div>

          {/* Champion Ambassador Spotlight - Smaller */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 max-w-md mx-auto"
            data-testid="hackathon-champion-spotlight"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <img
                  src={championAmbassador.avatar}
                  alt={championAmbassador.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-500/50"
                  loading="lazy"
                />
                <div className="text-left">
                  <p className="text-xs uppercase tracking-wide text-blue-300 font-medium">
                    Champion Ambassador
                  </p>
                  <p className="text-sm font-semibold text-white">{championAmbassador.name}</p>
                  <p className="text-xs text-gray-400">{championAmbassador.achievement}</p>
                </div>
                <a
                  href={`https://github.com/${championAmbassador.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  data-testid="champion-github-link"
                >
                  <Github size={14} />
                  GitHub
                </a>
                {championAmbassador.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${championAmbassador.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    data-testid="champion-linkedin-link"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* 4 Simple Steps to Participate */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 pt-8 border-t border-white/10"
            data-testid="participate-steps-section"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
              4 Simple Steps to Participate
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/40 rounded-xl transition-all text-center"
                data-testid="step-1-star"
              >
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-lg">1</div>
                <Star size={24} className="text-yellow-400" />
                <span className="text-white font-semibold">Star the Repo</span>
                <span className="text-gray-400 text-sm">Show your support on GitHub</span>
              </a>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 rounded-xl transition-all text-center"
                data-testid="step-2-discord"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">2</div>
                <FaDiscord size={24} className="text-purple-400" />
                <span className="text-white font-semibold">Join Discord</span>
                <span className="text-gray-400 text-sm">Connect with the community</span>
              </a>
              <Link
                href="/hackathon-rules"
                className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 rounded-xl transition-all text-center"
                data-testid="step-3-rules"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">3</div>
                <FileText size={24} className="text-emerald-400" />
                <span className="text-white font-semibold">View Rules</span>
                <span className="text-gray-400 text-sm">Read the full guidelines</span>
              </Link>
              <Link
                href="/register"
                className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-xl transition-all text-center"
                data-testid="step-4-register"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">4</div>
                <ClipboardList size={24} className="text-blue-400" />
                <span className="text-white font-semibold">Fill in the Form</span>
                <span className="text-gray-400 text-sm">Complete your registration</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Split View Section - Two Hero Banners */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm mb-6">
              <Layers size={16} />
              Two Pathways
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-blue-300">Journey</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Contribute ideas in Phase 1 or build code in Phase 2. Both paths lead to recognition and rewards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Ideathon Banner - Amber themed */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-500/10 to-amber-900/5 border border-amber-500/20 rounded-2xl p-8 relative overflow-hidden"
              data-testid="banner-ideathon"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6">
                  <Lightbulb className="text-amber-400" size={28} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-2 block">
                  Phase 1 · Weeks 1-4
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Cortex Ideathon
                </h3>
                <p className="text-lg text-amber-300 font-medium mb-4">
                  Build the Features of Tomorrow
                </p>
                <p className="text-gray-400 mb-6">
                  Submit structured product ideas for monetizable features. No coding required — just clear thinking about what Cortex Linux needs.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-terminal-green" />
                    <span className="text-terminal-green font-semibold">{ideathonPhase.prizeTotal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-400">{ideathonPhase.duration}</span>
                  </div>
                </div>
                <a
                  href="#ideathon-section"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-black font-semibold transition-colors"
                  data-testid="cta-ideathon-learn-more"
                >
                  Learn More
                  <ArrowRight size={18} />
                </a>
              </div>
            </motion.div>

            {/* Hackathon Banner - Blue themed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-900/5 border border-blue-500/20 rounded-2xl p-8 relative overflow-hidden"
              data-testid="banner-hackathon"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                  <Code2 className="text-blue-300" size={28} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-300 mb-2 block">
                  Phase 2 · Weeks 5-14
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Cortex Hackathon
                </h3>
                <p className="text-lg text-blue-300 font-medium mb-4">
                  Ship Real Code Today
                </p>
                <p className="text-gray-400 mb-6">
                  Build features, plugins, and integrations. Submit via GitHub PRs. Get code reviewed and merged into Cortex Linux.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-terminal-green" />
                    <span className="text-terminal-green font-semibold">$12,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-400">10 weeks</span>
                  </div>
                </div>
                <a
                  href="#hackathon-section"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold transition-colors"
                  data-testid="cta-hackathon-learn-more"
                >
                  Learn More
                  <ArrowRight size={18} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clear Program Roadmap */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-950/10 to-transparent" id="program-roadmap">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-4">
              <Calendar size={16} />
              Program Roadmap
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              13-Week Program Timeline
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Clear milestones from start to finish. Know exactly what happens and when.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-blue-500 to-emerald-500 hidden sm:block" />
            
            {/* Timeline items */}
            <div className="space-y-6">
              {/* Week 1-4: Ideathon */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-4 sm:gap-6"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm relative z-10">
                  1-4
                </div>
                <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={18} className="text-amber-400" />
                    <h3 className="font-bold text-white">Phase 1: Ideathon</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Weeks 1-4</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Submit monetizable feature ideas. No coding required.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-terminal-green font-semibold">$3,000 in prizes</span>
                    <span className="text-gray-500">Top 10 ideas win</span>
                  </div>
                </div>
              </motion.div>

              {/* Week 5-9: Build Sprint */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex gap-4 sm:gap-6"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm relative z-10">
                  5-9
                </div>
                <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 size={18} className="text-blue-300" />
                    <h3 className="font-bold text-white">Phase 2: Build Sprint</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Weeks 5-9</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Code and submit Pull Requests. Build real features.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-300 font-medium">Active development period</span>
                    <span className="text-gray-500">GitHub PRs</span>
                  </div>
                </div>
              </motion.div>

              {/* Week 10-13: Review Period */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 sm:gap-6"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm relative z-10">
                  10-13
                </div>
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <h3 className="font-bold text-white">Review & Winners</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Weeks 10-13</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Code review, judging, and winner announcement.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-terminal-green font-semibold">$12,000 in prizes</span>
                    <span className="text-gray-500">1st: $5K, 2nd: $3K, 3rd: $2K</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Simplified */}
      <section className="py-16 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              <span className="text-white">Code First,</span>{" "}
              <span className="text-blue-300">Not Pitch Decks</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {hackathonConfig.philosophy.description}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional vs Code-First */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-500/5 border border-red-500/20 rounded-xl p-5"
            >
              <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                <span className="line-through opacity-50">Traditional Hackathons</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Pitch decks and business plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Monetization strategy focus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Ideas without implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>One-time participants</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-terminal-green/5 border border-terminal-green/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-terminal-green mb-4 flex items-center gap-2">
                <Rocket size={18} />
                Cortex Hackathon
              </h3>
              <ul className="space-y-3 text-gray-300">
                {hackathonConfig.philosophy.values.map((value, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-terminal-green flex-shrink-0 mt-0.5" />
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Quote highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <blockquote className="relative inline-block max-w-2xl">
              <Quote className="absolute -top-4 -left-4 text-blue-300/30" size={32} />
              <p className="text-2xl sm:text-3xl font-bold text-white italic">
                {hackathonConfig.philosophy.principle}
              </p>
              <Quote className="absolute -bottom-4 -right-4 text-blue-300/30 rotate-180" size={32} />
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* Phase 1: Ideathon Section */}
      <section id="ideathon-section" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm mb-6">
              <Lightbulb size={16} />
              Phase 1
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="text-amber-400">{ideathonPhase.title}</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-2">
              {ideathonPhase.subtitle} · {ideathonPhase.weeks} · {ideathonPhase.duration}
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {ideathonPhase.description}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Submission Template */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6"
              data-testid="ideathon-submission-template"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <FileText className="text-amber-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Submission Template</h3>
              </div>
              <div className="space-y-4">
                {ideathonSubmissionTemplate.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                    data-testid={`template-field-${field.id}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-semibold text-white">{field.label}</h4>
                      {field.required ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Required</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">Optional</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{field.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Judging Criteria & Prizes */}
            <div className="space-y-6">
              {/* Judging Criteria */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6"
                data-testid="ideathon-judging-criteria"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Target className="text-amber-400" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Judging Criteria</h3>
                </div>
                <div className="space-y-3">
                  {ideathonPhase.judgingCriteria.map((criterion, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-amber-400 font-mono font-bold text-lg w-14">{criterion.weight}</span>
                      <div>
                        <p className="text-white font-medium">{criterion.name}</p>
                        <p className="text-xs text-gray-400">{criterion.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Prizes */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6"
                data-testid="ideathon-prizes"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Trophy className="text-amber-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Prize Pool</h3>
                  </div>
                  <span className="text-2xl font-bold text-terminal-green">{ideathonPhase.prizeTotal}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ideathonPhase.prizes.map((prize, i) => (
                    <div key={i} className="bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                      <p className="text-gray-400 text-sm">{prize.place}</p>
                      <p className="text-terminal-green font-bold text-lg">{prize.amount}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <a
                  href={ideathonPhase.cta.href}
                  target={ideathonPhase.cta.external ? "_blank" : undefined}
                  rel={ideathonPhase.cta.external ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-amber-500 hover:bg-amber-600 rounded-xl text-black font-semibold text-lg transition-colors"
                  data-testid="cta-submit-idea"
                >
                  <Lightbulb size={22} />
                  {ideathonPhase.cta.text}
                  <ArrowRight size={20} />
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2: Hackathon Section */}
      <section id="hackathon-section" className="py-20 px-4 relative bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm mb-6">
              <Code2 size={16} />
              Phase 2
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Cortex Hackathon</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Build and Ship. Two stages to turn your code into production-ready contributions.
            </p>
          </motion.div>

          {/* Timeline Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex flex-wrap items-center justify-center gap-4">
              {hackathonPhases.map((phase, i) => (
                <div key={phase.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${phase.color.replace('text-', 'bg-').replace('-400', '-500')}`} />
                  <span className="text-sm text-gray-400">
                    {phase.title}: {phase.duration}
                  </span>
                  {i < hackathonPhases.length - 1 && (
                    <ArrowRight className="text-gray-600 hidden sm:block ml-2" size={16} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Phase Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {hackathonPhases.map((phase, index) => (
              <PhaseCard key={phase.id} phase={phase} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Build Tracks Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6">
              <Code2 size={16} />
              Choose Your Track
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              What Will You <span className="text-blue-300">Build</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Pick a track that matches your skills and interests. All contributions welcome.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {buildTracks.map((track, index) => {
              const Icon = trackIcons[track.id] || Terminal;
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl ${track.color.replace('text-', 'bg-').replace('-400', '-500/20')} flex items-center justify-center mb-4`}>
                    <Icon className={track.color} size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{track.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{track.description}</p>
                  
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      track.difficulty === "Beginner" ? "bg-emerald-500/20 text-emerald-400" :
                      track.difficulty === "Intermediate" ? "bg-blue-500/20 text-blue-300" :
                      "bg-purple-500/20 text-purple-400"
                    }`}>
                      {track.difficulty}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Examples</h4>
                    <ul className="space-y-1">
                      {track.examples.map((example, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className={track.color}>•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Champion Ambassador Expanded Section */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 rounded-3xl p-8 sm:p-12"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm mb-6">
                  <Award size={16} />
                  Meet Your Champion
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {championAmbassador.name}
                </h2>
                <p className="text-xl text-blue-300 font-medium mb-2">
                  {championAmbassador.title}
                </p>
                <p className="text-gray-400 mb-4">
                  {championAmbassador.achievement}
                </p>
                <p className="text-terminal-green font-semibold text-lg mb-6">
                  {championAmbassador.achievementDetail}
                </p>
                
                {championAmbassador.quote && (
                  <blockquote className="relative bg-white/5 rounded-xl p-4 mb-6">
                    <Quote className="absolute top-2 left-2 text-blue-300/30" size={20} />
                    <p className="text-white italic pl-6">
                      "{championAmbassador.quote}"
                    </p>
                  </blockquote>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://github.com/${championAmbassador.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    data-testid="ambassador-github"
                  >
                    <Github size={18} />
                    <span className="text-sm font-medium">GitHub</span>
                  </a>
                  {championAmbassador.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${championAmbassador.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      data-testid="ambassador-linkedin"
                    >
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <img
                  src={championAmbassador.avatar}
                  alt={championAmbassador.name}
                  className="w-48 h-48 rounded-full border-4 border-brand-blue shadow-[0_0_60px_rgba(0,102,255,0.4)] mb-6"
                  loading="lazy"
                />
                
                <div className="w-full space-y-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide text-center mb-3">
                    {championAmbassador.name}'s Roles
                  </h3>
                  {championAmbassador.roles.map((role, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2"
                    >
                      <CheckCircle2 size={16} className="text-blue-300" />
                      <span className="text-sm text-gray-300">{role}</span>
                    </div>
                  ))}
                  {championAmbassador.liveCodingSchedule && (
                    <div className="flex items-center gap-3 bg-terminal-green/10 border border-terminal-green/20 rounded-lg px-4 py-2 mt-4">
                      <Video size={16} className="text-terminal-green" />
                      <span className="text-sm text-terminal-green">{championAmbassador.liveCodingSchedule}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-blue-300 text-sm mb-6">
              <Trophy size={16} />
              Why Participate
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              What You <span className="text-blue-300">Get</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Beyond the prizes, you're building real skills, real connections, and real portfolio pieces.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathonBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-blue/30 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Program Snippet */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-6 sm:p-8"
            data-testid="hackathon-referral-snippet"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Gift size={32} className="text-purple-400" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-white mb-2">
                  Want a Head Start? Refer Friends!
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Join our referral program. Invite friends and unlock exclusive perks like Discord roles, Pro subscriptions, and Hackathon fast-track entry.
                </p>
                <a
                  href="/referrals"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-medium text-sm transition-colors"
                  data-testid="hackathon-referral-cta"
                  onClick={() => analytics.trackCTAClick('referral_program', 'hackathon_page')}
                >
                  <Users size={16} />
                  Join Referral Program
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm mb-6">
              <MessageSquare size={16} />
              Common Questions
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked <span className="text-blue-300">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {hackathonFaqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Ship Real Code?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join {hackathonConfig.expectedParticipants} builders competing for {hackathonConfig.totalPrizePool} in prizes.
              Your contributions become part of Cortex Linux — forever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                onClick={() => {
                  analytics.trackCTAClick('register_now', 'hackathon_final_cta');
                  analytics.trackConversion('hackathon_signup');
                }}
                className="group flex items-center gap-3 px-8 py-4 bg-brand-blue hover:opacity-90 rounded-xl text-white font-semibold text-lg shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:shadow-[0_0_40px_rgba(0,102,255,0.6)] transition-all duration-300"
                data-testid="final-cta-register"
              >
                <ClipboardList size={24} />
                Register Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 border-2 border-white/20 hover:border-white/40 rounded-xl text-white font-medium transition-colors"
                data-testid="final-cta-discord"
                onClick={() => {
                  analytics.trackCTAClick('join_discord', 'hackathon_final_cta');
                }}
              >
                <FaDiscord size={20} />
                Join Discord Community
              </a>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              {hackathonConfig.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
