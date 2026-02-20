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

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Terminal-style container */}
      <div className="relative rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/80 border-b border-gray-800/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-sm text-gray-400 font-medium">
            cx-linux ~ fleet-manager
          </span>
        </div>

        {/* Content area with purple gradient */}
        <div className="relative h-[320px] sm:h-[360px] md:h-[400px] bg-gradient-to-b from-purple-900/30 via-purple-800/20 to-gray-950/80 overflow-hidden">
          {/* Subtle purple glow effects */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
          
          {/* Feature Carousel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 py-6"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-[2]" />
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
          
          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {FEATURE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'bg-purple-400 w-8' 
                    : 'bg-gray-600 w-2 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
