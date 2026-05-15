import { useEffect, useState } from "react";

interface CxDemoProps {
  command: string;
  output?: string;
}

export function CxDemo({ command, output }: CxDemoProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(command.slice(0, i));
      if (i >= command.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [command]);

  return (
    <div className="not-prose my-6 bg-[#0A0A0A]/90 border border-white/10 rounded-xl overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161616] border-b border-white/8">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]/40" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]/40" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]/40" />
        <span className="text-gray-500 text-xs ml-2 font-mono">bash</span>
      </div>

      {/* Command line */}
      <div className="px-5 py-4 font-mono text-sm">
        <span className="text-[#00FF9F] select-none">user@cx:~$ </span>
        <span className="text-white">{displayed}</span>
        {!done && (
          <span className="inline-block w-2 h-4 bg-white/80 ml-0.5 animate-pulse align-[-3px]" />
        )}
      </div>

      {/* Output */}
      {output && done && (
        <div className="px-5 pb-4 font-mono text-sm text-gray-400 border-t border-white/5 pt-3 whitespace-pre-wrap">
          {output}
        </div>
      )}
    </div>
  );
}
