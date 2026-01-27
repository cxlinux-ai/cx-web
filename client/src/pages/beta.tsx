import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCxDemo } from "@/hooks/useCxDemo";
import { ArrowLeft, Send, Terminal, Loader2, Copy, Check, Download, Sparkles } from "lucide-react";

export default function BetaPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    remaining,
    limitReached,
    sendMessage,
    clearMessages,
  } = useCxDemo();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput("");
    await sendMessage(message);
  };

  const handleExample = (example: string) => {
    setInput(example);
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

  if (limitReached) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md w-full bg-gray-900 border-gray-800">
            <CardContent className="pt-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Thanks for trying CX Linux!</h2>
              <p className="text-gray-400 mb-6">
                You've used all 5 demo requests. Ready for the full experience?
              </p>
              <Link href="/#install">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90">
                  <Download className="w-4 h-4 mr-2" />
                  Install CX Linux
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full mt-2 text-gray-400">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            {remaining !== null && (
              <span className="text-sm text-gray-500">{remaining} requests left</span>
            )}
            <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
              DEMO
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Try CX Linux
          </h1>
          <p className="text-gray-400">
            Natural language package management. Ask CX Linux to install, configure, or fix anything.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            "install nginx",
            "set up docker",
            "install python for ML",
            "fix broken dependencies",
          ].map((example) => (
            <button
              key={example}
              onClick={() => handleExample(example)}
              className="px-3 py-1.5 text-sm bg-gray-900 border border-gray-800 rounded-full text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-4">
          <CardHeader className="border-b border-gray-800 py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-300">
              <Terminal className="w-4 h-4" />
              CX Linux Terminal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto p-4 font-mono text-sm">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Type a command like "install nginx" to get started
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 ${message.role === "user" ? "text-cyan-400" : "text-gray-300"}`}
                  >
                    <span className="text-gray-500">
                      {message.role === "user" ? "$ cx " : ""}
                    </span>
                    <span className="whitespace-pre-wrap">
                      {message.role === "user" ? message.content : formatOutput(message.content)}
                    </span>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono">$</span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="install nginx --dry-run"
              className="pl-8 bg-gray-900 border-gray-800 text-white font-mono focus:border-purple-500"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={copyLastCommand}
              className="border-gray-800 text-gray-400 hover:text-white"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </form>

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-gray-500 hover:text-gray-300"
            disabled={messages.length === 0}
          >
            Clear session
          </Button>
          <Link href="/#install">
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              Install the real thing →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function formatOutput(content: string): React.ReactNode {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/```\w*\n?/g, "").trim();
      return (
        <code key={i} className="block bg-black p-2 rounded my-2 text-green-400 overflow-x-auto">
          {code}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
