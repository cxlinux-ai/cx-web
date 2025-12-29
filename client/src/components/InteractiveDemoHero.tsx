import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCortexDemo } from "@/hooks/useCortexDemo";
import { Send, Terminal, Loader2, Copy, Check, Download, Sparkles, ChevronRight } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Set up Python for machine learning",
  "Install Docker on Ubuntu",
  "Configure nginx web server",
  "Install PostgreSQL database",
  "Set up Node.js development environment",
];

export default function InteractiveDemoHero() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    remaining,
    limitReached,
    sendMessage,
  } = useCortexDemo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput("");
    await sendMessage(message);
  };

  const handleExampleClick = async (example: string) => {
    if (isLoading) return;
    setInput(example);
    // Auto-submit after a brief moment to show the user what was selected
    setTimeout(async () => {
      await sendMessage(example);
      setInput("");
    }, 300);
  };

  const copyLastCommand = () => {
    const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
    if (lastAssistant) {
      const codeMatch = lastAssistant.content.match(/```[\s\S]*?```/g);
      const textToCopy = codeMatch
        ? codeMatch.map((c) => c.replace(/```\w*\n?/g, "").trim()).join("\n")
        : lastAssistant.content;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show limit reached state
  if (limitReached) {
    return (
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 p-5 sm:p-8 md:p-12 text-center"
        >
          <div className="mb-4">
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto text-purple-400" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">Thanks for trying Cortex!</h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-5 sm:mb-8 max-w-xl mx-auto">
            Ready for the full experience with unlimited access?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-sm sm:text-base px-5 sm:px-8 py-3 sm:py-5"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Install Cortex CLI
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] sm:text-xs md:text-sm font-medium text-purple-300">Try Before Install — No Signup Required</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            Experience Cortex in <span className="gradient-text">10 Seconds</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Type what you need in plain English. Watch Cortex generate the exact commands.
          </p>
          {remaining !== null && (
            <p className="text-[11px] sm:text-xs text-gray-500">
              {remaining} {remaining === 1 ? 'request' : 'requests'} remaining in demo
            </p>
          )}
        </div>

        {/* Interactive Demo Card */}
        <div className="relative group">
          {/* Glow effect - hidden on mobile for performance */}
          <div className="hidden md:block absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
          
          <Card className="relative bg-gray-950/95 border-gray-800/60 backdrop-blur-xl overflow-hidden rounded-xl shadow-2xl">
            {/* Terminal Header with macOS-style controls */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900/80 border-b border-gray-800/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                </div>
                <div className="ml-2 sm:ml-3 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                  <span className="text-[11px] sm:text-xs md:text-sm text-gray-400 font-medium">
                    <span className="hidden sm:inline">cortex — </span>demo
                  </span>
                </div>
              </div>
              {messages.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyLastCommand}
                  className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-800/80"
                  data-testid="button-copy-command"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1.5 text-[10px] sm:text-xs hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              )}
            </div>

            <CardContent className="p-0">
              {/* Input Section */}
              <div className="p-3 sm:p-4 bg-gray-900/40 border-b border-gray-800/50">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-mono text-sm font-bold">
                        $
                      </span>
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe what you want to install..."
                        className="pl-7 sm:pl-8 bg-gray-950/70 border-gray-700/60 text-white placeholder:text-gray-500 focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 h-11 sm:h-12 text-sm rounded-lg"
                        disabled={isLoading}
                        data-testid="input-demo-command"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 h-11 sm:h-12 px-4 sm:px-5 rounded-lg shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:shadow-none min-w-[52px] sm:min-w-[80px]"
                      data-testid="button-submit-demo"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span className="ml-2 hidden sm:inline text-sm font-medium">Run</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Example Chips - Scrollable on mobile */}
                  <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar -mx-0.5 px-0.5">
                    {EXAMPLE_PROMPTS.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => handleExampleClick(example)}
                        disabled={isLoading}
                        className="group/chip flex-shrink-0 flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 active:bg-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        data-testid={`button-example-${example.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <ChevronRight className="w-3 h-3 text-purple-400 opacity-0 group-hover/chip:opacity-100 transition-opacity hidden sm:block" />
                        {example}
                      </button>
                    ))}
                  </div>
                </form>
              </div>

              {/* Terminal Output */}
              <div className="bg-gray-950/70">
                <div 
                  ref={terminalRef}
                  className="min-h-[180px] h-[200px] sm:h-[240px] md:h-[280px] lg:h-[300px] overflow-y-auto p-3 sm:p-4 font-mono text-xs sm:text-sm scroll-smooth"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                        <Terminal className="relative w-10 h-10 sm:w-12 sm:h-12 text-gray-600" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm text-gray-400">Ready to help you install anything</p>
                        <p className="text-[11px] sm:text-xs text-gray-600">Click an example above or type your own request</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {message.role === "user" ? (
                            <div className="flex items-start gap-1.5 flex-wrap">
                              <span className="text-purple-400 font-bold">$</span>
                              <span className="text-cyan-400">cortex</span>
                              <span className="text-white break-words">{message.content}</span>
                            </div>
                          ) : (
                            <div className="pl-3 border-l-2 border-gray-800 text-gray-300 whitespace-pre-wrap overflow-x-auto">
                              {formatOutput(message.content)}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-gray-500 pl-3"
                        >
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                          <span className="text-gray-400 text-xs">Generating commands...</span>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-gray-900/60 border-t border-gray-800/50 text-[10px] sm:text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="hidden sm:inline">Connected</span>
                    </span>
                    {remaining !== null && (
                      <>
                        <span className="text-gray-700 hidden sm:inline">|</span>
                        <span>{remaining} left</span>
                      </>
                    )}
                  </div>
                  <span className="text-gray-600">v2.4.0</span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-red-500/10 border-t border-red-500/30 text-red-400 text-xs flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="break-words">{error}</span>
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
          className="text-center space-y-3"
        >
          <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-sm sm:text-base px-5 sm:px-8 py-3 sm:py-5 shadow-lg hover:shadow-blue-500/40 transition-all"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Install the CLI for Unlimited Access</span>
              <span className="sm:hidden">Install CLI for Full Access</span>
            </Button>
          </a>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Free forever · Open source · No credit card
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function formatCommandsPreview(content: string): React.ReactNode {
  const codeMatch = content.match(/```[\s\S]*?```/g);
  if (codeMatch) {
    return (
      <div className="space-y-2">
        {codeMatch.map((block, i) => {
          const code = block.replace(/```\w*\n?/g, "").trim();
          return (
            <div key={i} className="text-green-400">
              {code}
            </div>
          );
        })}
      </div>
    );
  }
  return <div className="text-gray-400">Processing...</div>;
}

function formatOutput(content: string): React.ReactNode {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/```\w*\n?/g, "").trim();
      const lines = code.split('\n');
      return (
        <div key={i} className="my-2 rounded-lg overflow-hidden bg-black/50 border border-gray-800/60">
          <div className="flex items-center px-2.5 py-1 bg-gray-800/60 border-b border-gray-800/50">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-medium">bash</span>
          </div>
          <code className="block p-2.5 sm:p-3 text-green-400 overflow-x-auto text-[11px] sm:text-xs leading-relaxed">
            {lines.map((line, lineIndex) => (
              <div key={lineIndex} className="flex gap-2 sm:gap-3">
                <span className="text-gray-600 select-none w-4 text-right flex-shrink-0 hidden sm:block">{lineIndex + 1}</span>
                <span className="break-words">{line}</span>
              </div>
            ))}
          </code>
        </div>
      );
    }
    return <span key={i} className="text-gray-400">{part}</span>;
  });
}
