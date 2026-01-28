import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Send,
  Copy,
  Check,
  Settings,
  Terminal,
  Sparkles,
  Github,
  Eye,
  EyeOff,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

type Provider = "anthropic" | "openai";

interface HistoryEntry {
  id: string;
  request: string;
  commands: string;
  timestamp: Date;
  provider: Provider;
  dryRun: boolean;
}

const STORAGE_KEYS = {
  ANTHROPIC_KEY: "cortex_anthropic_api_key",
  OPENAI_KEY: "cortex_openai_api_key",
  PROVIDER: "cortex_provider",
  DRY_RUN: "cortex_dry_run",
};

const EXAMPLE_PROMPTS = [
  "install docker with compose",
  "set up python for machine learning",
  "configure nginx as reverse proxy",
  "install nodejs and npm",
  "set up postgresql database",
];

const SYSTEM_PROMPT = `You are Cortex Linux, an AI assistant that converts natural language requests into Linux package installation and configuration commands.

Your task is to generate the exact bash commands needed to fulfill the user's request on Ubuntu/Debian Linux.

Rules:
1. Return ONLY the bash commands, no explanations or markdown
2. Use apt-get for package management (with -y flag for non-interactive)
3. Include any necessary configuration commands
4. Handle dependencies automatically
5. Use sudo where required
6. Each command should be on a new line
7. If multiple steps are needed, include all of them in order
8. Be security-conscious - don't include dangerous commands

Example output format:
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER`;

