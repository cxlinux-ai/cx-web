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
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Input Section */}
            <div className="p-6 border-b border-gray-800">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">
                      $
                    </span>
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="e.g., Install Docker on Ubuntu"
                      className="pl-8 bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700 h-12 px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {/* Example Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {EXAMPLE_PROMPTS.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      disabled={isLoading}
                      className="flex-shrink-0 px-4 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-full text-gray-300 hover:text-white hover:border-purple-500/50 hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Terminal Output */}
            <div className="bg-black/30">
              <CardHeader className="border-b border-gray-800 py-3 px-6">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-300">
                  <Terminal className="w-4 h-4" />
                  Output Terminal
                </CardTitle>
              </CardHeader>
              <div 
                ref={terminalRef}
                className="h-[300px] md:h-[350px] overflow-y-auto p-6 font-mono text-sm scroll-smooth"
              >
                {messages.length === 0 ? (
                  <div className="text-gray-500 text-center py-12 space-y-2">
                    <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-base">Ready to help you install anything</p>
                    <p className="text-sm">Try an example above or type your own request</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={message.role === "user" ? "text-cyan-400" : "text-gray-300"}
                      >
                        {message.role === "user" ? (
                          <div>
                            <span className="text-gray-500">$ cortex </span>
                            <span>{message.content}</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {formatOutput(message.content)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing your request...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border-t border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

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
      return (
        <code key={i} className="block bg-black/50 p-3 rounded border border-gray-800 my-2 text-green-400 overflow-x-auto">
          {code}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
