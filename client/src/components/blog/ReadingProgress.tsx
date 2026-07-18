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

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="fixed top-[63px] left-0 right-0 h-[4px] z-[200] pointer-events-none bg-[#2F6BFF]/10"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-[#2F6BFF] origin-left will-change-transform"
        style={{
          transform: `scaleX(${progress / 100})`,
          transition: "transform 80ms linear",
          boxShadow: "0 0 8px rgba(47,107,255,0.6), 0 0 3px rgba(47,107,255,0.8)",
        }}
      />
    </div>
  );
}
