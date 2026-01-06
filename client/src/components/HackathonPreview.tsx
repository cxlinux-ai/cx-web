import { motion } from "framer-motion";
import { ArrowRight, Github, Clock, Trophy, Users, Zap } from "lucide-react";
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

  const stats = [
    { icon: Trophy, value: "$5.35K", label: "Prizes" },
    { icon: Users, value: "1,000+", label: "Builders" },
    { icon: Zap, value: "13", label: "Weeks" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          whileHover={{ y: -4, scale: 1.005 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="group relative"
        >
          {/* Animated gradient border */}
          <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-emerald-500/50 opacity-60 group-hover:opacity-100 blur-[1px] transition-opacity duration-500 animate-gradient-shift" />
          
          {/* Outer glow on hover */}
          <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-r from-blue-500/5 via-purple-500/8 to-emerald-500/5 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700" />
          
          {/* Main card */}
          <div className="relative rounded-[26px] bg-gradient-to-b from-[#0a0a10] to-[#080810] border border-white/[0.08] overflow-hidden">
            {/* Top accent line with animation */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />
            
            {/* Radial glow from top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-60 bg-gradient-to-b from-blue-500/[0.08] via-purple-500/[0.03] to-transparent rounded-full blur-2xl" />
            
            <div className="relative px-6 py-10 md:px-12 md:py-14">
              {/* Top row: Badge + Stats */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                {/* Hackathon badge */}
                <div className="flex justify-center md:justify-start">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/25 shadow-lg shadow-blue-500/10">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[13px] font-semibold text-white/90 tracking-wide uppercase">
                      Hackathon · Feb 11, 2026
                    </span>
                  </div>
                </div>

                {/* Mini stats row */}
                <div className="flex items-center justify-center md:justify-end gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <stat.icon size={16} className="text-blue-400" />
                      <div className="text-left">
                        <span className="text-white font-bold text-sm">{stat.value}</span>
                        <span className="text-gray-500 text-xs ml-1">{stat.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="text-center mb-10">
                {/* Headline with gradient */}
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                  Build the Future of
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"> Linux AI</span>
                </h3>
                
                {/* Value proposition */}
                <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                  Help shape <span className="text-emerald-400 font-medium">monetization strategies</span> for Cortex Linux.
                  Turn your ideas into production code.
                </p>
              </div>
              
              {/* Countdown timer - premium style */}
              <div className="mb-10">
                <p className="text-xs text-gray-500 mb-4 flex items-center justify-center gap-2 uppercase tracking-widest font-medium">
                  <Clock size={14} className="text-blue-400" />
                  Starts in
                </p>
                <div className="flex gap-3 sm:gap-4 justify-center">
                  {Object.entries(countdown).map(([unit, value]) => (
                    <div key={unit} className="text-center group/timer">
                      <div className="relative">
                        {/* Subtle glow behind number */}
                        <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl opacity-0 group-hover/timer:opacity-100 transition-opacity" />
                        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl px-3 py-3 sm:px-5 sm:py-4 min-w-[58px] sm:min-w-[76px] hover:border-blue-500/30 transition-colors">
                          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">
                            {String(value).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-500 mt-2 block uppercase tracking-wider font-medium">{unit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* CTA area with divider */}
              <div className="relative">
                {/* Subtle divider */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                  {/* Primary CTA - Blue gradient */}
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-[15px] transition-all duration-300 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    data-testid="link-hackathon-github"
                  >
                    <Github size={18} strokeWidth={2.5} />
                    <span>Start Building</span>
                    <ArrowRight size={16} strokeWidth={2.5} className="opacity-70 group-hover/btn:translate-x-0.5 group-hover/btn:opacity-100 transition-all duration-200" />
                  </a>
                  
                  {/* Secondary CTA */}
                  <Link
                    href="/hackathon"
                    className="group/link w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-[15px] text-gray-400 hover:text-white border border-transparent hover:border-white/10 rounded-xl transition-all duration-200"
                    data-testid="link-hackathon-details"
                  >
                    <span>View Details</span>
                    <ArrowRight size={14} strokeWidth={2} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
