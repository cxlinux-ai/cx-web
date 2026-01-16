import { motion } from "framer-motion";
import { ArrowRight, Github, Clock } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 1;
    const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * 1;
    setTransform({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="py-12 px-4"
        style={{ perspective: "1200px" }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="group relative rounded-2xl"
            style={{
              transform: `perspective(1200px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateY(${isHovered ? -6 : 0}px)`,
              transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* 3D Border effect - light edge on top/left, shadow on bottom/right */}
            <div 
              className="absolute -inset-[1px] rounded-2xl pointer-events-none transition-all duration-500"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `linear-gradient(
                  ${135 + transform.rotateY * 5}deg,
                  rgba(255,255,255,0.12) 0%,
                  rgba(147,197,253,0.08) 25%,
                  transparent 50%,
                  rgba(0,0,0,0.15) 75%,
                  rgba(0,0,0,0.25) 100%
                )`,
              }}
            />
            
            {/* Outer glow - soft blue ambient */}
            <div 
              className="absolute -inset-1 rounded-2xl pointer-events-none transition-all duration-500"
              style={{
                opacity: isHovered ? 0.6 : 0,
                background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08), transparent 70%)",
                filter: "blur(8px)",
              }}
            />
            
            {/* Dynamic shadow based on tilt */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500"
              style={{
                opacity: isHovered ? 1 : 0,
                boxShadow: `
                  ${-transform.rotateY * 3}px ${transform.rotateX * 3 + 15}px 40px -10px rgba(0,0,0,0.4),
                  ${-transform.rotateY * 1}px ${transform.rotateX * 1 + 8}px 20px -5px rgba(0,0,0,0.2)
                `,
              }}
            />
            
            {/* Main card surface */}
            <div 
              className="relative rounded-2xl bg-[#0a0a0f] overflow-hidden"
              style={{
                border: "1px solid transparent",
                backgroundImage: `
                  linear-gradient(#0a0a0f, #0a0a0f),
                  linear-gradient(${135 + transform.rotateY * 10}deg, 
                    rgba(255,255,255,${isHovered ? 0.15 : 0.06}) 0%, 
                    rgba(147,197,253,${isHovered ? 0.1 : 0.03}) 30%, 
                    rgba(255,255,255,${isHovered ? 0.04 : 0.02}) 50%, 
                    rgba(0,0,0,${isHovered ? 0.3 : 0.1}) 100%
                  )
                `,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              {/* Top inner highlight - metallic reflection that moves with tilt */}
              <div 
                className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, 
                    transparent ${20 - transform.rotateY * 5}%, 
                    rgba(255,255,255,${isHovered ? 0.2 : 0.08}) 50%, 
                    transparent ${80 - transform.rotateY * 5}%
                  )`,
                }}
              />
              
              {/* Subtle gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/[0.06] via-purple-600/[0.04] to-emerald-600/[0.06]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDBMNDAgNDBIMHoiLz48cGF0aCBkPSJNMCAwaDFMMSA0MEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjxwYXRoIGQ9Ik0wIDBoNDBMNDAgMUgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvZz48L3N2Zz4=')] opacity-40" />
              
              {/* Content container */}
              <div className="relative px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
                {/* Headline - Bold */}
                <h3 className="text-white font-bold text-center mb-2 sm:mb-3 leading-tight text-xl sm:text-3xl md:text-4xl lg:text-[46px]">
                  Shape the <span className="gradient-text">future of Cortex Linux</span>
                </h3>
                <p className="text-center text-sm sm:text-xl md:text-2xl font-semibold text-gray-300 mb-4 sm:mb-6">
                  <span className="text-terminal-green">$17,000 in Prizes</span> · First AI Linux Hackathon
                </p>
                
                {/* Value proposition */}
                <p className="text-gray-400 text-center text-sm sm:text-base md:text-lg max-w-lg mx-auto mb-6 sm:mb-10 leading-relaxed sm:leading-[1.8]">
                  Build monetization strategies & production features for Cortex. Two phases. Real impact. Real rewards.
                </p>
                
                {/* Countdown timer */}
                <div className="mb-6 sm:mb-10">
                  {/* Hackathon badge */}
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <motion.div 
                      className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20"
                      whileHover={{ scale: 1.03, y: -2 }}
                      transition={{ duration: 0.2 }}
                      style={{ boxShadow: "0 4px 12px rgba(0,102,255,0.15)" }}
                    >
                      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-brand-blue" />
                      </span>
                      <span className="relative text-[11px] sm:text-[13px] font-semibold tracking-wide uppercase text-[#93c5fd]">
                        Hackathon · Feb 17, 2026
                      </span>
                    </motion.div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-5 flex items-center justify-center gap-1.5 sm:gap-2">
                    <Clock size={14} className="text-blue-300 sm:w-4 sm:h-4" />
                    Hackathon starts in:
                  </p>
                  <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-4 justify-center max-w-xs sm:max-w-none mx-auto">
                    {Object.entries(countdown).map(([unit, value]) => (
                      <motion.div 
                        key={unit} 
                        className="text-center group/timer"
                        whileHover={{ y: -2, scale: 1.05 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div 
                          className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl p-2 sm:p-4 md:p-5 min-w-0 sm:min-w-[80px] md:min-w-[90px] group-hover/timer:border-brand-blue/20 group-hover/timer:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 flex flex-col items-center"
                          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                        >
                          <span className="font-bold font-mono text-[#93c5fd] text-2xl sm:text-4xl md:text-5xl lg:text-[70px]">
                            {String(value).padStart(2, "0")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 capitalize">{unit}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* CTA area with 3D buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 relative z-10">
                  {/* Primary CTA - 3D button */}
                  <Link
                    href="/register"
                    className="group/btn relative z-20 w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-transparent border-2 border-white text-white font-semibold text-sm sm:text-[15px] cursor-pointer hover:bg-white/25 hover:backdrop-blur-md transition-all duration-300"
                    data-testid="button-sign-up-now"
                  >
                    <Github size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Sign Up Now</span>
                    <ArrowRight size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4 opacity-60 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all duration-300" />
                  </Link>
                  
                  {/* Secondary CTA */}
                  <Link
                    href="/hackathon"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 text-sm sm:text-[15px] text-gray-400 hover:text-white transition-colors duration-300 group/link"
                    data-testid="link-hackathon-details"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={14} strokeWidth={2} className="group-hover/link:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
}
