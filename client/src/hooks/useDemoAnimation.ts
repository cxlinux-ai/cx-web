import { useState, useCallback, useRef, useEffect } from 'react';

export interface AnimatedLine {
  text: string;
  delay?: number;  // delay before showing this line (ms)
  className?: string;  // optional styling
}

export interface DemoScenario {
  id: string;
  name: string;
  icon: string;
  command: string;
  output: AnimatedLine[];
}

// 4 preset scenarios based on real CX Linux output
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'ask',
    name: 'Ask AI',
    icon: '💬',
    command: 'cx ask "I need tools for Python web development"',
    output: [
      { text: '', delay: 200 },
      { text: '╭──────────────────────── AI Response ────────────────────────╮', className: 'text-purple-400' },
      { text: '│ For Python web development, here are the essential tools:   │', className: 'text-gray-300' },
      { text: '│                                                              │', className: 'text-gray-500' },
      { text: '│ Web Frameworks:                                              │', className: 'text-cyan-400' },
      { text: '│   • FastAPI - Modern, fast framework with auto API docs      │', className: 'text-gray-300' },
      { text: '│   • Flask - Lightweight, flexible microframework             │', className: 'text-gray-300' },
      { text: '│   • Django - Full-featured framework with ORM                │', className: 'text-gray-300' },
      { text: '│                                                              │', className: 'text-gray-500' },
      { text: '│ Development Tools:                                           │', className: 'text-cyan-400' },
      { text: '│   • uvicorn - ASGI server for FastAPI                        │', className: 'text-gray-300' },
      { text: '│   • gunicorn - WSGI server for production                    │', className: 'text-gray-300' },
      { text: '│   • python3-venv - Virtual environments                      │', className: 'text-gray-300' },
      { text: '│                                                              │', className: 'text-gray-500' },
      { text: '│ Install a complete stack with: cx stack webdev               │', className: 'text-green-400' },
      { text: '╰──────────────────────────────────────────────────────────────╯', className: 'text-purple-400' },
    ]
  },
  {
    id: 'install',
    name: 'Install',
    icon: '📦',
    command: 'cx install "docker and nodejs for my project"',
    output: [
      { text: '', delay: 200 },
      { text: ' CX  │ Analyzing request...', className: 'text-purple-400', delay: 400 },
      { text: ' CX  │ Installing docker.io nodejs...', className: 'text-purple-400', delay: 600 },
      { text: '', delay: 200 },
      { text: 'Generated commands:', className: 'text-gray-400' },
      { text: '  1. sudo apt update', className: 'text-cyan-400' },
      { text: '  2. sudo apt install -y docker.io', className: 'text-cyan-400' },
      { text: '  3. sudo systemctl enable docker', className: 'text-cyan-400' },
      { text: '  4. sudo apt install -y nodejs npm', className: 'text-cyan-400' },
      { text: '', delay: 200 },
      { text: '🔒 To execute: cx install docker nodejs --execute', className: 'text-yellow-400' },
    ]
  },
  {
    id: 'stack',
    name: 'Stack',
    icon: '🚀',
    command: 'cx stack webdev',
    output: [
      { text: '', delay: 200 },
      { text: '🚀 Installing stack: Web Development', className: 'text-purple-400' },
      { text: '', delay: 300 },
      { text: ' CX  │ Installing nodejs npm nginx postgresql...', className: 'text-purple-400', delay: 500 },
      { text: '', delay: 400 },
      { text: '[1/4] ✓ nodejs installed', className: 'text-green-400', delay: 600 },
      { text: '[2/4] ✓ npm installed', className: 'text-green-400', delay: 500 },
      { text: '[3/4] ✓ nginx installed', className: 'text-green-400', delay: 500 },
      { text: '[4/4] ✓ postgresql installed', className: 'text-green-400', delay: 500 },
      { text: '', delay: 200 },
      { text: '✅ Stack \'webdev\' installed successfully!', className: 'text-green-500 font-bold' },
    ]
  },
  {
    id: 'status',
    name: 'Status',
    icon: '📊',
    command: 'cx status',
    output: [
      { text: '', delay: 200 },
      { text: '╭─────────────── System Status ───────────────╮', className: 'text-purple-400' },
      { text: '│ OS: Ubuntu 22.04 LTS                        │', className: 'text-gray-300' },
      { text: '│ Kernel: 5.15.0-generic                      │', className: 'text-gray-300' },
      { text: '│ CPU: AMD Ryzen 9 (16 cores)                 │', className: 'text-gray-300' },
      { text: '│ RAM: 32GB (12GB available)                  │', className: 'text-gray-300' },
      { text: '│ GPU: NVIDIA RTX 4090 ✓ CUDA 12.3            │', className: 'text-green-400' },
      { text: '│ Docker: Running (3 containers)              │', className: 'text-green-400' },
      { text: '│ Last backup: 2 hours ago                    │', className: 'text-gray-300' },
      { text: '╰─────────────────────────────────────────────╯', className: 'text-purple-400' },
    ]
  },
];

interface AnimationState {
  isAnimating: boolean;
  currentScenario: DemoScenario | null;
  displayedCommand: string;
  displayedLines: AnimatedLine[];
  commandComplete: boolean;
}

export function useDemoAnimation() {
  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    currentScenario: null,
    displayedCommand: '',
    displayedLines: [],
    commandComplete: false,
  });
  
  const animationRef = useRef<number | null>(null);
  const cancelRef = useRef(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const sleep = (ms: number) => new Promise(resolve => {
    const timeout = setTimeout(resolve, ms);
    // Check if cancelled during sleep
    if (cancelRef.current) {
      clearTimeout(timeout);
      return Promise.reject('cancelled');
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  });

  const typeCommand = async (command: string, onUpdate: (text: string) => void) => {
    let current = '';
    const speed = 30; // 30ms per character for command
    
    for (const char of command) {
      if (cancelRef.current) return;
      current += char;
      onUpdate(current);
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  };

  const playScenario = useCallback(async (scenario: DemoScenario) => {
    // Cancel any ongoing animation
    cancelRef.current = true;
    await new Promise(resolve => setTimeout(resolve, 50));
    cancelRef.current = false;

    setState({
      isAnimating: true,
      currentScenario: scenario,
      displayedCommand: '',
      displayedLines: [],
      commandComplete: false,
    });

    try {
      // Type the command
      await typeCommand(scenario.command, (text) => {
        if (!cancelRef.current) {
          setState(prev => ({ ...prev, displayedCommand: text }));
        }
      });

      if (cancelRef.current) return;

      setState(prev => ({ ...prev, commandComplete: true }));
      await new Promise(resolve => setTimeout(resolve, 300));

      // Show output lines one by one
      for (let i = 0; i < scenario.output.length; i++) {
        if (cancelRef.current) return;
        
        const line = scenario.output[i];
        const delay = line.delay || 80; // default 80ms between lines
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (cancelRef.current) return;
        
        setState(prev => ({
          ...prev,
          displayedLines: [...prev.displayedLines, line],
        }));
      }

      // Animation complete
      setState(prev => ({ ...prev, isAnimating: false }));
    } catch (e) {
      // Animation was cancelled
      console.log('Animation cancelled');
    }
  }, []);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setState({
      isAnimating: false,
      currentScenario: null,
      displayedCommand: '',
      displayedLines: [],
      commandComplete: false,
    });
  }, []);

  return {
    ...state,
    playScenario,
    reset,
    scenarios: DEMO_SCENARIOS,
  };
}

export default useDemoAnimation;
