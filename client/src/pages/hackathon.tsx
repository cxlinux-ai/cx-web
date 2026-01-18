import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  Mail,
  Handshake,
  Building,
  Megaphone,
  Puzzle,
  Workflow,
  Building2,
  Heart,
  Crown,
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
  ideathonPrizeCategories,
  builderPack,
  categoryPrizes,
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
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className={isOpen ? "text-blue-300" : "text-gray-400"} size={20} />
        </motion.span>
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

interface TeamMember {
  name: string;
  aka: string;
  role: string;
  shortDescription: string;
  fullDescription: string;
  avatar: string;
  github: string;
  highlight: boolean;
  expertise: string[];
}

const teamMembers: TeamMember[] = [
  {
    name: "Mike Morgan",
    aka: "AI Data God",
    role: "CEO & Founder",
    shortDescription: "Visionary leader driving Cortex Linux's mission forward.",
    fullDescription: "Visionary leader driving Cortex Linux's mission to revolutionize how developers interact with Linux systems through AI. Mike brings years of experience in AI and data science, having worked on cutting-edge projects that bridge the gap between human intent and machine execution. His vision for Cortex is to make Linux accessible to everyone through natural language.",
    avatar: "/images/mike.png",
    github: "mikejmorgan-ai",
    highlight: true,
    expertise: ["AI/ML", "Data Science", "Linux Systems", "Product Strategy", "Sales & Fundraising"]
  },
  {
    name: "Santiago",
    aka: "Jorg",
    role: "Co-Founder & Marketing Manager",
    shortDescription: "Co-founded the hackathon and manages all logistics.",
    fullDescription: "Co-founded the hackathon concept with Suyash and built the entire workflow and structure. Manages the website, contestants, and all logistics. Jorg's dedication to community building has been instrumental in growing the Cortex ecosystem. He handles everything from participant onboarding to prize distribution, ensuring a smooth experience for all hackathon participants.",
    avatar: "/images/santiago.png",
    github: "jorg-4",
    highlight: true,
    expertise: ["Marketing", "Community Building", "Event Management", "Growth"]
  },
  {
    name: "Suyash Dongre",
    aka: "Winner of India's Largest Hackathon",
    role: "Judge, Reviewer & Manager",
    shortDescription: "Smart India Hackathon Grand Final Winner.",
    fullDescription: "Smart India Hackathon Grand Final Winner who competed against 300,000+ contestants. Brings competitive hackathon experience to judging. Suyash understands what it takes to win at the highest level and brings that perspective to evaluating submissions. His technical expertise and fair judgment ensure that the best projects rise to the top.",
    avatar: "/images/suyash-d.png",
    github: "Suyashd999",
    highlight: false,
    expertise: ["Hackathons", "Full-Stack Dev", "Problem Solving", "Judging"]
  },
  {
    name: "Sahil",
    aka: "The Pioneer",
    role: "Developer & Judge",
    shortDescription: "Cortex's first contributor and core developer.",
    fullDescription: "Cortex's first contributor who has been part of the team since day one as a core developer. Beyond his development work, Sahil has helped gather partners and sponsors for the hackathon. His early belief in the project helped shape its technical direction, and he continues to contribute code while supporting the hackathon's growth.",
    avatar: "/images/sahil.png",
    github: "sahil",
    highlight: false,
    expertise: ["Full-Stack Dev", "Open Source", "Partner Relations", "Code Review"]
  },
  {
    name: "Dhruv",
    aka: "Expert Dev",
    role: "Judge, Reviewer & Manager",
    shortDescription: "Technical expert overseeing review logistics.",
    fullDescription: "Technical expert who oversees review logistics, ensuring fair and thorough evaluation of all submissions with deep attention to code quality. Dhruv's meticulous approach to code review means every submission gets the attention it deserves. He's developed the evaluation criteria that helps judges assess projects consistently and fairly.",
    avatar: "/assets/dhruv.png",
    github: "Dhruv-89",
    highlight: false,
    expertise: ["Code Review", "Backend Dev", "System Design", "Quality Assurance"]
  },
  {
    name: "Ansh Grover",
    aka: "The Gatekeeper",
    role: "Main Reviewer & PR Merger",
    shortDescription: "Ensures code quality across all submissions.",
    fullDescription: "Ensures code quality and consistency across all submissions. Reviews every pull request with meticulous attention to detail before merging. As the main PR merger, Ansh is the final checkpoint before code becomes part of Cortex. His standards ensure that all contributions meet the project's quality bar.",
    avatar: "https://github.com/Anshgrover23.png",
    github: "Anshgrover23",
    highlight: false,
    expertise: ["Code Review", "Git Workflow", "CI/CD", "Documentation"]
  }
];

