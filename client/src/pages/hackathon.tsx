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
  Shield,
  Gift,
  BookOpen,
  Layers,
  Calendar,
  CheckCircle2,
  Quote,
  Video,
  Rocket,
  TrendingUp,
  Globe,
  Play,
  Award,
  MessageSquare,
  FileText,
  Lightbulb,
  ListChecks,
  Download,
  Circle,
} from "lucide-react";
import { FaTwitter, FaDiscord, FaReddit, FaYoutube } from "react-icons/fa";
import { SiDevdotto, SiProducthunt } from "react-icons/si";
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
  growthStrategy,
  ideathonPhase,
  ideathonSubmissionTemplate,
  roadmapTasks,
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

function PhaseCard({ phase, index }: { phase: typeof hackathonPhases[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gradient-to-br ${phase.bgGradient} border ${phase.borderColor} rounded-2xl p-6 relative overflow-hidden`}
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

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  planning: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  website: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  legal: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  launch: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  tracking: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
};

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

  const platformIcons: Record<string, typeof SiDevdotto> = {
    "DEV.to / Hashnode": SiDevdotto,
    "Reddit": FaReddit,
    "Product Hunt": SiProducthunt,
    "YouTube": FaYoutube,
  };

  const completedTasks = roadmapTasks.filter(t => t.status === "completed").length;
  const progressPercentage = Math.round((completedTasks / roadmapTasks.length) * 100);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Problem Statement */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg mb-4"
          >
            Want to contribute to open source but don't know where to start?
          </motion.p>

          {/* Main Headline - Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 leading-tight"
          >
            <span className="gradient-text">
              {hackathonConfig.tagline}
            </span>
          </motion.h1>

          {/* Hackathon Name */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-xl sm:text-2xl text-white font-semibold mb-2"
          >
            {hackathonConfig.name}
          </motion.p>

          {/* Date Subtitle - Updated to TWO PHASES */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm sm:text-base text-gray-500 tracking-widest uppercase mb-6"
          >
            14-WEEK PROGRAM · TWO PHASES
          </motion.p>

          {/* Solution Statement - Updated to mention both phases */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8"
          >
            <span className="text-amber-400 font-bold">Phase 1: IDEathon</span> — Submit monetizable feature ideas.{" "}
            <span className="text-brand-blue font-bold">Phase 2: Hackathon</span> — Build and ship real code via GitHub PRs.
            Both paths lead to prizes, recognition, and long-term contribution to{" "}
            <span className="text-brand-blue font-medium">Cortex Linux</span>.
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
              Program starts in:
            </p>
            <CountdownTimer />
          </motion.div>

          {/* Primary CTA with PDF Download */}
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
              onClick={() => {
                analytics.trackCTAClick('start_building', 'hackathon_hero');
                analytics.trackConversion('hackathon_signup');
              }}
            >
              <Github size={24} />
              Start Building Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border-2 border-white/20 hover:border-white/40 rounded-xl text-white font-medium transition-colors"
              data-testid="hero-cta-discord"
              onClick={() => {
                analytics.trackCTAClick('join_discord', 'hackathon_hero');
              }}
            >
              <FaDiscord size={20} />
              Join Discord
            </a>
            <a
              href={hackathonConfig.rulesDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border-2 border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 rounded-xl text-amber-400 font-medium transition-colors"
              data-testid="download-rules-pdf"
              onClick={() => {
                analytics.trackCTAClick('download_rules', 'hackathon_hero');
              }}
            >
              <Download size={20} />
              Download Rules PDF
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-2 text-gray-400 mt-4"
          >
            <Gift size={18} className="text-emerald-400" />
            <span className="text-sm">100% Free to participate</span>
          </motion.div>

          {/* Champion Ambassador Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 max-w-xl mx-auto"
            data-testid="hackathon-champion-spotlight"
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={championAmbassador.avatar}
                  alt={championAmbassador.name}
                  className="w-20 h-20 rounded-full border-4 border-brand-blue shadow-[0_0_30px_rgba(0,102,255,0.4)]"
                  loading="lazy"
                />
                <div className="text-center sm:text-left">
                  <p className="text-xs uppercase tracking-wide text-brand-blue font-semibold mb-1">
                    Champion Ambassador
                  </p>
                  <h3 className="text-xl font-bold text-white">{championAmbassador.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {championAmbassador.achievement}
                  </p>
                  <p className="text-xs text-terminal-green font-medium mt-1">
                    {championAmbassador.achievementDetail}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
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

          {/* Quick Stats - Updated */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-12 pt-8 border-t border-white/10"
            data-testid="quick-stats-section"
          >
            <div className="text-center" data-testid="stat-prize-pool">
              <p className="text-2xl sm:text-3xl font-bold text-terminal-green">{hackathonConfig.totalPrizePool}</p>
              <p className="text-sm text-gray-400">Total Prize Pool</p>
            </div>
            <div className="text-center" data-testid="stat-participants">
              <p className="text-2xl sm:text-3xl font-bold text-white">{hackathonConfig.expectedParticipants}</p>
              <p className="text-sm text-gray-400">Participants</p>
            </div>
            <div className="text-center" data-testid="stat-ideas">
              <p className="text-2xl sm:text-3xl font-bold text-amber-400">{hackathonConfig.expectedIdeas}</p>
              <p className="text-sm text-gray-400">Ideas Expected</p>
            </div>
            <div className="text-center" data-testid="stat-prs">
              <p className="text-2xl sm:text-3xl font-bold text-brand-blue">{hackathonConfig.expectedPRs}</p>
              <p className="text-sm text-gray-400">PRs Expected</p>
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
              Choose Your <span className="text-brand-blue">Journey</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Contribute ideas in Phase 1 or build code in Phase 2. Both paths lead to recognition and rewards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* IDEathon Banner - Amber themed */}
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
                  Phase 1 · Weeks 1-3
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Cortex IDEathon
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
                  <Code2 className="text-blue-400" size={28} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-400 mb-2 block">
                  Phase 2 · Weeks 4-14
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
                    <span className="text-terminal-green font-semibold">$15,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-400">11 weeks</span>
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

      {/* Philosophy Section */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
              <Zap size={16} />
              Our Philosophy
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Not Your Average</span>{" "}
              <span className="text-brand-blue">Hackathon</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {hackathonConfig.philosophy.description}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional vs Code-First */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <span className="line-through opacity-50">Traditional Hackathons</span>
              </h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-red-400">✗</span>
                  <span>Pitch decks and business plans</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400">✗</span>
                  <span>Monetization strategy focus</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400">✗</span>
                  <span>Ideas without implementation</span>
                </li>
                <li className="flex items-start gap-3">
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
              <Quote className="absolute -top-4 -left-4 text-brand-blue/30" size={32} />
              <p className="text-2xl sm:text-3xl font-bold text-white italic">
                "{hackathonConfig.philosophy.principle}"
              </p>
              <Quote className="absolute -bottom-4 -right-4 text-brand-blue/30 rotate-180" size={32} />
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* Phase 1: IDEathon Section */}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-brand-blue text-sm mb-6">
              <Code2 size={16} />
              Phase 2
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="text-brand-blue">Cortex Hackathon</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Build, Demo, and Ship. Three stages to turn your code into production-ready contributions.
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
          <div className="grid md:grid-cols-3 gap-6">
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
              What Will You <span className="text-brand-blue">Build</span>?
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
                      track.difficulty === "Intermediate" ? "bg-blue-500/20 text-blue-400" :
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
                <p className="text-xl text-brand-blue font-medium mb-2">
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
                    <Quote className="absolute top-2 left-2 text-brand-blue/30" size={20} />
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
                      <CheckCircle2 size={16} className="text-brand-blue" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-sm mb-6">
              <Trophy size={16} />
              Why Participate
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              What You <span className="text-brand-blue">Get</span>
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

      {/* Roadmap Section */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6">
              <ListChecks size={16} />
              Launch Roadmap
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-brand-blue">Progress</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Track our preparation for the hackathon launch. We're building in public.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 max-w-xs h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-lg font-bold text-emerald-400" data-testid="roadmap-progress">
                {progressPercentage}%
              </span>
            </div>
          </motion.div>

          <div className="space-y-3" data-testid="roadmap-tasks">
            {roadmapTasks.map((task, index) => {
              const colors = categoryColors[task.category] || categoryColors.planning;
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${colors.border} ${colors.bg}`}
                  data-testid={`roadmap-task-${task.id}`}
                >
                  <div className="flex-shrink-0">
                    {task.status === "completed" ? (
                      <CheckCircle2 size={24} className="text-emerald-400" />
                    ) : task.status === "in-progress" ? (
                      <div className="relative">
                        <Circle size={24} className="text-amber-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <Circle size={24} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">#{task.number}</span>
                      <h4 className={`font-medium ${task.status === "completed" ? "text-gray-400 line-through" : "text-white"}`}>
                        {task.title}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{task.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {task.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Growth Strategy Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
              <TrendingUp size={16} />
              Global Reach
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Where We're <span className="text-brand-blue">Spreading the Word</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our multi-channel growth strategy ensures maximum visibility for your contributions.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {growthStrategy.map((channel, index) => {
              const Icon = platformIcons[channel.platform] || Globe;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <Icon className="text-purple-400" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{channel.platform}</h3>
                  <p className="text-xs text-gray-500 mb-3">{channel.description}</p>
                  <p className="text-sm text-gray-400 mb-3">{channel.strategy}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={14} className="text-terminal-green" />
                    <span className="text-sm text-terminal-green font-medium">{channel.expectedReach}</span>
                  </div>
                  {channel.links && channel.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {channel.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors"
                          data-testid={`link-growth-${channel.platform.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`}
                        >
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400">
              Total Expected Organic Reach:{" "}
              <span className="text-2xl font-bold text-terminal-green">225K+ developers</span>
            </p>
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
              Frequently Asked <span className="text-brand-blue">Questions</span>
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
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-8 py-4 bg-brand-blue hover:opacity-90 rounded-xl text-white font-semibold text-lg shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:shadow-[0_0_40px_rgba(0,102,255,0.6)] transition-all duration-300"
                data-testid="final-cta-github"
                onClick={() => {
                  analytics.trackCTAClick('start_building', 'hackathon_final_cta');
                  analytics.trackConversion('hackathon_signup');
                }}
              >
                <Github size={24} />
                Start Building Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
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
