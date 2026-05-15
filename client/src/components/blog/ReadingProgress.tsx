import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrollTop = window.scrollY;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrollTop / total) * 100) : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 h-[2px] z-40 bg-transparent">
      <div
        className="h-full bg-[#00FF9F] origin-left transition-transform duration-75"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
