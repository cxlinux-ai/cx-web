import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Terminal, Copy, Check, Download, Sparkles, ArrowRight } from "lucide-react";

// Pre-scripted demo scenarios - no API calls, guaranteed to work
const DEMO_SCENARIOS = [
  {
    prompt: "Install Docker on Ubuntu",
    output: `# Update package index
sudo apt update

# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker && sudo systemctl enable docker`
  },
  {
    prompt: "Set up system monitoring",
    output: `# Install monitoring tools
sudo apt update && sudo apt install -y htop iotop nethogs sysstat

# Enable sysstat data collection
sudo sed -i 's/ENABLED="false"/ENABLED="true"/' /etc/default/sysstat
sudo systemctl enable sysstat && sudo systemctl start sysstat

# Create monitoring dashboard script
cat << 'EOF' > ~/monitor.sh
#!/bin/bash
while true; do
  clear
  echo "=== CPU & Memory ==="
  top -bn1 | head -5
  echo "\\n=== Disk I/O ==="
  iostat -x 1 1
  sleep 5
done
EOF
chmod +x ~/monitor.sh`
  },
  {
    prompt: "Configure firewall rules",
    output: `# Install and enable UFW
sudo apt install -y ufw

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (important!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status verbose`
  },
  {
    prompt: "Automate my backup script",
    output: `# Create backup script
cat << 'EOF' > ~/backup.sh
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y-%m-%d)"
SOURCE_DIRS="/home /etc /var/www"

mkdir -p "$BACKUP_DIR"
for dir in $SOURCE_DIRS; do
  tar -czf "$BACKUP_DIR/$(basename $dir).tar.gz" "$dir" 2>/dev/null
done
find /backup -type d -mtime +30 -exec rm -rf {} \\;
echo "Backup completed: $BACKUP_DIR"
EOF
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup.sh >> ~/backup.log 2>&1") | crontab -`
  },
  {
    prompt: "Create cron job for reports",
    output: `# Create report generation script
cat << 'EOF' > ~/daily-report.sh
#!/bin/bash
REPORT="/var/log/daily-report-$(date +%Y-%m-%d).txt"
{
  echo "=== Daily System Report ==="
  echo "Generated: $(date)"
  echo ""
  echo "=== Disk Usage ==="
  df -h
  echo ""
  echo "=== Memory ==="
  free -h
  echo ""
  echo "=== Top Processes ==="
  ps aux --sort=-%mem | head -10
} > "$REPORT"
echo "Report saved to $REPORT"
EOF
chmod +x ~/daily-report.sh

# Schedule daily at 6 AM
(crontab -l 2>/dev/null; echo "0 6 * * * ~/daily-report.sh") | crontab -`
  }
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function InteractiveDemoHero() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typeOutput = async (output: string) => {
    setIsTyping(true);
    
    // Type the output character by character for effect
    const lines = output.split('\n');
    let fullOutput = '';
    
    for (let i = 0; i < lines.length; i++) {
      fullOutput += (i > 0 ? '\n' : '') + lines[i];
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === 'assistant') {
          newMessages[newMessages.length - 1] = { role: 'assistant', content: '```bash\n' + fullOutput + '\n```' };
        }
        return newMessages;
      });
      await new Promise(r => setTimeout(r, 30 + Math.random() * 20));
    }
    
    setIsTyping(false);
  };

  const handleExampleClick = async (prompt: string) => {
    if (isTyping) return;
    
    const scenario = DEMO_SCENARIOS.find(s => s.prompt === prompt);
    if (!scenario) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    
    // Start typing assistant response
    await new Promise(r => setTimeout(r, 300));
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    await typeOutput(scenario.output);
    setCurrentScenario(prev => (prev + 1) % DEMO_SCENARIOS.length);
  };

  const copyLastCommand = () => {
    const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistant) {
      const code = lastAssistant.content.replace(/```bash\n?/g, '').replace(/```/g, '').trim();
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <span className="text-xs sm:text-sm font-medium text-purple-300">Interactive Demo — Click Any Example</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-2">
            Experience CX Linux in <span className="gradient-text">10 Seconds</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Click any task below. CX Linux generates the exact commands you need.
          </p>
        </div>

        {/* Interactive Demo Card */}
        <div className="relative group">
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
                  <span className="text-xs sm:text-sm text-gray-400 font-medium">cx — demo</span>
                </div>
              </div>
              {messages.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyLastCommand}
                  className="h-7 px-1.5 sm:px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  <span className="ml-1 sm:ml-1.5 text-[10px] sm:text-xs hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              )}
            </div>

            <CardContent className="p-0">
              {/* Example Prompts */}
              <div className="p-3 sm:p-4 md:p-5 bg-gray-900/40 border-b border-gray-500/50">
                <p className="text-xs sm:text-sm text-gray-400 mb-3">Click any task to see CX Linux in action:</p>
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
                  {DEMO_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.prompt}
                      type="button"
                      onClick={() => handleExampleClick(scenario.prompt)}
                      disabled={isTyping}
                      className="group/chip flex-shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-800/40 border border-gray-500/50 rounded-md sm:rounded-lg text-gray-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {scenario.prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Output */}
              <div className="bg-gray-950/60">
                <div className="h-[220px] sm:h-[260px] md:h-[300px] lg:h-[320px] overflow-y-auto p-3 sm:p-4 md:p-5 font-mono text-xs sm:text-sm scroll-smooth">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 sm:space-y-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                        <Terminal className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-600" />
                      </div>
                      <div className="text-center space-y-0.5 sm:space-y-1 px-4">
                        <p className="text-sm sm:text-base text-gray-400">Ready to accomplish any task on Linux</p>
                        <p className="text-xs sm:text-sm text-gray-600">Click an example above to see it in action</p>
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
                          {message.role === 'user' ? (
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
                      {isTyping && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-gray-500 pl-2 sm:pl-4"
                        >
                          <span className="animate-pulse">▌</span>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900/50 border-t border-gray-500/50 text-[10px] sm:text-xs text-gray-500">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500/80 animate-pulse" />
                      <span className="hidden sm:inline">Ready</span>
                    </span>
                  </div>
                  <span className="text-gray-600">v2.4.0</span>
                </div>
              </div>
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
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Install the CLI for Full Access</span>
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
    if (part.startsWith('```')) {
      const code = part.replace(/```\w*\n?/g, '').trim();
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
