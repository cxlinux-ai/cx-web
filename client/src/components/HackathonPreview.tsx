import { motion } from "framer-motion";
import { ArrowRight, Zap, Users, Github, Calendar, Info } from "lucide-react";
import { Link } from "wouter";

const GITHUB_URL = "https://github.com/cortexlinux/cortex";

export default function HackathonPreview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="py-8 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <div className="hackathon-card relative overflow-visible rounded-2xl p-[2px]">
          <div className="hackathon-gradient-border absolute inset-0 rounded-2xl" />
          
          <div className="relative z-10 rounded-2xl bg-gradient-to-br from-black/95 via-blue-950/20 to-purple-950/20 backdrop-blur-xl p-8 md:p-10">
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-sm font-medium text-blue-400">
                  <Zap size={14} className="animate-pulse" />
                  LIVE NOW
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                  <Calendar size={14} />
                  February 11th, 2026
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                  <Users size={14} />
                  500+ builders
                </span>
              </div>
              
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                Build with Cortex <span className="gradient-text">Hackathon</span>
              </h3>
              
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-6">
                Ship real AI tools that work on Linux. Join 500+ builders competing for $3,000+ in prizes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  data-testid="link-hackathon-github"
                >
                  <Github size={20} />
                  Participate on GitHub
                  <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link
                  href="/hackathon"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  data-testid="link-hackathon-details"
                >
                  <Info size={20} />
                  More Details
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