export default function BetaPage() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedAnthropicKey = localStorage.getItem(STORAGE_KEYS.ANTHROPIC_KEY) || "";
    const savedOpenaiKey = localStorage.getItem(STORAGE_KEYS.OPENAI_KEY) || "";
    const savedProvider = (localStorage.getItem(STORAGE_KEYS.PROVIDER) as Provider) || "anthropic";
    const savedDryRun = localStorage.getItem(STORAGE_KEYS.DRY_RUN) !== "false";

    setAnthropicKey(savedAnthropicKey);
    setOpenaiKey(savedOpenaiKey);
    setProvider(savedProvider);
    setDryRun(savedDryRun);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANTHROPIC_KEY, anthropicKey);
  }, [anthropicKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPENAI_KEY, openaiKey);
  }, [openaiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRY_RUN, String(dryRun));
  }, [dryRun]);

  // Scroll terminal to bottom on new entries
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const getCurrentApiKey = () => {
    return provider === "anthropic" ? anthropicKey : openaiKey;
  };

  const callAnthropicAPI = async (userInput: string): Promise<string> => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Convert this request to Linux installation/configuration commands: "${userInput}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Anthropic API request failed");
    }

    const data = await response.json();
    return data.content[0].text;
  };

  const callOpenAIAPI = async (userInput: string): Promise<string> => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Convert this request to Linux installation/configuration commands: "${userInput}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI API request failed");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      toast({
        title: "Empty request",
        description: "Please enter what you want to install or configure.",
        variant: "destructive",
      });
      return;
    }

    const apiKey = getCurrentApiKey();
    if (!apiKey) {
      setSettingsOpen(true);
      toast({
        title: "API key required",
        description: `Please enter your ${provider === "anthropic" ? "Anthropic" : "OpenAI"} API key in settings.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let commands: string;

      if (provider === "anthropic") {
        commands = await callAnthropicAPI(input);
      } else {
        commands = await callOpenAIAPI(input);
      }

      const entry: HistoryEntry = {
        id: Date.now().toString(),
        request: input,
        commands,
        timestamp: new Date(),
        provider,
        dryRun,
      };

      setHistory((prev) => [...prev, entry]);
      setInput("");

      toast({
        title: "Commands generated",
        description: dryRun
          ? "Dry run mode - commands shown but not executed."
          : "Commands ready to copy and run.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate commands",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied!",
        description: "Commands copied to clipboard.",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-sm font-medium mb-6">
            <Sparkles size={16} />
            Beta Preview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-300 via-gray-200 to-blue-400 bg-clip-text text-transparent">
            Try Cortex Linux
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience AI-powered Linux administration. Enter natural language commands and get
            instant package installation scripts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input and Terminal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Command Input Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Terminal size={20} className="text-blue-400" />
                  Command Generator
                </CardTitle>
                <CardDescription>
                  Describe what you want to install or configure in plain English
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="What do you want to install?"
                      className="flex-1 bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-400"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Example Prompts */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">Try:</span>
                    {EXAMPLE_PROMPTS.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => handleExampleClick(example)}
                        className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-blue-400 hover:border-blue-400/50 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Terminal Output */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    Terminal Output
                  </span>
                  {dryRun && (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                      Dry Run Mode
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={terminalRef}
                  className="bg-black rounded-lg p-4 font-mono text-sm min-h-[300px] max-h-[500px] overflow-y-auto border border-white/10"
                >
                  {history.length === 0 ? (
                    <div className="text-gray-500 flex items-center justify-center h-full">
                      <div className="text-center">
                        <Terminal className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                        <p>Generated commands will appear here</p>
                        <p className="text-xs mt-2 text-gray-600">
                          Enter a request above to get started
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {history.map((entry) => (
                        <div key={entry.id} className="group">
                          {/* User Request */}
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-green-400">$</span>
                            <span className="text-gray-300">cortex install "{entry.request}"</span>
                          </div>

                          {/* Provider Badge */}
                          <div className="ml-4 mb-2 flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                              {entry.provider === "anthropic" ? "Claude" : "GPT-4"}
                            </span>
                            <span className="text-xs text-gray-600">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          </div>

                          {/* Generated Commands */}
                          <div className="ml-4 relative">
                            <pre className="text-green-400 whitespace-pre-wrap bg-white/5 rounded-lg p-3 border border-white/10">
                              {entry.commands}
                            </pre>
                            <button
                              onClick={() => copyToClipboard(entry.commands, entry.id)}
                              className="absolute top-2 right-2 p-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                              title="Copy to clipboard"
                            >
                              {copiedId === entry.id ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>

                          {entry.dryRun && (
                            <div className="ml-4 mt-2 flex items-center gap-2 text-xs text-yellow-400">
                              <AlertCircle className="h-3 w-3" />
                              Dry run - commands not executed
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Settings Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings size={20} className="text-blue-400" />
                  Settings
                </CardTitle>
                <CardDescription>Configure your API provider and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Provider Selection */}
                <div className="space-y-2">
                  <Label className="text-gray-300">AI Provider</Label>
                  <Tabs value={provider} onValueChange={(v) => setProvider(v as Provider)}>
                    <TabsList className="grid w-full grid-cols-2 bg-black/50">
                      <TabsTrigger
                        value="anthropic"
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        Claude
                      </TabsTrigger>
                      <TabsTrigger
                        value="openai"
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        OpenAI
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* API Key Input */}
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    {provider === "anthropic" ? "Anthropic" : "OpenAI"} API Key
                  </Label>
                  <div className="relative">
                    <Input
                      type={
                        provider === "anthropic"
                          ? showAnthropicKey
                            ? "text"
                            : "password"
                          : showOpenaiKey
                            ? "text"
                            : "password"
                      }
                      value={provider === "anthropic" ? anthropicKey : openaiKey}
                      onChange={(e) =>
                        provider === "anthropic"
                          ? setAnthropicKey(e.target.value)
                          : setOpenaiKey(e.target.value)
                      }
                      placeholder={`Enter your ${provider === "anthropic" ? "Anthropic" : "OpenAI"} API key`}
                      className="bg-black/50 border-white/20 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        provider === "anthropic"
                          ? setShowAnthropicKey(!showAnthropicKey)
                          : setShowOpenaiKey(!showOpenaiKey)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {(provider === "anthropic" ? showAnthropicKey : showOpenaiKey) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Keys are stored locally, never sent to our servers
                  </p>
                </div>

                {/* Dry Run Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Dry Run Mode</Label>
                    <p className="text-xs text-gray-500">Show commands without executing</p>
                  </div>
                  <Checkbox
                    checked={dryRun}
                    onCheckedChange={(checked) => setDryRun(checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap size={20} className="text-blue-400" />
                  Want More Features?
                </CardTitle>
                <CardDescription>
                  Install the full Cortex Linux CLI for hardware detection, rollback support, and
                  more.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-black/50 rounded-lg p-3 font-mono text-sm border border-white/10">
                  <span className="text-gray-500"># Install Cortex CLI</span>
                  <br />
                  <span className="text-green-400">pip install cortex-linux</span>
                </div>
                <a
                  href="https://github.com/cortexlinux/cortex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
                >
                  <Github size={20} />
                  View on GitHub
                </a>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="text-xs text-gray-500 space-y-2 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="font-medium text-gray-400">Security Notice</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>API calls are made directly from your browser</li>
                <li>Your API keys never leave your device</li>
                <li>Generated commands should be reviewed before running</li>
                <li>This is a demo - use the full CLI for production</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent className="bg-black border-white/10">
          <SheetHeader>
            <SheetTitle className="text-white">Settings</SheetTitle>
            <SheetDescription>Configure your API provider and preferences</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label className="text-gray-300">AI Provider</Label>
              <Tabs value={provider} onValueChange={(v) => setProvider(v as Provider)}>
                <TabsList className="grid w-full grid-cols-2 bg-white/5">
                  <TabsTrigger
                    value="anthropic"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Claude
                  </TabsTrigger>
                  <TabsTrigger
                    value="openai"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    OpenAI
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label className="text-gray-300">
                {provider === "anthropic" ? "Anthropic" : "OpenAI"} API Key
              </Label>
              <Input
                type="password"
                value={provider === "anthropic" ? anthropicKey : openaiKey}
                onChange={(e) =>
                  provider === "anthropic"
                    ? setAnthropicKey(e.target.value)
                    : setOpenaiKey(e.target.value)
                }
                placeholder={`Enter your ${provider === "anthropic" ? "Anthropic" : "OpenAI"} API key`}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <Button onClick={() => setSettingsOpen(false)} className="w-full bg-blue-500">
              Save Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
