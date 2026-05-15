export default function CxVsWarpImage({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 630" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CX Linux vs Warp vs Copilot CLI comparison">
      <rect width="1200" height="630" fill="#0D0D0D"/>
      {/* Three terminal panels */}
      {[
        { x: 40, title: "CX Linux", color: "#00FF9F", lines: ["cx \"set up nginx + SSL\"", "→ Analyzing system…", "→ 4 commands ready", "→ Preview + approve", "✓ Done in 30s"] },
        { x: 420, title: "Warp", color: "#7C3AED", lines: ["# nginx setup", "sudo apt install nginx", "# configure manually…", "# certbot…", "# debug config…"] },
        { x: 800, title: "Copilot CLI", color: "#0EA5E9", lines: ["gh copilot suggest", "\"nginx + ssl\"", "→ shows command", "→ no context", "→ manual steps"] },
      ].map(({ x, title, color, lines }) => (
        <g key={title}>
          <rect x={x} y={80} width={340} height={440} rx="10" fill="#141414" stroke={color} strokeWidth={title === "CX Linux" ? 2 : 1} opacity={title === "CX Linux" ? 1 : 0.5}/>
          <rect x={x} y={80} width={340} height={36} rx="10" fill="#1A1A1A"/>
          <rect x={x} y={104} width={340} height={12} fill="#1A1A1A"/>
          <circle cx={x + 22} cy={98} r={5} fill={color} opacity="0.6"/>
          <circle cx={x + 38} cy={98} r={5} fill={color} opacity="0.3"/>
          <circle cx={x + 54} cy={98} r={5} fill={color} opacity="0.2"/>
          <text x={x + 170} y={102} textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill={color}>{title}</text>
          {lines.map((line, i) => (
            <text key={i} x={x + 16} y={142 + i * 26} fontFamily="monospace" fontSize="12" fill={i === lines.length - 1 && title === "CX Linux" ? "#00FF9F" : "#888"}>{line}</text>
          ))}
          {/* Score badge */}
          <rect x={x + 90} y={440} width={160} height={54} rx="8" fill={color} opacity={title === "CX Linux" ? 0.15 : 0.05} stroke={color} strokeWidth="1"/>
          <text x={x + 170} y={465} textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill={color} opacity="0.8">
            {title === "CX Linux" ? "OS-level · Multi-step" : title === "Warp" ? "Terminal UX · No AI exec" : "Suggestion only"}
          </text>
          <text x={x + 170} y={483} textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill="#666">
            {title === "CX Linux" ? "Sandbox · Rollback · Context-aware" : title === "Warp" ? "Manual execution required" : "No system context"}
          </text>
        </g>
      ))}
      {/* Winner badge */}
      <rect x="40" y="545" width="340" height="44" rx="8" fill="#00FF9F" opacity="0.12" stroke="#00FF9F" strokeWidth="1.5"/>
      <text x="210" y="572" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#00FF9F">🏆  Best for production Linux work</text>
      <text x="600" y="600" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#444">CX Linux · Warp · GitHub Copilot CLI — Which AI Terminal Tool Wins?</text>
    </svg>
  );
}
