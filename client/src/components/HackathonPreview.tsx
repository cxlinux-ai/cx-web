import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { Link } from "wouter";

const GITHUB_URL = "https://github.com/cortexlinux/cortex";

export default function HackathonPreview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-6 px-4"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          whileHover={{ y: -4, scale: 1.005 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="group relative"
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Main card */}
          <div className="relative rounded-3xl bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/[0.06] overflow-hidden">
            {/* Subtle top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            
            {/* Inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-blue-500/[0.03] blur-3xl" />
            
            <div className="relative px-8 py-10 md:px-12 md:py-14">
              {/* Minimal status indicator */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="inline-flex items-center gap-2 text-[13px] text-gray-500 tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Open now
                </span>
                <span className="text-gray-700">·</span>
                <span className="text-[13px] text-gray-500 tracking-wide">
                  February 11, 2026
                </span>
                <span className="text-gray-700">·</span>
                <span className="text-[13px] text-gray-500 tracking-wide">
                  500+ builders
                </span>
              </div>

              {/* Headline - Clear and confident */}
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white text-center mb-4 tracking-tight">
                Cortex Hackathon
              </h3>
              
              {/* Value proposition - One clear sentence */}
              <p className="text-gray-400 text-center text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Build AI tools for Linux. Ship real code. Win $3,000+ in prizes.
              </p>
              
              {/* CTA area - Primary action emphasized, secondary deferred */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Primary CTA */}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-medium text-[15px] transition-all duration-200 hover:bg-gray-100 active:scale-[0.98]"
                  data-testid="link-hackathon-github"
                >
                  <Github size={18} strokeWidth={2} />
                  <span>Start Building</span>
                  <ArrowRight size={16} strokeWidth={2} className="opacity-60 group-hover/btn:translate-x-0.5 group-hover/btn:opacity-100 transition-all duration-200" />
                </a>
                
                {/* Secondary CTA - Visually deferred */}
                <Link
                  href="/hackathon"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] text-gray-400 hover:text-white transition-colors duration-200"
                  data-testid="link-hackathon-details"
                >
                  <span>Learn more</span>
                  <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
