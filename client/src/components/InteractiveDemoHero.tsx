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
      <div className="w-full max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 p-8 md:p-12 text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Thanks for trying Cortex!</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Ready for the full experience with unlimited access?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-lg px-8 py-6"
              >
                <Download className="w-5 h-5 mr-2" />
                Install Cortex CLI
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
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Try Before Install — No Signup Required</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Experience Cortex in <span className="gradient-text">10 Seconds</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Type what you need in plain English. Watch Cortex generate the exact commands.
          </p>
          {remaining !== null && (
            <p className="text-sm text-gray-500">
              {remaining} {remaining === 1 ? 'request' : 'requests'} remaining in demo
            </p>
          )}
        </div>

        {/* Interactive Demo Card */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
          
          <Card className="relative bg-gray-950/90 border-gray-800/50 backdrop-blur-xl overflow-hidden rounded-xl shadow-2xl">
            {/* Terminal Header with macOS-style controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400 font-medium">cortex — interactive demo</span>
                </div>
              </div>
              {messages.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyLastCommand}
                  className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                  data-testid="button-copy-command"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="ml-1.5 text-xs">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              )}
            </div>

            <CardContent className="p-0">
              {/* Input Section */}
              <div className="p-5 bg-gray-900/40 border-b border-gray-800/50">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1 relative group/input">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-mono text-sm font-bold">
                        $
                      </span>
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe what you want to install..."
                        className="pl-9 bg-gray-950/60 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 h-12 text-base rounded-lg transition-all"
                        disabled={isLoading}
                        data-testid="input-demo-command"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 h-12 px-5 rounded-lg shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
                      data-testid="button-submit-demo"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Run
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Example Chips */}
                  <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {EXAMPLE_PROMPTS.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => handleExampleClick(example)}
                        disabled={isLoading}
                        className="group/chip flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        data-testid={`button-example-${example.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <ChevronRight className="w-3 h-3 text-purple-400 opacity-0 group-hover/chip:opacity-100 transition-opacity" />
                        {example}
                      </button>
                    ))}
                  </div>
                </form>
              </div>

              {/* Terminal Output */}
              <div className="bg-gray-950/60">
                <div 
                  ref={terminalRef}
                  className="h-[280px] md:h-[320px] overflow-y-auto p-5 font-mono text-sm scroll-smooth"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                        <Terminal className="relative w-14 h-14 text-gray-600" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-base text-gray-400">Ready to help you install anything</p>
                        <p className="text-sm text-gray-600">Click an example above or type your own request</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {message.role === "user" ? (
                            <div className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold">$</span>
                              <span className="text-cyan-400">cortex</span>
                              <span className="text-white">{message.content}</span>
                            </div>
                          ) : (
                            <div className="pl-4 border-l-2 border-gray-800 text-gray-300 whitespace-pre-wrap">
                              {formatOutput(message.content)}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-gray-500 pl-4"
                        >
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          <span className="text-gray-400">Generating commands...</span>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-t border-gray-800/50 text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500/80 animate-pulse" />
                      Connected
                    </span>
                    {remaining !== null && (
                      <span className="text-gray-600">|</span>
                    )}
                    {remaining !== null && (
                      <span>{remaining} requests left</span>
                    )}
                  </div>
                  <span className="text-gray-600">cortex v2.4.0</span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-red-500/10 border-t border-red-500/30 text-red-400 text-sm flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {error}
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
          className="text-center space-y-4"
        >
          <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-lg px-8 py-6 shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              Install the CLI for Unlimited Access
            </Button>
          </a>
          <p className="text-sm text-gray-500">
            Free forever · Open source · No credit card required
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
        <div key={i} className="my-3 rounded-lg overflow-hidden bg-black/60 border border-gray-800/50">
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/50 border-b border-gray-800/50">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">bash</span>
          </div>
          <code className="block p-3 text-green-400 overflow-x-auto">
            {lines.map((line, lineIndex) => (
              <div key={lineIndex} className="flex gap-3">
                <span className="text-gray-600 select-none w-5 text-right flex-shrink-0">{lineIndex + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </code>
        </div>
      );
    }
    return <span key={i} className="text-gray-400">{part}</span>;
  });
}