function TeamAccordion() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {teamMembers.map((member, index) => (
        <TeamMemberCard
          key={member.name}
          member={member}
          index={index}
          isExpanded={expandedIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}

function TeamMemberCard({ 
  member, 
  index, 
  isExpanded, 
  onToggle 
}: { 
  member: TeamMember; 
  index: number; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      key={member.name}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`relative group ${member.highlight ? 'lg:scale-105' : ''}`}
      data-testid={`team-member-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${member.highlight ? 'from-blue-500/20 via-purple-500/10 to-cyan-500/20' : 'from-white/5 to-white/0'} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <motion.div
        layout
        transition={{ 
          layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }}
        onClick={onToggle}
        className={`relative bg-gradient-to-br ${member.highlight ? 'from-blue-500/10 via-transparent to-purple-500/10 border-blue-500/30' : 'from-white/5 to-white/[0.02] border-white/10'} backdrop-blur-xl border rounded-3xl p-8 hover:border-blue-400/40 transition-all duration-500 h-full cursor-pointer`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <motion.div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.highlight ? 'from-blue-500 to-purple-500' : 'from-blue-500/50 to-cyan-500/50'} opacity-30 group-hover:opacity-50 transition-opacity`}
              animate={{ 
                filter: isExpanded ? 'blur(20px)' : 'blur(12px)',
                scale: isExpanded ? 1.15 : 1
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <img
              src={member.avatar}
              alt={member.name}
              className={`relative w-24 h-24 rounded-full object-cover object-top ring-4 ${member.highlight ? 'ring-blue-500/50' : 'ring-white/10'} group-hover:ring-blue-400/50 transition-all duration-300 shadow-2xl`}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=fff&size=96`;
              }}
            />
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full ${member.highlight ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-blue-500'} flex items-center justify-center shadow-lg`}>
              <Sparkles size={14} className="text-white" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
          <p className="text-blue-300 text-sm italic mb-3">"{member.aka}"</p>
          
          <span className={`inline-block px-4 py-1.5 rounded-full ${member.highlight ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200' : 'bg-blue-500/20 text-blue-300'} text-xs font-semibold mb-4`}>
            {member.role}
          </span>
          
          <motion.div
            initial={false}
            animate={{ 
              height: isExpanded ? 'auto' : '4.5rem',
              filter: isExpanded ? 'blur(0px)' : 'blur(0px)'
            }}
            transition={{ 
              duration: 0.55, 
              ease: [0.22, 1, 0.36, 1]
            }}
            className="overflow-hidden"
          >
            <motion.p 
              className="text-gray-400 text-sm leading-relaxed mb-4"
              initial={false}
              animate={{ 
                opacity: 1,
                filter: 'blur(0px)'
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {isExpanded ? member.fullDescription : member.shortDescription}
            </motion.p>
            
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                  transition={{ 
                    duration: 0.45, 
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="mt-4"
                >
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wide mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.map((skill, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.7, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ 
                          delay: i * 0.06, 
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <button
            className="inline-flex items-center gap-1 mt-3 text-blue-400 hover:text-blue-300 text-xs transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? 'Show less' : 'Learn more'}
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>
          
          <a
            href={`https://github.com/${member.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/30 text-gray-400 hover:text-white text-sm transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Github size={16} />
            @{member.github}
          </a>
        </div>
      </motion.div>
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
            className="flex items-center justify-center gap-3 mb-6 py-2.5"
          >
            <div className="flex -space-x-3">
              {[
                { name: "Mike", avatar: "/images/mike.png" },
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
              <span className="text-white font-semibold">5,000+</span> participants expected
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
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 leading-tight"
          >
            <span className="text-white">The First</span> <span className="gradient-text">AI Linux Hackathon</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="text-xl sm:text-2xl md:text-3xl text-blue-300 font-semibold tracking-wide mb-4"
          >
            Worldwide
          </motion.p>

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
            <Link
              href="/hackathon-rules"
              className="flex items-center gap-2 px-5 py-3 border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 rounded-xl text-amber-400 font-medium transition-colors"
              data-testid="view-rules-link"
              onClick={() => {
                analytics.trackCTAClick('view_rules', 'hackathon_hero');
              }}
            >
              <FileText size={18} />
              Rules
            </Link>
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
              <span className="text-terminal-green font-semibold">$18,700</span> in Prizes
            </span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-2 text-sm">
              <Users size={16} className="text-blue-300" />
              Open to Everyone
            </span>
          </motion.div>

          {/* $5 Credit Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
            data-testid="hero-credit-badge"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Gift size={18} className="text-cyan-400" />
              <span className="text-cyan-300 font-semibold text-sm">$5 Cortex Credit</span>
              <span className="text-gray-400 text-sm">for all participants</span>
            </div>
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
      {/* Builder Pack Section */}
      <section className="py-16 px-4 relative overflow-hidden" id="builder-pack" data-testid="builder-pack-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm mb-6">
              <Gift size={16} />
              Everyone Gets Perks
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {builderPack.title}
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {builderPack.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {builderPack.perks.map((perk, index) => {
              const IconComponent = perk.icon === "Zap" ? Zap 
                : perk.icon === "MessageSquare" ? MessageSquare 
                : perk.icon === "BookOpen" ? BookOpen 
                : Users;
              const isCredit = perk.title.includes("$5");
              
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative group ${isCredit ? 'col-span-2 lg:col-span-1' : ''}`}
                  data-testid={`perk-card-${perk.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {isCredit && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                  )}
                  <div className={`relative h-full bg-white/5 backdrop-blur-xl border ${isCredit ? 'border-cyan-500/40' : 'border-white/10'} rounded-2xl p-6 hover:border-cyan-400/40 transition-all duration-300`}>
                    <div className={`w-12 h-12 rounded-xl ${isCredit ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30' : 'bg-white/10'} flex items-center justify-center mb-4`}>
                      <IconComponent size={24} className={isCredit ? 'text-cyan-300' : 'text-blue-300'} />
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isCredit ? 'text-cyan-300' : 'text-white'}`}>
                      {perk.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{perk.description}</p>
                    {isCredit && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                          <Sparkles size={12} />
                          FREE
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300"
              data-testid="builder-pack-register-cta"
            >
              <ClipboardList size={18} />
              Claim Your Builder Pack
              <ArrowRight size={18} />
            </Link>
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
                    <span className="text-terminal-green font-semibold">$10K cash + prizes</span>
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
                    <span className="text-terminal-green font-semibold">$3,800 in prizes</span>
                    <span className="text-gray-500">Top 30 ideas win</span>
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
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <span className="text-terminal-green font-semibold">$10K cash + $4.9K worth of prizes</span>
                    <span className="text-gray-500">1st: $5K, 2nd: $3K, 3rd: $2K | 4th-10th: $700 worth of goodies + 2 months managed service</span>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Trophy className="text-amber-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Prize Pool</h3>
                  </div>
                  <span className="text-2xl font-bold text-terminal-green">{ideathonPhase.prizeTotal}</span>
                </div>
                
                {ideathonPhase.prizeExplanation && (
                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                    {ideathonPhase.prizeExplanation}
                  </p>
                )}

                <div className="space-y-4">
                  {ideathonPrizeCategories.map((category, catIndex) => (
                    <div key={catIndex} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-amber-400 font-semibold text-sm mb-1">{category.heading}</h4>
                      <p className="text-gray-500 text-xs mb-3">{category.description}</p>
                      <div className="space-y-2">
                        {category.prizes.map((prize, prizeIndex) => (
                          <div key={prizeIndex} className="flex justify-between items-center">
                            <span className="text-gray-300 text-sm">{prize.place}</span>
                            <span className="text-terminal-green font-bold">{prize.amount}</span>
                          </div>
                        ))}
                      </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
            {buildTracks.map((track, index) => {
              const Icon = trackIcons[track.id] || Terminal;
              const spanClasses = 
                track.id === "cli-commands" ? "lg:col-span-3 lg:row-span-2" :
                track.id === "plugins" ? "lg:col-span-3" :
                track.id === "ai-integrations" ? "lg:col-span-3" :
                "lg:col-span-6";
              const isLarge = track.id === "cli-commands";
              const isFullWidth = track.id === "infra-tools";
              
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`track-${track.id}`}
                  className={`${spanClasses} bg-gradient-to-br ${
                    track.id === "cli-commands" ? "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20" :
                    track.id === "plugins" ? "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20" :
                    track.id === "ai-integrations" ? "from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20" :
                    "from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20"
                  } border rounded-2xl p-6 hover:bg-white/5 transition-all group`}
                >
                  <div className={`flex ${isFullWidth ? "flex-col sm:flex-row sm:items-start gap-6" : "flex-col"}`}>
                    <div className={`flex-shrink-0 ${isFullWidth ? "" : ""}`}>
                      <div className={`${isLarge ? "w-16 h-16" : "w-12 h-12"} rounded-xl ${track.color.replace('text-', 'bg-').replace('-400', '-500/20').replace('-300', '-500/20')} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={track.color} size={isLarge ? 32 : 24} />
                      </div>
                      <div className="mb-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          track.difficulty === "Beginner" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          track.difficulty === "Intermediate" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                          "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        }`}>
                          {track.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`${isLarge ? "text-xl" : "text-lg"} font-bold text-white mb-2`}>{track.title}</h3>
                      <p className={`${isLarge ? "text-base" : "text-sm"} text-gray-400 mb-4`}>{track.description}</p>
                      
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Examples</h4>
                        <ul className={`${isFullWidth ? "grid sm:grid-cols-3 gap-2" : "space-y-1.5"}`}>
                          {track.examples.map((example, i) => (
                            <li key={i} className={`${isLarge ? "text-sm" : "text-xs"} text-gray-400 flex items-start gap-2`}>
                              <span className={`${track.color} mt-0.5`}>•</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Category Prize Awards Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-blue-950/10 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
              <Crown size={16} />
              Category Awards
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              More Ways to <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Win</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Separate from main prizes — win in your specialty and get Cortex Linux Premium
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {categoryPrizes.map((category, index) => {
              const iconMap: Record<string, typeof Trophy> = {
                Puzzle,
                Workflow,
                Building2,
                Heart,
              };
              const Icon = iconMap[category.icon] || Trophy;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/5 backdrop-blur-sm border ${category.borderColor} rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02] group`}
                >
                  <div className={`w-14 h-14 rounded-xl ${category.color.replace('text-', 'bg-').replace('-400', '-500/20')} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={category.color} size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{category.description}</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <Sparkles size={14} className={category.color} />
                    <span className={`text-sm font-semibold ${category.color}`}>{category.prize}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-gray-500 mt-8"
          >
            Category winners are additional to main hackathon prizes — you can win both!
          </motion.p>
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
      {/* Referral Program - Unlock Rewards */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            data-testid="hackathon-referral-snippet"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                      <Gift size={24} className="text-purple-400" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                      <Users size={14} className="text-blue-300" />
                      <span className="text-sm text-gray-300">
                        <span className="text-white font-semibold">127</span> builders already sharing
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Your Network = Your Advantage
                  </h3>
                  <p className="text-gray-400 mb-2 max-w-lg">
                    The builders who win big aren't just skilled — they build communities. Each friend you bring earns you real rewards while expanding the hackathon ecosystem.
                  </p>
                  <p className="text-gray-300 text-sm mb-4 max-w-lg">
                    <span className="text-emerald-400 font-medium">No cap on rewards.</span> Top referrers from past events have earned over $200 in credits and full Premium bundles.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                    <div className="flex items-center gap-1.5 text-amber-400/90">
                      <Zap size={14} />
                      <span>Only 50 spots at Legendary tier</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-white/20" />
                    <div className="flex items-center gap-1.5 text-blue-300/80">
                      <Clock size={14} />
                      <span>Referrals close 3 days before deadline</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/referrals"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/20"
                      data-testid="hackathon-referral-cta"
                      onClick={() => analytics.trackCTAClick('get_referral_link', 'hackathon_page')}
                    >
                      <Sparkles size={18} />
                      Get Your Link
                      <ArrowRight size={16} />
                    </Link>
                    <span className="text-xs text-gray-500">
                      Takes 10 seconds · No email required
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0 lg:w-80">
                  <div className="space-y-3">
                    <div className="bg-white/5 border border-emerald-500/30 rounded-xl p-4 relative">
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Gift size={18} className="text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-xs text-emerald-400 font-medium">5 Referrals</div>
                          <div className="text-white font-semibold">$20 Credit</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-purple-500/30 rounded-xl p-4 relative opacity-80">
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-500/50 flex items-center justify-center border border-purple-400/50">
                        <Star size={12} className="text-purple-300" />
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Star size={18} className="text-purple-400" />
                        </div>
                        <div>
                          <div className="text-xs text-purple-400 font-medium">20 Referrals</div>
                          <div className="text-white font-semibold">Exclusive Goodies</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full w-1/4" />
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative opacity-60">
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                        <Trophy size={12} className="text-gray-400" />
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                          <Trophy size={18} className="text-yellow-500/50" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-medium">50 Referrals</div>
                          <div className="text-gray-400 font-semibold">Premium Bundle</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-yellow-500/50 h-1.5 rounded-full w-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Meet the Team Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-blue-950/20 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 text-sm mb-6">
              <Users size={16} />
              The People Behind the Hackathon
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Meet the <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Team</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Click on any card to learn more about our team members
            </p>
          </motion.div>

          <TeamAccordion />
        </div>
      </section>
      {/* Long-term Relationship Messaging */}
      <section className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terminal-green/10 border border-terminal-green/30 text-terminal-green text-sm mb-6">
              <Handshake size={16} />
              Beyond the Hackathon
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Build a <span className="text-terminal-green">Lasting Relationship</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Top performers aren't just winning prizes — they're opening doors to ongoing opportunities with Cortex Linux
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-terminal-green/10 to-emerald-900/5 border border-terminal-green/20 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-terminal-green/20 flex items-center justify-center mx-auto mb-4">
                <GitPullRequest size={28} className="text-terminal-green" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Long-term Contracts</h3>
              <p className="text-sm text-gray-400">
                Outstanding contributors may be considered for ongoing development contracts with Cortex Linux
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-900/5 border border-blue-500/20 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ongoing Relationships</h3>
              <p className="text-sm text-gray-400">
                Join our inner circle of contributors with direct access to the core team and roadmap discussions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-900/5 border border-purple-500/20 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Rocket size={28} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Future Collaborations</h3>
              <p className="text-sm text-gray-400">
                Be first in line for future projects, beta features, and collaborative opportunities
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
          >
            <p className="text-sm text-gray-400">
              <span className="text-terminal-green font-medium">Note:</span> Specific opportunities are discussed individually based on hackathon performance and project alignment with Cortex Linux goals
            </p>
          </motion.div>
        </div>
      </section>
      {/* Partner/Sponsor Section */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
              <Handshake size={16} />
              Partnership Opportunities
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Partner With <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Cortex Linux</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join our hackathon as a partner and connect with {hackathonConfig.expectedParticipants} talented developers, designers, and innovators
            </p>
          </motion.div>

          {/* Partner Categories */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-900/5 border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Building size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Universities</h3>
              <p className="text-sm text-gray-400 mb-4">
                Promote your CS/engineering programs to engaged student developers. Great for recruitment and visibility.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" />
                  Logo on website
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" />
                  Social media shoutouts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" />
                  Discord announcement
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-900/5 border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Star size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tech Partners</h3>
              <p className="text-sm text-gray-400 mb-4">
                Showcase your tools, APIs, or services to developers actively building projects.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400" />
                  Prominent branding
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400" />
                  Track sponsorship options
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400" />
                  Direct participant access
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-pink-500/10 to-pink-900/5 border border-pink-500/20 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                <Megaphone size={24} className="text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Influencers</h3>
              <p className="text-sm text-gray-400 mb-4">
                Tech content creators can partner with us to promote the hackathon and Cortex Linux.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-pink-400" />
                  Co-marketing opportunities
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-pink-400" />
                  Community crossover
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-pink-400" />
                  Exclusive content access
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Partnership CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Interested in Partnering?</h3>
            <p className="text-gray-400 max-w-xl mx-auto mb-6">
              We discuss partnership terms individually to ensure mutual benefit. Reach out and let's explore how we can work together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:partnerships@cortexlinux.com?subject=Hackathon Partnership Inquiry"
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-medium transition-colors"
                data-testid="cta-partnership-email"
              >
                <Mail size={18} />
                partnerships@cortexlinux.com
              </a>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 rounded-xl text-white font-medium transition-colors"
                data-testid="cta-partnership-discord"
              >
                <FaDiscord size={18} />
                Join Discord to Chat
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              All partnerships include website visibility, social media mentions, and Discord announcements
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
