import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* =========================================================================
   FLEET METRICS PANEL — minimal, calm, focused.
   ========================================================================= */

type Status = "healthy" | "warning" | "deploying";

type SrvRow = {
  name: string;
  status: Status;
  cpu: number;
  spark: number[];
};

/* Realistic server metric profiles — different shapes per workload type.
   Each profile produces 40 samples with characteristic patterns. */
function genMetric(profile: "api" | "web" | "db" | "worker", endVal: number): number[] {
  const N = 40;
  const out: number[] = [];
  let seed = profile.charCodeAt(0) * 1000 + endVal;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < N; i++) {
    const t = i / (N - 1); // 0 → 1 (oldest → newest)
    let v = 0;

    if (profile === "api") {
      // diurnal-ish sine + small noise, lands near endVal
      const baseline = endVal - 8;
      v = baseline + Math.sin(t * Math.PI * 2.3) * 9 + (rng() - 0.5) * 5;
    } else if (profile === "web") {
      // low traffic with occasional small bursts
      const baseline = endVal - 4;
      v = baseline + (rng() - 0.5) * 6;
      // sporadic small spikes
      if (rng() > 0.88) v += 8 + rng() * 6;
    } else if (profile === "db") {
      // high sustained load, climbing trend (concerning)
      const climb = t * 12;
      v = (endVal - 14) + climb + Math.sin(t * Math.PI * 4) * 2.5 + (rng() - 0.5) * 4;
    } else {
      // worker: bursty deploy pattern — quiet, then ramping up
      if (t < 0.55) v = 12 + (rng() - 0.5) * 6;
      else {
        const ramp = (t - 0.55) / 0.45;
        v = 12 + ramp * (endVal - 12) + (rng() - 0.5) * 5;
      }
    }

    out.push(Math.max(2, Math.min(98, Math.round(v))));
  }

  // anchor last value to endVal for consistency with the displayed CPU%
  out[N - 1] = endVal;
  return out;
}

const SERVERS: SrvRow[] = [
  { name: "api-01.prod",  status: "healthy",   cpu: 42, spark: genMetric("api",    42) },
  { name: "web-01.prod",  status: "healthy",   cpu: 28, spark: genMetric("web",    28) },
  { name: "db-01.prod",   status: "warning",   cpu: 78, spark: genMetric("db",     78) },
  { name: "worker-01",    status: "deploying", cpu: 54, spark: genMetric("worker", 54) },
];

const STATUS_COLOR: Record<Status, string> = {
  healthy:   "bg-[#00FF9F]",
  warning:   "bg-amber-400",
  deploying: "bg-blue-400",
};

/* ── Animated count-up ─────────────────────────────────────────────────── */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, to, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* Catmull-Rom → cubic Bézier conversion for smooth, organic curves. */
function smoothPath(pts: number[][]): string {
  if (pts.length < 2) return "";
  const tension = 0.5;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension / 3;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension / 3;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension / 3;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension / 3;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/* ── Real graph (axis + smoothed line + area + threshold + glow) ───────── */
function Graph({ vals, color, animate: shouldAnimate, delay = 0 }: { vals: number[]; color: string; animate: boolean; delay?: number }) {
  const PAD_L = 22, PAD_R = 6, PAD_T = 5, PAD_B = 12;
  const W = 180, H = 60;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const yMin = 0, yMax = 100;
  const yToPx = (v: number) => PAD_T + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const pts: number[][] = vals.map((v, i) => [
    PAD_L + (i / (vals.length - 1)) * innerW,
    yToPx(v),
  ]);

  const lineD = smoothPath(pts);
  const areaD = `${lineD} L${PAD_L + innerW},${PAD_T + innerH} L${PAD_L},${PAD_T + innerH} Z`;

  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, [lineD]);

  const idSafe = color.replace("#", "");
  const gradId = `g-${idSafe}`;
  const glowId = `glow-${idSafe}`;
  const haloId = `halo-${idSafe}`;

  const yTicks = [0, 50, 100];
  const xTicks = ["1h", "30m", "now"];

  // peak point (highest value) — annotates real drama
  const peakIdx = vals.indexOf(Math.max(...vals));
  const peakVal = vals[peakIdx];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible flex-shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.35" />
          <stop offset="60%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={haloId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* gridlines + y labels */}
      {yTicks.map((t) => {
        const y = yToPx(t);
        return (
          <g key={t}>
            <line
              x1={PAD_L} y1={y} x2={PAD_L + innerW} y2={y}
              stroke="#ffffff"
              strokeOpacity={t === 0 ? 0.07 : 0.04}
              strokeWidth="0.5"
              strokeDasharray={t === 0 ? "" : "1.5 2.5"}
            />
            <text
              x={PAD_L - 4}
              y={y + 2}
              textAnchor="end"
              fill="#ffffff"
              fillOpacity="0.28"
              fontSize="6.5"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        );
      })}

      {/* x-axis time labels */}
      {xTicks.map((label, i) => {
        const x = PAD_L + (i / (xTicks.length - 1)) * innerW;
        return (
          <text
            key={label}
            x={x}
            y={H - 2}
            textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
            fill="#ffffff"
            fillOpacity="0.22"
            fontSize="6.5"
            fontFamily="ui-monospace, monospace"
          >
            {label}
          </text>
        );
      })}

      {/* threshold line at 75% — subtle "warning" reference */}
      <line
        x1={PAD_L} y1={yToPx(75)} x2={PAD_L + innerW} y2={yToPx(75)}
        stroke="#fbbf24"
        strokeOpacity="0.15"
        strokeWidth="0.5"
        strokeDasharray="2 3"
      />

      {/* y-axis tick line */}
      <line
        x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + innerH}
        stroke="#ffffff"
        strokeOpacity="0.08"
        strokeWidth="0.5"
      />

      {/* area fill */}
      <motion.path
        d={areaD}
        fill={`url(#${gradId})`}
        initial={{ opacity: 0 }}
        animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.9, delay: delay + 0.5, ease: "easeOut" }}
      />

      {/* line — smoothed + soft glow */}
      <path
        ref={pathRef}
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={shouldAnimate ? 0 : len}
        filter={`url(#${glowId})`}
        style={{
          transition: shouldAnimate ? `stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, opacity 0.5s ease ${delay}s` : "none",
          opacity: shouldAnimate ? 0.95 : 0,
        }}
      />

      {/* peak marker — tiny dot at the highest point */}
      {peakIdx !== vals.length - 1 && peakVal >= 60 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: delay + 1.4 }}
        >
          <circle
            cx={pts[peakIdx][0]}
            cy={pts[peakIdx][1]}
            r="1.4"
            fill="#fbbf24"
            opacity="0.7"
          />
        </motion.g>
      )}

      {/* current-value halo + glowing node */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 1.3 }}
      >
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r="5"
          fill={color}
          opacity="0.18"
          filter={`url(#${haloId})`}
        />
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r="2.4"
          fill={color}
          filter={`url(#${glowId})`}
        />
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r="1"
          fill="#ffffff"
          opacity="0.9"
        />
      </motion.g>
    </svg>
  );
}

