export default function WhatIsCxLinuxImage({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 630" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CX Linux AI layer illustration">
      <rect width="1200" height="630" fill="#0D0D0D"/>
      {/* Grid lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 63} y1="0" x2={i * 63} y2="630" stroke="#1A1A1A" strokeWidth="1"/>
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 63} x2="1200" y2={i * 63} stroke="#1A1A1A" strokeWidth="1"/>
      ))}
      {/* Terminal window */}
      <rect x="80" y="80" width="580" height="420" rx="12" fill="#141414" stroke="#333" strokeWidth="1.5"/>
      <rect x="80" y="80" width="580" height="40" rx="12" fill="#1E1E1E"/>
      <rect x="80" y="108" width="580" height="12" fill="#1E1E1E"/>
      <circle cx="108" cy="100" r="7" fill="#FF5F57" opacity="0.7"/>
      <circle cx="130" cy="100" r="7" fill="#FEBC2E" opacity="0.7"/>
      <circle cx="152" cy="100" r="7" fill="#28C840" opacity="0.7"/>
      {/* Terminal text lines */}
      <text x="108" y="152" fontFamily="monospace" fontSize="14" fill="#00FF9F">user@cx:~$</text>
      <text x="215" y="152" fontFamily="monospace" fontSize="14" fill="#E0E0E0"> cx "install docker and configure for production"</text>
      <text x="108" y="180" fontFamily="monospace" fontSize="13" fill="#888">Analyzing system state...</text>
      <text x="108" y="202" fontFamily="monospace" fontSize="13" fill="#888">Hardware: Intel i7, 16GB RAM, 512GB SSD</text>
      <text x="108" y="224" fontFamily="monospace" fontSize="13" fill="#888">Generating commands...</text>
      <rect x="108" y="240" width="510" height="1" fill="#333"/>
      <text x="108" y="262" fontFamily="monospace" fontSize="13" fill="#00FF9F">✓</text>
      <text x="128" y="262" fontFamily="monospace" fontSize="13" fill="#E0E0E0"> apt-get install -y docker-ce docker-ce-cli</text>
      <text x="108" y="284" fontFamily="monospace" fontSize="13" fill="#00FF9F">✓</text>
      <text x="128" y="284" fontFamily="monospace" fontSize="13" fill="#E0E0E0"> systemctl enable docker</text>
      <text x="108" y="306" fontFamily="monospace" fontSize="13" fill="#00FF9F">✓</text>
      <text x="128" y="306" fontFamily="monospace" fontSize="13" fill="#E0E0E0"> usermod -aG docker $USER</text>
      <text x="108" y="328" fontFamily="monospace" fontSize="13" fill="#00FF9F">✓</text>
      <text x="128" y="328" fontFamily="monospace" fontSize="13" fill="#E0E0E0"> docker run --rm hello-world</text>
      <text x="108" y="362" fontFamily="monospace" fontSize="13" fill="#888">Preview ↑ | Approve? [y/N]</text>
      <text x="108" y="384" fontFamily="monospace" fontSize="14" fill="#00FF9F">user@cx:~$</text>
      <text x="215" y="384" fontFamily="monospace" fontSize="14" fill="#E0E0E0"> y</text>
      <rect x="108" y="398" width="8" height="16" fill="#00FF9F" opacity="0.9"/>
      {/* AI network diagram on right */}
      <circle cx="900" cy="200" r="48" fill="#141414" stroke="#00FF9F" strokeWidth="1.5"/>
      <text x="900" y="196" textAnchor="middle" fontFamily="monospace" fontSize="13" fill="#00FF9F">CX</text>
      <text x="900" y="213" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#888">AI Core</text>
      {/* Satellite nodes */}
      {[
        { cx: 790, cy: 100, label: "NLP" },
        { cx: 1010, cy: 100, label: "OS" },
        { cx: 1060, cy: 260, label: "HW" },
        { cx: 840, cy: 340, label: "PKG" },
        { cx: 740, cy: 270, label: "SEC" },
      ].map(({ cx, cy, label }) => (
        <g key={label}>
          <line x1="900" y1="200" x2={cx} y2={cy} stroke="#00FF9F" strokeWidth="1" opacity="0.3"/>
          <circle cx={cx} cy={cy} r="28" fill="#0D1A12" stroke="#00FF9F" strokeWidth="1" opacity="0.7"/>
          <text x={cx} y={cy + 5} textAnchor="middle" fontFamily="monospace" fontSize="12" fill="#00FF9F" opacity="0.9">{label}</text>
        </g>
      ))}
      {/* Glow */}
      <circle cx="900" cy="200" r="100" fill="none" stroke="#00FF9F" strokeWidth="1" opacity="0.08"/>
      <circle cx="900" cy="200" r="160" fill="none" stroke="#00FF9F" strokeWidth="1" opacity="0.04"/>
      {/* Label */}
      <text x="900" y="460" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="#FFFFFF">The AI Layer for Linux</text>
      <text x="900" y="485" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#888">Natural language → OS-level execution</text>
    </svg>
  );
}
