export default function HowWeBuiltCxImage({ className = "" }: { className?: string }) {
  const layers = [
    { y: 120, h: 70, color: "#00FF9F", label: "Natural Language Interface", sub: "NLP · Intent parsing · Context resolution" },
    { y: 210, h: 70, color: "#22D3EE", label: "CX Core Engine", sub: "Planner · Command generator · Safety layer" },
    { y: 300, h: 70, color: "#818CF8", label: "Sandbox Runtime", sub: "Firejail · Snapshots · Rollback" },
    { y: 390, h: 70, color: "#F59E0B", label: "System Interface", sub: "apt · dnf · systemd · hardware detection" },
    { y: 480, h: 60, color: "#6B7280", label: "Linux Kernel", sub: "Debian · Ubuntu · Arch · RHEL" },
  ];

  return (
    <svg viewBox="0 0 1200 630" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CX Linux architecture diagram">
      <rect width="1200" height="630" fill="#0D0D0D"/>
      <text x="600" y="60" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="#FFFFFF">CX Linux Architecture</text>
      <text x="600" y="85" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#555">Layered AI-native operating system design</text>
      {/* Layer stack */}
      {layers.map(({ y, h, color, label, sub }, i) => (
        <g key={label}>
          <rect x="200" y={y} width="800" height={h} rx="8" fill="#141414" stroke={color} strokeWidth="1.5" opacity={1 - i * 0.08}/>
          {/* Left accent bar */}
          <rect x="200" y={y} width="6" height={h} rx="3" fill={color} opacity="0.8"/>
          <text x="260" y={y + h / 2 - 8} fontFamily="sans-serif" fontSize="15" fontWeight="600" fill="#FFFFFF">{label}</text>
          <text x="260" y={y + h / 2 + 12} fontFamily="sans-serif" fontSize="12" fill="#666">{sub}</text>
          {/* Right badge */}
          <text x="960" y={y + h / 2 + 5} textAnchor="end" fontFamily="monospace" fontSize="11" fill={color} opacity="0.8">Layer {layers.length - i}</text>
          {/* Arrow between layers */}
          {i < layers.length - 1 && (
            <path d={`M600 ${y + h} L594 ${y + h + 10} L606 ${y + h + 10} Z`} fill="#333"/>
          )}
        </g>
      ))}
      {/* User bubble on top */}
      <ellipse cx="600" cy="108" rx="60" ry="20" fill="#0A1A0F" stroke="#00FF9F" strokeWidth="1"/>
      <text x="600" y="113" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="#00FF9F">You</text>
    </svg>
  );
}
