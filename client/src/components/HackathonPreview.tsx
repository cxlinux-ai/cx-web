import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="py-16 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="group relative"
        >
          {/* Outer ambient pulse - subtle depth */}
          <div 
            className="absolute -inset-12 rounded-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08), transparent 70%)',
            }}
          />
          
          {/* Animated gradient border - slow shifting */}
          <div 
            className="absolute -inset-[2px] rounded-[32px] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)',
              backgroundSize: '300% 300%',
              animation: 'gradientShift 8s ease infinite',
            }}
          />
          
          {/* Inner glow layer */}
          <div className="absolute -inset-[1px] rounded-[31px] bg-[#0a0a0f] opacity-95" />
          
          {/* Main card */}
          <div className="relative rounded-[30px] bg-gradient-to-b from-[#0f0f18] to-[#08080c] border border-white/[0.06] overflow-hidden">
            
            {/* Top accent glow */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 opacity-60"
              style={{
                background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15), transparent 70%)',
              }}
            />
            
            {/* Content with generous whitespace */}
            <div className="relative px-10 py-14 md:px-16 md:py-20 text-center">
              
              {/* Small badge - secondary */}
              <div className="mb-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wide uppercase">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
                  </span>
                  Feb 11, 2026
                </span>
              </div>

              {/* Headline - DOMINANT */}
              <h3 
                className="text-white font-bold tracking-tight mb-4"
                style={{ fontSize: '52px', lineHeight: '1.1' }}
              >
                Build with <span className="gradient-text">Cortex</span>
              </h3>
              
              {/* Subheadline - secondary, muted */}
              <p className="text-gray-500 text-lg max-w-md mx-auto mb-12 leading-relaxed">
                Crowdsource monetization strategies. Win <span className="text-gray-300">$5,350</span> in prizes.
              </p>
              
              {/* Countdown - minimal, secondary */}
              <div className="flex justify-center gap-6 mb-14">
                {Object.entries(countdown).map(([unit, value]) => (
                  <div key={unit} className="text-center">
                    <div className="text-2xl font-mono font-bold text-white/80">
                      {String(value).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">{unit}</div>
                  </div>
                ))}
              </div>
              
              {/* CTA - DOMINANT */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-semibold text-base transition-all duration-300"
                  data-testid="link-hackathon-github"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 0 40px rgba(255,255,255,0.1)',
                  }}
                >
                  <Github size={20} strokeWidth={2} />
                  <span>Start Building</span>
                  <ArrowRight size={18} className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300" />
                </motion.a>
                
                <Link
                  href="/hackathon"
                  className="inline-flex items-center gap-2 px-6 py-4 text-gray-500 hover:text-white text-sm transition-colors duration-300"
                  data-testid="link-hackathon-details"
                >
                  Learn more
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
