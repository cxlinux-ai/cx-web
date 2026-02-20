import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Brain, Zap, Globe } from "lucide-react";

// Feature slides - Digital Sovereignty is first
const FEATURE_SLIDES = [
  {
    icon: Globe,
    title: "The Agentic OS for Digital Sovereignty",
    description: "Own your infrastructure. Control your data. Deploy AI agents that work for you, not vendors.",
  },
  {
    icon: RotateCcw,
    title: "Zero-Risk Deployments via Atomic Rollbacks",
    description: "Every change is reversible. Instant rollback to any previous state. Deploy with confidence.",
  },
  {
    icon: Brain,
    title: "Agentic Fleet Automation (HRM AI)",
    description: "Human Resource Management for machines. AI agents that understand, plan, and execute across your entire fleet.",
  },
  {
    icon: Zap,
    title: "Rust-Powered Performance & 6-Year BSL Moat",
    description: "Memory-safe, blazing fast core. Protected by Business Source License — converts to Apache 2.0 after 6 years.",
  },
];

export default function FeatureCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Slide animation variants - left/right
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 relative">
      {/* Terminal-style container - clean dark background, glow comes from outside */}
      <div className="relative rounded-xl overflow-hidden border border-purple-500/20 shadow-[0_0_60px_-15px_rgba(168,85,247,0.4)]">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/90 border-b border-gray-800/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-sm text-gray-400 font-medium">
            cx-linux ~ fleet-manager
          </span>
        </div>

        {/* Content area - clean dark background */}
        <div className="relative h-[320px] sm:h-[360px] md:h-[400px] bg-gradient-to-b from-gray-900/95 via-gray-950/95 to-gray-950 overflow-hidden">
          {/* Subtle inner glow from edges */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Feature Carousel - Left/Right animation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 py-6"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full scale-[2]" />
                {(() => {
                  const IconComponent = FEATURE_SLIDES[currentSlide].icon;
                  return (
                    <IconComponent 
                      className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-purple-400" 
                      strokeWidth={1.5} 
                    />
                  );
                })()}
              </div>
              
              {/* Title */}
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white max-w-2xl mb-4 leading-tight">
                {FEATURE_SLIDES[currentSlide].title}
              </h3>
              
              {/* Description */}
              <p className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed">
                {FEATURE_SLIDES[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
