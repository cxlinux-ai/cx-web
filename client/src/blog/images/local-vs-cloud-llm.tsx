export default function LocalVsCloudLlmImage({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 630" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Local LLM vs Cloud LLM comparison diagram">
      <rect width="1200" height="630" fill="#0D0D0D"/>
      {/* Divider */}
      <line x1="600" y1="60" x2="600" y2="570" stroke="#222" strokeWidth="2" strokeDasharray="6 4"/>
      <text x="600" y="40" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#555">vs</text>
      {/* LOCAL side */}
      <text x="300" y="100" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="#FFFFFF">Local LLM</text>
      <text x="300" y="122" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#555">Mistral 7B · Runs on your hardware</text>
      {/* Server icon */}
      <rect x="220" y="148" width="160" height="100" rx="8" fill="#141414" stroke="#333" strokeWidth="1.5"/>
      <rect x="232" y="162" width="136" height="18" rx="3" fill="#1E1E1E"/>
      <rect x="232" y="186" width="136" height="18" rx="3" fill="#1E1E1E"/>
      <rect x="232" y="210" width="80" height="18" rx="3" fill="#1E1E1E"/>
      <circle cx="345" cy="221" r="6" fill="#00FF9F" opacity="0.8"/>
      <text x="300" y="278" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="#666">GPU required (RTX 3060+)</text>
      {/* Pros */}
      {["✓ 100% offline", "✓ Zero API cost", "✓ No data leaves machine", "✓ Unlimited requests"].map((line, i) => (
        <text key={i} x="160" y={330 + i * 24} fontFamily="sans-serif" fontSize="13" fill="#00FF9F" opacity="0.9">{line}</text>
      ))}
      {/* Cons */}
      {["✗ Needs GPU (8GB+ VRAM)", "✗ Slower inference"].map((line, i) => (
        <text key={i} x="160" y={438 + i * 24} fontFamily="sans-serif" fontSize="13" fill="#888">{line}</text>
      ))}
      {/* CLOUD side */}
      <text x="900" y="100" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="#FFFFFF">Cloud LLM</text>
      <text x="900" y="122" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#555">Claude · GPT-4o · Any OpenAI-compat</text>
      {/* Cloud icon */}
      <ellipse cx="900" cy="185" rx="70" ry="40" fill="#141414" stroke="#333" strokeWidth="1.5"/>
      <ellipse cx="860" cy="196" rx="50" ry="30" fill="#141414" stroke="#333" strokeWidth="1.5"/>
      <ellipse cx="940" cy="196" rx="55" ry="30" fill="#141414" stroke="#333" strokeWidth="1.5"/>
      <rect x="835" y="210" width="130" height="28" rx="4" fill="#141414" stroke="#333" strokeWidth="1"/>
      <text x="900" y="230" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#0EA5E9">API</text>
      <text x="900" y="278" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="#666">Works on any machine with internet</text>
      {/* Pros */}
      {["✓ State-of-the-art models", "✓ No GPU needed", "✓ Fast inference", "✓ Default in CX (easiest)"].map((line, i) => (
        <text key={i} x="760" y={330 + i * 24} fontFamily="sans-serif" fontSize="13" fill="#0EA5E9" opacity="0.9">{line}</text>
      ))}
      {/* Cons */}
      {["✗ Requires internet", "✗ API cost per request"].map((line, i) => (
        <text key={i} x="760" y={438 + i * 24} fontFamily="sans-serif" fontSize="13" fill="#888">{line}</text>
      ))}
      {/* Bottom CX note */}
      <rect x="250" y="530" width="700" height="50" rx="8" fill="#0A1A0F" stroke="#00FF9F" strokeWidth="1"/>
      <text x="600" y="553" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#00FF9F" fontWeight="600">CX Linux supports both — switch with a single config flag</text>
      <text x="600" y="570" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#666">cx config set llm.provider local | cloud | hybrid</text>
    </svg>
  );
}
