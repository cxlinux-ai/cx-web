export default function CxLinuxRoadmapImage({ className = "" }: { className?: string }) {
  const milestones = [
    { label: "v0.1", desc: "CLI + NLP core", done: true, x: 120 },
    { label: "v0.2", desc: "Web Console", done: true, x: 300 },
    { label: "v0.3", desc: "Fleet Mgmt", done: true, x: 480 },
    { label: "v0.4", desc: "Multi-agent", done: false, x: 660 },
    { label: "v0.5", desc: "GUI Layer", done: false, x: 840 },
    { label: "v1.0", desc: "GA Release", done: false, x: 1020 },
  ];

  return (
    <svg viewBox="0 0 1200 630" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CX Linux 2026 roadmap timeline">
      <rect width="1200" height="630" fill="#0D0D0D"/>
      {/* Title */}
      <text x="600" y="70" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#FFFFFF">CX Linux</text>
      <text x="600" y="100" textAnchor="middle" fontFamily="sans-serif" fontSize="16" fill="#00FF9F">2026 Roadmap</text>
      {/* Timeline line */}
      <line x1="80" y1="315" x2="1120" y2="315" stroke="#333" strokeWidth="3"/>
      {/* Progress fill */}
      <line x1="80" y1="315" x2="480" y2="315" stroke="#00FF9F" strokeWidth="3"/>
      {milestones.map(({ label, desc, done, x }) => (
        <g key={label}>
          {/* Connector line */}
          <line x1={x} y1={done ? 275 : 355} x2={x} y2="315" stroke={done ? "#00FF9F" : "#333"} strokeWidth="1.5" strokeDasharray={done ? "0" : "4 3"}/>
          {/* Node */}
          <circle cx={x} cy="315" r="14" fill={done ? "#00FF9F" : "#1A1A1A"} stroke={done ? "#00FF9F" : "#555"} strokeWidth="2"/>
          {done && (
            <path d={`M${x - 6} 315 L${x - 1} 320 L${x + 7} 309`} stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          )}
          {!done && (
            <circle cx={x} cy="315" r="4" fill="#555"/>
          )}
          {/* Card */}
          <rect
            x={x - 56}
            y={done ? 188 : 342}
            width={112}
            height={72}
            rx="8"
            fill="#141414"
            stroke={done ? "#00FF9F" : "#333"}
            strokeWidth="1"
            opacity={done ? 1 : 0.7}
          />
          <text x={x} y={done ? 212 : 366} textAnchor="middle" fontFamily="monospace" fontSize="14" fontWeight="bold" fill={done ? "#00FF9F" : "#666"}>{label}</text>
          <text x={x} y={done ? 232 : 386} textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill={done ? "#CCC" : "#555"}>{desc}</text>
          <text x={x} y={done ? 248 : 402} textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill={done ? "#00FF9F" : "#444"} opacity="0.8">{done ? "shipped" : "planned"}</text>
        </g>
      ))}
      {/* Legend */}
      <circle cx="160" cy="530" r="8" fill="#00FF9F"/>
      <text x="176" y="535" fontFamily="sans-serif" fontSize="12" fill="#888">Shipped</text>
      <circle cx="260" cy="530" r="8" fill="#1A1A1A" stroke="#555" strokeWidth="1.5"/>
      <text x="276" y="535" fontFamily="sans-serif" fontSize="12" fill="#888">Planned</text>
      <text x="600" y="580" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#555">Building the AI-native OS layer, one release at a time</text>
    </svg>
  );
}
