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
      className="py-12 px-4"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          whileHover={{ y: -6, scale: 1.008 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="group relative"
        >
          {/* Animated pulse behind card - catches peripheral vision */}
          <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-r from-blue-500/5 via-purple-500/8 to-blue-500/5 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-1000 animate-pulse-slow" />
          
          {/* Animated gradient border with slow shift */}
          <div 
            className="absolute -inset-[1px] rounded-[28px] opacity-60 group-hover:opacity-100 blur-[1px] transition-opacity duration-500"
            style={{
              background: 'linear-gradient(90deg, #6b5bff, #00cfff, #6b5bff)',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 10s ease infinite',
            }}
          />
          
          {/* Secondary glow layer */}
          <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
          
          {/* Main card */}
          <div className="relative rounded-[26px] bg-[#08080c] border border-white/[0.08] overflow-hidden">
            {/* Animated top accent line with gradient shift */}
            <div 
              className="absolute top-0 left-0 right-0 h-[2px] opacity-90"
              style={{
                background: 'linear-gradient(90deg, transparent, #6b5bff, #00cfff, #6b5bff, transparent)',
                backgroundSize: '200% 100%',
                animation: 'gradientShift 10s ease infinite',
              }}
            />
            
            {/* Inner ambient glow - soft vertical glow from top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-b from-blue-500/[0.08] via-purple-500/[0.04] to-transparent blur-xl" />
            
            {/* Ambient blur / soft gradient behind content */}
            <div className="absolute inset-0 bg-gradient-radial from-blue-500/[0.03] via-transparent to-transparent" />
            
            <div className="relative px-8 py-10 md:px-12 md:py-14">
              {/* Hackathon badge with pulse glow */}
              <div className="flex justify-center mb-8">
                <motion.div 
                  className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/25"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Badge glow effect */}
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md animate-pulse-slow" />
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                  </span>
                  <span className="relative text-[13px] font-semibold text-blue-400 tracking-wide uppercase">
                    Hackathon · Feb 11, 2026
                  </span>
                </motion.div>
              </div>

              {/* Headline - Bold, 50px */}
              <motion.h3 
                className="text-white font-bold text-center mb-4 leading-tight"
                style={{ fontSize: '50px' }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                Build with <span className="gradient-text">Cortex</span>
              </motion.h3>
              
              {/* Value proposition - Light gray, increased line-height */}
              <p className="text-gray-400 text-center text-base md:text-lg max-w-lg mx-auto mb-10 leading-[1.8]">
                Crowdsource monetization strategies for Cortex Linux. Two-phase hackathon with <span className="text-white font-medium">$5,350</span> in prizes.
              </p>
              
              {/* Countdown timer with hover effects */}
              <div className="mb-10">
                <p className="text-sm text-gray-500 mb-5 flex items-center justify-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  Hackathon starts in:
                </p>
                <div className="flex gap-3 sm:gap-4 justify-center">
                  {Object.entries(countdown).map(([unit, value]) => (
                    <motion.div 
                      key={unit} 
                      className="text-center group/timer"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative">
                        {/* Glow behind numbers on hover */}
                        <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg opacity-0 group-hover/timer:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4 min-w-[55px] sm:min-w-[70px] group-hover/timer:border-blue-500/30 transition-colors duration-300">
                          <span className="text-xl sm:text-2xl font-bold text-blue-400 font-mono">
                            {String(value).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-500 mt-2 block capitalize">{unit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* CTA area with enhanced hover effects */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* Primary CTA with hover shadow pop */}
                <motion.a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-semibold text-[15px] transition-all duration-300 hover:bg-gray-50"
                  data-testid="link-hackathon-github"
                  whileHover={{ scale: 1.03, boxShadow: "0 20px 40px -10px rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Github size={18} strokeWidth={2.5} />
                  <span>Start Building</span>
                  <ArrowRight size={16} strokeWidth={2.5} className="opacity-60 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all duration-300" />
                </motion.a>
                
                {/* Secondary CTA */}
                <Link
                  href="/hackathon"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-[15px] text-gray-400 hover:text-white transition-colors duration-300 group/link"
                  data-testid="link-hackathon-details"
                >
                  <span>Learn more</span>
                  <ArrowRight size={14} strokeWidth={2} className="group-hover/link:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
