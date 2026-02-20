import { useEffect, useState } from "react";

export default function ScrollGlow() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The glow moves slower than scroll (parallax effect)
  // Starts near top, moves down as user scrolls
  const glowPosition = scrollY * 0.3;

  return (
    <>
      {/* Horizontal glow bar that moves with scroll */}
      <div
        className="fixed left-0 right-0 h-[400px] pointer-events-none z-0 hidden sm:block"
        style={{
          top: `${100 + glowPosition}px`,
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />
      {/* Secondary wider glow for ambient effect */}
      <div
        className="fixed left-0 right-0 h-[600px] pointer-events-none z-0 hidden sm:block"
        style={{
          top: `${50 + glowPosition * 0.8}px`,
          background: `radial-gradient(ellipse 120% 80% at 50% 50%, rgba(124, 88, 246, 0.08) 0%, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />
    </>
  );
}
