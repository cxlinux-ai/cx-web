import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCxDemo } from "@/hooks/useCxDemo";
import { useDemoAnimation, DEMO_SCENARIOS } from "@/hooks/useDemoAnimation";
import { Send, Terminal, Loader2, Copy, Check, Download, Sparkles, ChevronRight, ArrowRight, Play, Zap } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Automate my backup script",
  "Set up system monitoring",
  "Configure firewall rules",
  "Create cron job for reports",
  "Install Docker on Ubuntu",
];

export default function InteractiveDemoHero() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Check for live mode via URL parameter
  const isLiveMode = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'live';
    }
    return false;
  }, []);

  // Live API hook
  const {
    messages,
    isLoading,
    error,
    remaining,
    limitReached,
    sendMessage,
  } = useCxDemo();

  // Demo animation hook
  const {
    isAnimating,
    currentScenario,
    displayedCommand,
    displayedLines,
    commandComplete,
    playScenario,
    reset: resetAnimation,
    scenarios,
  } = useDemoAnimation();

  // Auto-scroll terminal content only (not the whole page)
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages, displayedLines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isAnimating) return;
    
    if (isLiveMode) {
      const message = input;
      setInput("");
      await sendMessage(message);
    } else {
      // In demo mode, show a hint to use preset scenarios
      setInput("");
    }
  };

  const handleExampleClick = async (example: string) => {
    if (isLoading || isAnimating) return;
    
    if (isLiveMode) {
      setInput(example);
      setTimeout(async () => {
        await sendMessage(example);
        setInput("");
      }, 300);
    }
  };

  const handleScenarioClick = (scenario: typeof DEMO_SCENARIOS[0]) => {
    if (isAnimating) return;
    playScenario(scenario);
  };

  const copyOutput = () => {
    let textToCopy = '';
    
    if (isLiveMode) {
      const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
      if (lastAssistant) {
        const codeMatch = lastAssistant.content.match(/```[\s\S]*?```/g);
        textToCopy = codeMatch
          ? codeMatch.map((c) => c.replace(/```\w*\n?/g, "").trim()).join("\n")
          : lastAssistant.content;
      }
    } else if (displayedLines.length > 0) {
      textToCopy = displayedLines.map(l => l.text).join('\n');
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasOutput = isLiveMode ? messages.length > 0 : displayedLines.length > 0;

  // Show limit reached state (only in live mode)
  if (isLiveMode && limitReached) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 p-6 sm:p-8 md:p-12 text-center"
        >
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto text-purple-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Thanks for trying CX Linux!</h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto px-2">
            Ready for the full experience with unlimited access?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="https://github.com/cxlinux-ai/cx" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-5 md:py-6"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Install CX Linux CLI
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="hidden sm:block text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span className="text-xs sm:text-sm font-medium text-purple-300">
              {isLiveMode ? 'Live AI Demo — Real API Calls' : 'Interactive Demo — Click to Explore'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-2">
            Experience CX Linux in <span className="gradient-text">10 Seconds</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            {isLiveMode 
              ? 'Describe any task in plain English. CX Linux handles automation, configuration, scripts, and more.'
              : 'Click a scenario below to see CX Linux in action with beautiful terminal animations.'}
          </p>
          {isLiveMode && remaining !== null && (
            <p className="text-xs sm:text-sm text-gray-500">
              {remaining} {remaining === 1 ? 'request' : 'requests'} remaining in demo
            </p>
          )}
        </div>

        {/* Preset Scenario Buttons (Demo Mode Only) */}
        {!isLiveMode && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {scenarios.map((scenario) => (
              <motion.button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                disabled={isAnimating}
                className={`group relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
                  currentScenario?.id === scenario.id
                    ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-900/50 border-gray-700/50 hover:border-purple-500/30 hover:bg-purple-500/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: isAnimating ? 1 : 1.02 }}
                whileTap={{ scale: isAnimating ? 1 : 0.98 }}
                data-testid={`button-scenario-${scenario.id}`}
              >
                <span className="text-xl sm:text-2xl">{scenario.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {scenario.name}
                </span>
                {currentScenario?.id === scenario.id && isAnimating && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Interactive Demo Card */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="hidden sm:block absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
          
          <Card className="relative bg-gray-950/90 border-gray-500/50 backdrop-blur-xl overflow-hidden rounded-lg sm:rounded-xl shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/80 border-b border-gray-500/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-2 sm:ml-3 flex items-center gap-1.5 sm:gap-2">
                  <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                  <span className="text-xs sm:text-sm text-gray-400 font-medium truncate">
                    <span className="hidden sm:inline">cx — </span>demo
                    {isLiveMode && <span className="ml-2 text-green-400">(live)</span>}
                  </span>
                </div>
              </div>
              {hasOutput && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyOutput}
                  className="h-7 px-1.5 sm:px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                  data-testid="button-copy-command"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  <span className="ml-1 sm:ml-1.5 text-[10px] sm:text-xs hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              )}
            </div>

            <CardContent className="p-0">
              {/* Input Section (Live Mode) */}
              {isLiveMode && (
                <div className="p-3 sm:p-4 md:p-5 bg-gray-900/40 border-b border-gray-500/50">
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="flex-1 relative group/input">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-purple-400 font-mono text-xs sm:text-sm font-bold">
                          $
                        </span>
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Describe any task you want to accomplish..."
                          className="pl-7 sm:pl-9 bg-gray-950/60 border-gray-500/60 text-white placeholder:text-gray-500 focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 h-10 sm:h-11 md:h-12 text-sm sm:text-base rounded-lg transition-all"
                          disabled={isLoading}
                          data-testid="input-demo-command"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-5 rounded-lg shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
                        data-testid="button-submit-demo"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="ml-1.5 sm:ml-2 hidden sm:inline">Run</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Example Chips */}
                    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
                      {EXAMPLE_PROMPTS.map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => handleExampleClick(example)}
                          disabled={isLoading}
                          className="group/chip flex-shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-800/40 border border-gray-500/50 rounded-md sm:rounded-lg text-gray-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          data-testid={`button-example-${example.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400 opacity-0 group-hover/chip:opacity-100 transition-opacity hidden sm:block" />
                          {example}
                        </button>
                      ))}
                    </div>
                  </form>
                </div>
              )}

              {/* Terminal Output */}
              <div className="bg-gray-950/60">
                <div 
                  ref={terminalRef}
                  className="h-[220px] sm:h-[260px] md:h-[300px] lg:h-[320px] overflow-y-auto p-3 sm:p-4 md:p-5 font-mono text-xs sm:text-sm scroll-smooth"
                >
                  {/* Demo Mode Output */}
                  {!isLiveMode && (
                    <>
                      {!currentScenario && displayedLines.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 sm:space-y-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                            <Play className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-600" />
                          </div>
                          <div className="text-center space-y-0.5 sm:space-y-1 px-4">
                            <p className="text-sm sm:text-base text-gray-400">Click a scenario above to see CX Linux in action</p>
                            <p className="text-xs sm:text-sm text-gray-600">Watch beautiful terminal animations with real commands</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {/* Animated Command Line */}
                          {displayedCommand && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-start gap-1.5 sm:gap-2"
                            >
                              <span className="text-purple-400 font-bold">$</span>
                              <span className="text-white">{displayedCommand}</span>
                              {!commandComplete && (
                                <motion.span
                                  className="inline-block w-2 h-4 bg-purple-400"
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ repeat: Infinity, duration: 0.5 }}
                                />
                              )}
                            </motion.div>
                          )}
                          
                          {/* Animated Output Lines */}
                          <AnimatePresence>
                            {displayedLines.map((line, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15 }}
                                className={line.className || 'text-gray-300'}
                              >
                                {line.text || '\u00A0'}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          {/* Loading indicator during animation */}
                          {isAnimating && commandComplete && displayedLines.length < (currentScenario?.output.length || 0) && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2 text-gray-500 mt-2"
                            >
                              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-purple-400" />
                            </motion.div>
                          )}
                          
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </>
                  )}

                  {/* Live Mode Output */}
                  {isLiveMode && (
                    <>
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 sm:space-y-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                            <Terminal className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-600" />
                          </div>
                          <div className="text-center space-y-0.5 sm:space-y-1 px-4">
                            <p className="text-sm sm:text-base text-gray-400">Ready to accomplish any task on Linux</p>
                            <p className="text-xs sm:text-sm text-gray-600">Click an example above or describe what you need</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {messages.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {message.role === "user" ? (
                                <div className="flex items-start gap-1.5 sm:gap-2 flex-wrap">
                                  <span className="text-purple-400 font-bold">$</span>
                                  <span className="text-cyan-400">cx</span>
                                  <span className="text-white break-all">{message.content}</span>
                                </div>
                              ) : (
                                <div className="pl-2 sm:pl-4 border-l-2 border-gray-800 text-gray-300 whitespace-pre-wrap overflow-x-auto">
                                  {formatOutput(message.content)}
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {isLoading && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2 text-gray-500 pl-2 sm:pl-4"
                            >
                              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-purple-400" />
                              <span className="text-gray-400 text-xs sm:text-sm">Generating commands...</span>
                            </motion.div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900/50 border-t border-gray-500/50 text-[10px] sm:text-xs text-gray-500">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isAnimating ? 'bg-purple-500' : 'bg-green-500/80'} animate-pulse`} />
                      <span className="hidden sm:inline">{isAnimating ? 'Running' : 'Ready'}</span>
                    </span>
                    {isLiveMode && remaining !== null && (
                      <>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <span>{remaining} left</span>
                      </>
                    )}
                    {!isLiveMode && (
                      <>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <span className="text-purple-400">Demo Mode</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isLiveMode && (
                      <a 
                        href="?mode=live" 
                        className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span className="hidden sm:inline">Try Live API</span>
                      </a>
                    )}
                    <span className="text-gray-600">v2.4.0</span>
                  </div>
                </div>
              </div>

              {/* Error Display - Only in live mode */}
              {isLiveMode && error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 sm:p-4 bg-red-500/10 border-t border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="break-all">{error}</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Install CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center space-y-3 sm:space-y-4"
        >
          <motion.a 
            href="https://github.com/cxlinux-ai/cx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-transparent border-2 border-white text-white font-semibold text-[15px] cursor-pointer hover:bg-white/25 hover:backdrop-blur-md transition-all duration-300"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="button-install-cli"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Install the CLI for Unlimited Access</span>
            <span className="sm:hidden">Install CLI</span>
            <ArrowRight size={16} strokeWidth={2.5} className="opacity-60 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all duration-300" />
          </motion.a>
          <p className="text-xs sm:text-sm text-gray-500">
            Free forever · Open source · No credit card
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function formatOutput(content: string): React.ReactNode {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/```\w*\n?/g, "").trim();
      const lines = code.split('\n');
      return (
        <div key={i} className="my-2 sm:my-3 rounded-md sm:rounded-lg overflow-hidden bg-black/60 border border-gray-500/50">
          <div className="flex items-center justify-between px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-800/50 border-b border-gray-500/50">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500">bash</span>
          </div>
          <code className="block p-2 sm:p-3 text-green-400 overflow-x-auto text-[11px] sm:text-xs md:text-sm">
            {lines.map((line, lineIndex) => (
              <div key={lineIndex} className="flex gap-2 sm:gap-3">
                <span className="text-gray-600 select-none w-4 sm:w-5 text-right flex-shrink-0 hidden sm:block">{lineIndex + 1}</span>
                <span className="break-all">{line}</span>
              </div>
            ))}
          </code>
        </div>
      );
    }
    return <span key={i} className="text-gray-400">{part}</span>;
  });
}
