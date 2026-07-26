import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface RotatingBorderCardProps {
  children: ReactNode;
  /** Tailwind classes applied to the inner panel (padding, text alignment, etc.) */
  innerClassName?: string;
  /** Unique id for the SVG dot-pattern, required so multiple cards on a page don't collide */
  patternId: string;
  /** Enable the subtle 3D mouse-tilt. Defaults to true. */
  tilt?: boolean;
}

/**
 * Shared "rotating border" CTA shell used by the homepage Final CTA,
 * Getting Started page, and Pricing Enterprise CTA. Centralizes the
 * visual treatment so all three stay consistent.
 *
 * Effects layered (back to front):
 *   1. Outer ambient + colored shadow (lift)
 *   2. Animated conic-gradient border (slow rotation)
 *   3. Dark inner panel with top/bottom inset highlights (glass edge)
 *   4. Top and bottom-right radial glows + dot-grid pattern
 *   5. Optional very-subtle 3D tilt, perspective parent + heavily-damped rotation
 */
export function RotatingBorderCard({
  children,
  innerClassName = "",
  patternId,
  tilt = true,
}: RotatingBorderCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0); // -1..1
  const mouseY = useMotionValue(0);

  // Very subtle 3D rotation, max ~0.8° each axis, heavily damped
  const rotX = useSpring(useTransform(mouseY, [-1, 1], [0.8, -0.8]), {
    stiffness: 80,
    damping: 30,
  });
  const rotY = useSpring(useTransform(mouseX, [-1, 1], [-0.8, 0.8]), {
    stiffness: 80,
    damping: 30,
  });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(Math.max(-1, Math.min(1, x * 2)));
    mouseY.set(Math.max(-1, Math.min(1, y * 2)));
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div style={{ perspective: "1600px" }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={
          tilt
            ? { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }
            : undefined
        }
        className="relative rounded-[28px] p-[1.5px] overflow-hidden will-change-transform shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7),0_0_80px_-20px_rgba(0,255,159,0.18)]"
      >
        {/* Rotating conic-gradient border */}
        <motion.div
          className="absolute inset-[-50%] z-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(0,255,159,0.7) 60deg, rgba(0,255,204,0.4) 120deg, transparent 180deg, transparent 360deg)",
          }}
        />

        {/* Dark inner panel, glass edges via top highlight + bottom inset */}
        <div
          className={`relative bg-gradient-to-b from-[#0C1210] via-[#0B100D] to-[#080C0A] rounded-[26px] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.02)] ${innerClassName}`}
        >
          {/* Ambient radial glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,159,0.18)_0%,transparent_60%)] blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,204,0.10)_0%,transparent_70%)] blur-3xl" />
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.08]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id={patternId}
                  width="34"
                  height="34"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="0.9" fill="#00FF9F" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>

          {/* Content, lifted slightly on Z so the tilt feels parallaxed */}
          <div className="relative" style={{ transform: "translateZ(20px)" }}>
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Premium icon plate used inside RotatingBorderCard. Gives the icon
 * its own dimensional treatment (gradient + inset ring + ambient shadow).
 */
export function IconPlate({
  children,
  size = "md",
}: {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses =
    size === "lg" ? "w-16 h-16" : size === "sm" ? "w-11 h-11" : "w-14 h-14";

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00FF9F]/[0.22] via-[#00FF9F]/[0.10] to-[#00FFCC]/[0.05] border border-[#00FF9F]/30 shadow-[0_12px_30px_-12px_rgba(0,255,159,0.45),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.3)]" />
      <div className="relative text-[#00FF9F]">{children}</div>
    </div>
  );
}
