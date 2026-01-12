import { motion } from "framer-motion";
import { ArrowRight, Github, Clock } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import RegistrationModal from "./RegistrationModal";

const GITHUB_URL = "https://github.com/cortexlinux/cortex";
const HACKATHON_DATE = new Date("2026-02-17T00:00:00");

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <RegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        redirectUrl={GITHUB_URL}
      />
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="py-12 px-4"
        style={{ perspective: "1000px" }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            whileHover={{ 
              y: -6, 
              rotateX: 2, 
              rotateY: -1,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            className="group relative"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Base shadow layer - realistic elevation */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
              style={{ 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 12px 24px -8px rgba(0, 0, 0, 0.3)",
                transform: "translateZ(-20px)",
              }}
            />
            
            {/* Ambient glow layer - subsurface lighting effect */}
            <motion.div 
              className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0,102,255,0.08), rgba(0,102,255,0.05), transparent 70%)",
                filter: "blur(30px)",
                transform: "translateZ(-15px)",
              }}
            />
            
            {/* Animated gradient border - brand blue 3D effect */}
            <div 
              className="absolute -inset-[1px] rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #0066FF, #0066FF, #0066FF, #0066FF)',
                backgroundSize: '300% 300%',
                animation: 'gradientShift 8s ease infinite',
              }}
            />
            
            {/* Main card - mid layer */}
            <div 
              className="relative rounded-2xl bg-[#0a0a0f] border border-white/[0.05] overflow-hidden"
              style={{ 
                transform: "translateZ(0)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Top reflection line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              
              {/* Gradient reflection overlay - top accent */}
              <div 
                className="absolute top-0 left-0 right-0 h-1/3 opacity-30 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(0,102,255,0.08), rgba(0,102,255,0.06), transparent)",
                  filter: "blur(20px)",
                }}
              />
              
              {/* Ambient glow - subsurface lighting */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-40 opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at top, rgba(0,102,255,0.06), transparent)",
                  filter: "blur(25px)",
                }}
              />
              
              <div className="relative px-8 py-10 md:px-12 md:py-14">
                {/* Headline - Bold */}
                <h3 
                  className="text-white font-bold text-center mb-3 leading-tight"
                  style={{ fontSize: '46px' }}
                >
                  Shape the <span className="gradient-text">future of Cortex Linux</span>
                </h3>
                <p className="text-center text-xl md:text-2xl font-semibold text-gray-300 mb-6">
                  <span className="text-terminal-green">$15,000 in Prizes</span> · First AI Linux Hackathon
                </p>
                
                {/* Value proposition */}
                <p className="text-gray-400 text-center text-base md:text-lg max-w-lg mx-auto mb-10 leading-[1.8]">
                  Build monetization strategies & production features for Cortex. Two phases. Real impact. Real rewards.
                </p>
                
                {/* Countdown timer */}
                <div className="mb-10">
                  {/* Hackathon badge */}
                  <div className="flex justify-center mb-4">
                    <motion.div 
                      className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20"
                      whileHover={{ scale: 1.03, y: -2 }}
                      transition={{ duration: 0.2 }}
                      style={{ boxShadow: "0 4px 12px rgba(0,102,255,0.15)" }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue" />
                      </span>
                      <span className="relative text-[13px] font-semibold text-brand-blue tracking-wide uppercase">
                        Hackathon · Feb 17, 2026
                      </span>
                    </motion.div>
                  </div>
                  <p className="text-sm text-gray-500 mb-5 flex items-center justify-center gap-2">
                    <Clock size={16} className="text-brand-blue" />
                    Hackathon starts in:
                  </p>
                  <div className="flex gap-3 sm:gap-4 justify-center">
                    {Object.entries(countdown).map(([unit, value]) => (
                      <motion.div 
                        key={unit} 
                        className="text-center group/timer"
                        whileHover={{ y: -2, scale: 1.05 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div 
                          className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 min-w-[70px] sm:min-w-[90px] group-hover/timer:border-brand-blue/20 group-hover/timer:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 flex flex-col items-center"
                          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                        >
                          <span className="font-bold text-brand-blue font-mono" style={{ fontSize: '70px' }}>
                            {String(value).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 capitalize">{unit}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* CTA area with 3D buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {/* Primary CTA - 3D button */}
                  <motion.button
                    onClick={() => setIsModalOpen(true)}
                    className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-transparent border-2 border-white text-white font-semibold text-[15px] cursor-pointer hover:bg-white/25 hover:backdrop-blur-md transition-all duration-300"
                    data-testid="button-start-building"
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Github size={18} strokeWidth={2.5} />
                    <span>Start Building Now</span>
                    <ArrowRight size={16} strokeWidth={2.5} className="opacity-60 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all duration-300" />
                  </motion.button>
                  
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
    </>
  );
}