/* ── Log lines ─────────────────────────────────────────────────────────── */
const LOG = [
  { col: "text-gray-500",  text: "$ cx fleet patch --stable" },
  { col: "text-[#00FF9F]", text: "✓ web-01.prod   upgraded   2.8s" },
  { col: "text-[#00FF9F]", text: "✓ api-01.prod   upgraded   3.1s" },
  { col: "text-blue-400",  text: "⟳ worker-01     deploying…" },
  { col: "text-[#00FF9F]", text: "● 3/4 done · 0 errors" },
];

function LiveLog({ start }: { start: boolean }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (visible >= LOG.length) return;
    const delay = visible === 0 ? 600 : 500;
    const t = setTimeout(() => setVisible((v) => v + 1), delay);
    return () => clearTimeout(t);
  }, [visible, start]);

  return (
    <div className="font-mono text-[11px] leading-[1.8]">
      {LOG.slice(0, visible).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={line.col}
        >
          {line.text}
        </motion.div>
      ))}
      <motion.span
        className="inline-block w-[6px] h-[11px] bg-[#00FF9F]/50 rounded-sm align-middle"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── Main panel ────────────────────────────────────────────────────────── */
export function FleetMetricsPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  return (
    <div ref={containerRef} className="relative w-full select-none">
      {/* very subtle glow */}
      <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-[#00FF9F]/[0.04] blur-3xl rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform, filter" }}
      >
        <div className="relative bg-[#0A0B09] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_24px_56px_-12px_rgba(0,0,0,0.85)]">
          {/* Window chrome */}
          <div className="bg-[#101110] border-b border-white/[0.05] px-4 py-2.5 flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
            </div>
            <span className="text-[11px] text-gray-600 font-mono ml-1.5">cx — fleet</span>
            <div className="ml-auto flex items-center gap-2">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#00FF9F]"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-[10px] text-[#00FF9F]/80 font-mono tracking-wide">LIVE</span>
            </div>
          </div>

          {/* KPIs — just 2 */}
          <div className="grid grid-cols-2 border-b border-white/[0.05] divide-x divide-white/[0.05]">
            <div className="px-4 py-3 text-center">
              <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Online</div>
              <div className="text-lg font-bold tabular-nums font-mono text-[#00FF9F]">
                {inView ? <CountUp to={12} suffix="/12" /> : "0/12"}
              </div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Avg CPU</div>
              <div className="text-lg font-bold tabular-nums font-mono text-[#00FF9F]">
                {inView ? <CountUp to={50} suffix="%" /> : "0%"}
              </div>
            </div>
          </div>

          {/* Server rows */}
          <div className="py-2">
            {SERVERS.map((srv, i) => {
              const rowDelay = 0.3 + i * 0.12;
              return (
                <motion.div
                  key={srv.name}
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={inView ? { opacity: 1, filter: "blur(0px)" } : {}}
                  transition={{ delay: rowDelay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="px-4 py-2.5 flex items-center gap-3"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_COLOR[srv.status]}`} />
                  <div className="text-[12px] font-mono text-gray-200 w-24 truncate flex-shrink-0">
                    {srv.name}
                  </div>
                  <div className="flex-1 flex justify-end">
                    <Graph
                      vals={srv.spark}
                      color={srv.cpu >= 75 ? "#fbbf24" : "#00FF9F"}
                      animate={inView}
                      delay={rowDelay + 0.1}
                    />
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-gray-400 w-10 text-right flex-shrink-0">
                    {srv.cpu}%
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Live log */}
          <div className="border-t border-white/[0.05] bg-[#070807] px-4 py-3.5 min-h-[120px]">
            <LiveLog start={inView} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
