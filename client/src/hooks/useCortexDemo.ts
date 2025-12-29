import { useState, useCallback } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

interface DemoState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  remaining: number | null;
  limitReached: boolean;
}

const SYSTEM_CONTEXT = `You are Cortex, an AI-powered Linux package manager assistant. When a user asks for installation or configuration help, respond with ONLY the required shell commands in a single code block. Do NOT include:
- Explanatory text or headers (like "Here's how to..." or "## Install X")
- Comments or annotations within or outside the code block
- Additional notes or instructions
- Any text before or after the code block

Only output the essential commands needed to accomplish the task, formatted in a single bash code block.
`;

export function useCortexDemo() {
  const [state, setState] = useState<DemoState>({
    messages: [], isLoading: false, error: null, remaining: null, limitReached: false
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading || state.limitReached) return;

    const userMessage: Message = { role: 'user', content };
    setState(prev => ({ ...prev, messages: [...prev.messages, userMessage], isLoading: true, error: null }));

    try {
      const apiMessages = [
        { role: 'user', content: SYSTEM_CONTEXT },
        { role: 'assistant', content: 'Understood. I will help with Cortex Linux package management.' },
        ...state.messages, userMessage
      ];

      const response = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, model: 'claude-sonnet-4-20250514', max_tokens: 1024 })
      });

      const data = await response.json();

      if (response.status === 429) {
        setState(prev => ({ ...prev, isLoading: false, limitReached: true, error: data.message }));
        return;
      }

      if (!response.ok) throw new Error(data.error || 'Request failed');

      const assistantMessage: Message = { role: 'assistant', content: data.content?.[0]?.text || 'No response' };
      setState(prev => ({
        ...prev, messages: [...prev.messages, assistantMessage], isLoading: false, remaining: data._demo?.remaining ?? prev.remaining
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error instanceof Error ? error.message : 'Error occurred' }));
    }
  }, [state.messages, state.isLoading, state.limitReached]);

  const clearMessages = useCallback(() => setState(prev => ({ ...prev, messages: [], error: null })), []);

  return { ...state, sendMessage, clearMessages };
}

export default useCortexDemo;
