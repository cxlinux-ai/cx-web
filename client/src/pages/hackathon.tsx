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
  Rocket,
  Brain,
  Terminal,
  Clock,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Lightbulb,
  Shield,
  Gift,
  MessageCircle,
  BookOpen,
  Award,
} from "lucide-react";
import Footer from "@/components/Footer";

const GITHUB_URL = "https://github.com/cortexlinux/cortex";
const GITHUB_ISSUES_URL = "https://github.com/cortexlinux/cortex/issues";

function CountdownTimer() {
  const getTimeLeft = () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 sm:p-4 min-w-[60px] sm:min-w-[80px]">
            <span className="text-2xl sm:text-4xl font-bold text-blue-400 font-mono">
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
          <ChevronUp className="text-blue-400 flex-shrink-0" size={20} />
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
      title: "Join Elite Builders",
      description: "Connect with 500+ developers who ship real products, not just tutorials.",
    },
    {
      icon: Trophy,
      title: "Get Recognized",
      description: "Top contributors get featured, bounties, and direct access to the core team.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: Star,
      title: "Star & Fork",
      description: "Star the repo and fork it to your GitHub account. Takes 30 seconds.",
      cta: "Star on GitHub",
      url: GITHUB_URL,
    },
    {
      number: "02",
      icon: Target,
      title: "Pick an Issue",
      description: "Browse open issues labeled 'good first issue' or 'hackathon'. Choose your challenge.",
      cta: "View Issues",
      url: GITHUB_ISSUES_URL,
    },
    {
      number: "03",
      icon: GitPullRequest,
      title: "Ship Your PR",
      description: "Submit your pull request. Get reviews from maintainers and iterate until merged.",
      cta: "Start Building",
      url: GITHUB_URL,
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
      question: "Do I need to be an expert developer?",
      answer: "Not at all! We have issues for all skill levels, from documentation improvements to complex features. If you can write code and use Git, you can contribute.",
    },
    {
      question: "Is this really free to participate?",
      answer: "100% free. This is open-source. You're contributing to a community project that benefits everyone. No fees, no catches.",
    },
    {
      question: "What if my PR doesn't get merged?",
      answer: "Every attempt is a learning opportunity. You'll get feedback from maintainers, and you can iterate. Many successful contributors started with rejected PRs.",
    },
    {
      question: "How do bounties work?",
      answer: "Some issues have monetary bounties attached (marked with 💰). Complete the issue, get the bounty. Simple. Check issue labels for current bounties.",
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
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-black"
                />
              ))}
            </div>
            <span className="text-sm text-gray-300">
              <span className="text-white font-semibold">500+</span> builders already participating
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
              Build AI Tools That Ship
            </span>
          </motion.h1>

          {/* Date Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-sm sm:text-base text-gray-500 tracking-widest uppercase mb-6"
          >
            February 11th, 2026 Hackathon
          </motion.p>

          {/* PAS: Agitate & Solution */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8"
          >
            Most developers never ship their AI projects. Join the builders who do.
            <span className="text-blue-400 font-medium"> Contribute to Cortex Linux</span> — the open-source AI layer for Linux.
          </motion.p>

          {/* Urgency: Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-sm text-gray-400 mb-4 flex items-center justify-center gap-2">
              <Clock size={16} className="text-blue-400" />
              Hackathon ends in:
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
              className="group flex items-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold text-lg shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-300"
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
              <p className="text-2xl sm:text-3xl font-bold text-white">1,200+</p>
              <p className="text-sm text-gray-400">GitHub Stars</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">89</p>
              <p className="text-sm text-gray-400">Contributors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">$3,000+</p>
              <p className="text-sm text-gray-400">In Bounties</p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="text-xs">Scroll to learn more</span>
            <ChevronDown size={20} className="animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Why Builders <span className="text-blue-400">Choose Cortex</span>
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
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="text-blue-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Start Shipping in <span className="text-blue-400">3 Steps</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              No applications. No waitlists. Just start building.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl font-bold text-blue-400/30 font-mono">{step.number}</span>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <step.icon className="text-blue-400" size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm mb-6 flex-grow">{step.description}</p>
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                    data-testid={`link-step-cta-${index + 1}`}
                  >
                    {step.cta}
                    <ArrowRight size={16} />
                  </a>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="text-blue-400/30" size={24} />
                  </div>
                )}
              </motion.div>
            ))}
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
              <p className="text-blue-400 mt-4">
                <span className="text-emerald-400">✓</span> Ready to build something amazing!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-blue-400">Track</span>
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
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
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
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6">
              <Sparkles size={16} />
              Limited spots remaining
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Stop Learning. <span className="text-blue-400">Start Shipping.</span>
            </h2>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              The best way to learn AI is to build with it. Join 500+ developers who are
              shipping real AI tools this week. Your first PR is waiting.
            </p>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold text-xl shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] transition-all duration-300"
              data-testid="final-cta-github"
            >
              <Github size={28} />
              Join the Hackathon
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <p className="text-gray-500 text-sm mt-6">
              No signup required. Just start contributing.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
