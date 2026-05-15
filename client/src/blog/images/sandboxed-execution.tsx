export default function SandboxedExecutionImage({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 630" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sandboxed execution security layers">
      <rect width="1200" height="630" fill="#0D0D0D"/>
      {/* Concentric rings */}
      <circle cx="600" cy="315" r="260" fill="none" stroke="#1A1A1A" strokeWidth="60"/>
      <circle cx="600" cy="315" r="180" fill="none" stroke="#141414" strokeWidth="50"/>
      <circle cx="600" cy="315" r="100" fill="#141414" stroke="#00FF9F" strokeWidth="1.5"/>
      {/* Shield icon in center */}
      <path d="M600 255 L640 275 L640 320 Q640 345 600 360 Q560 345 560 320 L560 275 Z" fill="#0A1A0F" stroke="#00FF9F" strokeWidth="2"/>
      <path d="M588 308 L596 316 L614 296" stroke="#00FF9F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Ring labels */}
      <text x="600" y="172" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#666">Layer 3: Firejail Sandbox</text>
      <text x="600" y="245" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="#555">Layer 2: Command Preview</text>
      <text x="600" y="385" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="#555">Layer 1: Snapshot / Rollback</text>
      {/* Outer decorative ring */}
      <circle cx="600" cy="315" r="270" fill="none" stroke="#00FF9F" strokeWidth="1" opacity="0.15" strokeDasharray="8 6"/>
      {/* Binary code text around outer ring */}
      {["01001", "10110", "00111", "11001", "01010", "10101"].map((bits, i) => {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const r = 310;
        return (
          <text
            key={i}
            x={600 + r * Math.cos(angle)}
            y={315 + r * Math.sin(angle)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="monospace"
            fontSize="11"
            fill="#333"
          >
            {bits}
          </text>
        );
      })}
      {/* Side labels */}
      <rect x="60" y="200" width="160" height="90" rx="8" fill="#141414" stroke="#333" strokeWidth="1"/>
      <text x="140" y="235" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill="#00FF9F">BLOCKED</text>
      <text x="140" y="255" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#666">rm -rf /</text>
      <text x="140" y="272" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#666">dd if=/dev/zero</text>
      <line x1="220" y1="245" x2="330" y2="285" stroke="#FF4444" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
      <rect x="980" y="200" width="160" height="90" rx="8" fill="#141414" stroke="#333" strokeWidth="1"/>
      <text x="1060" y="235" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill="#00FF9F">APPROVED</text>
      <text x="1060" y="255" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#666">apt install nginx</text>
      <text x="1060" y="272" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#666">systemctl start</text>
      <line x1="980" y1="245" x2="870" y2="285" stroke="#00FF9F" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
      {/* Bottom text */}
      <text x="600" y="580" textAnchor="middle" fontFamily="sans-serif" fontSize="16" fontWeight="bold" fill="#FFFFFF">Three Layers of Protection — Nothing Runs Without Your Approval</text>
    </svg>
  );
}
