import { motion } from "framer-motion";
import { ArrowRight, Zap, Users, Github } from "lucide-react";

const GITHUB_URL = "https://github.com/cortexlinux/cortex";

export default function HackathonPreview() {

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="py-12 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="hackathon-card relative overflow-visible rounded-2xl p-[1px]">
          <div className="hackathon-gradient-border absolute inset-0 rounded-2xl" />
          
          <div className="relative z-10 rounded-2xl bg-black/90 backdrop-blur-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-sm font-medium text-blue-400">
                    <Zap size={14} className="animate-pulse" />
                    LIVE NOW
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                    <Users size={14} />
                    500+ builders
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Build with Cortex Hackathon
                </h3>
                
                <p className="text-gray-400 text-base md:text-lg">
                  Ship real AI projects. Join 500+ builders competing for prizes.
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  data-testid="link-join-hackathon"
                >
                  <Github size={18} />
                  Join the Hackathon
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
