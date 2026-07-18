// Ambient background motion, layered behind all content (pure CSS animations,
// no client JS). Slow-drifting blue-tinted colour orbs and floating particles.
// Held still for reduced-motion users via CSS.

const PARTICLES = [
  { left: "8%", top: "22%", size: 2, dur: 17, delay: 0 },
  { left: "16%", top: "68%", size: 3, dur: 22, delay: 3 },
  { left: "24%", top: "40%", size: 2, dur: 19, delay: 7 },
  { left: "33%", top: "82%", size: 2, dur: 24, delay: 1 },
  { left: "41%", top: "18%", size: 3, dur: 20, delay: 5 },
  { left: "49%", top: "58%", size: 2, dur: 26, delay: 9 },
  { left: "57%", top: "30%", size: 2, dur: 18, delay: 2 },
  { left: "63%", top: "74%", size: 3, dur: 23, delay: 6 },
  { left: "71%", top: "46%", size: 2, dur: 21, delay: 11 },
  { left: "78%", top: "16%", size: 2, dur: 25, delay: 4 },
  { left: "84%", top: "64%", size: 3, dur: 19, delay: 8 },
  { left: "91%", top: "36%", size: 2, dur: 22, delay: 13 },
  { left: "12%", top: "50%", size: 2, dur: 27, delay: 10 },
  { left: "88%", top: "84%", size: 2, dur: 20, delay: 14 },
];

export function Backdrop() {
  return (
    <div className="cx-fx" aria-hidden>
      <span className="cx-grid" />
      <span className="cx-orb cx-orb-1" />
      <span className="cx-orb cx-orb-2" />
      <span className="cx-orb cx-orb-3" />
      <div className="cx-particles">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
