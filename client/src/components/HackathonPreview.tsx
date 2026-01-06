import { motion } from "framer-motion";
import { ArrowRight, Github, Clock } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

const GITHUB_URL = "https://github.com/cortexlinux/cortex";
const HACKATHON_DATE = new Date("2026-02-11T00:00:00");

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

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
  }, [targetDate]);

  return timeLeft;
}

export default function HackathonPreview() {
  const countdown = useCountdown(HACKATHON_DATE);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-8 px-4"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          whileHover={{ y: -6, scale: 1.008 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="group relative"
        >
          {/* Animated gradient border - attention grabbing */}
          <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-500/40 opacity-60 group-hover:opacity-100 blur-[1px] transition-opacity duration-500 animate-gradient-shift" />
          
          {/* Secondary glow layer */}
          <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
          
          {/* Main card */}
          <div className="relative rounded-[26px] bg-[#08080c] border border-white/[0.08] overflow-hidden">
            {/* Animated top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />
            
            {/* Inner ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-b from-blue-500/[0.06] to-transparent" />
            
            <div className="relative px-6 py-8 md:px-10 md:py-12">
              {/* Hackathon badge - eye-catching */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                  </span>
                  <span className="text-[13px] font-medium text-blue-400 tracking-wide uppercase">
                    Hackathon · Feb 11, 2026
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-3 tracking-tight">
                Build with Cortex
              </h3>
              
              {/* Value proposition */}
              <p className="text-gray-400 text-center text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed">
                Ship real AI tools for Linux. Two-part hackathon with $3,000+ in prizes.
              </p>
              
              {/* Countdown timer */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <Clock size={14} className="text-gray-500" />
                <span className="text-[13px] text-gray-500">Starts in</span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-sm font-mono font-medium text-white">
                    {countdown.days}d
                  </span>
                  <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-sm font-mono font-medium text-white">
                    {countdown.hours}h
                  </span>
                  <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-sm font-mono font-medium text-white">
                    {countdown.minutes}m
                  </span>
                  <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-sm font-mono font-medium text-gray-400">
                    {countdown.seconds}s
                  </span>
                </div>
              </div>
              
              {/* CTA area */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Primary CTA */}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-medium text-[15px] transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] shadow-lg shadow-white/10"
                  data-testid="link-hackathon-github"
                >
                  <Github size={18} strokeWidth={2} />
                  <span>Start Building</span>
                  <ArrowRight size={16} strokeWidth={2} className="opacity-60 group-hover/btn:translate-x-0.5 group-hover/btn:opacity-100 transition-all duration-200" />
                </a>
                
                {/* Secondary CTA */}
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
