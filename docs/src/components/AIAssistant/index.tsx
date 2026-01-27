/**
 * AI Documentation Assistant Component
 *
 * A floating chat bubble that provides AI-powered help for Cortex Linux documentation.
 * Features:
 * - Floating button on all pages
 * - Expandable chat interface
 * - Retrieval-only answers from docs
 * - Links to relevant documentation
 *
 * Note: This is an MVP implementation. The actual AI integration would connect
 * to a documentation search API or vector store in production.
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import styles from './styles.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  links?: Array<{ title: string; url: string }>;
}

// Pre-defined responses for common questions (MVP implementation)
// In production, this would be replaced with actual RAG/vector search
const KNOWLEDGE_BASE: Record<string, { answer: string; links: Array<{ title: string; url: string }> }> = {
  install: {
    answer: 'To install Cortex Linux, run the following command in your terminal:\n\n```bash\ncurl -fsSL https://cxlinux-ai.com/install.sh | bash\n```\n\nThis works on Ubuntu, Debian, Fedora, Arch, and other major distributions.',
    links: [
      { title: 'Installation Guide', url: '/docs/getting-started/installation' },
      { title: 'Quick Start', url: '/docs/getting-started/quick-start' },
    ],
  },
  uninstall: {
    answer: 'To uninstall Cortex Linux:\n\n```bash\ncortex uninstall\n```\n\nOr manually remove the binary and data:\n```bash\nsudo rm /usr/local/bin/cortex\nrm -rf ~/.cortex\n```',
    links: [
      { title: 'Installation Guide', url: '/docs/getting-started/installation' },
    ],
  },
  'dry-run': {
    answer: 'Dry-run mode lets you preview commands without executing them. Use the `--dry-run` or `-n` flag:\n\n```bash\ncortex --dry-run "install nginx"\n```\n\nYou can also set dry-run as the default mode in your configuration.',
    links: [
      { title: 'Dry-Run Mode', url: '/docs/user-guide/dry-run-mode' },
      { title: 'Configuration', url: '/docs/getting-started/configuration' },
    ],
  },
  rollback: {
    answer: 'Cortex automatically creates snapshots before changes. To undo the last operation:\n\n```bash\ncortex rollback\n```\n\nTo rollback a specific operation:\n```bash\ncortex history\ncortex rollback 3\n```',
    links: [
      { title: 'Rollback & Recovery', url: '/docs/user-guide/rollback-recovery' },
    ],
  },
  backend: {
    answer: 'Cortex supports multiple AI backends:\n\n- **Local** (default): Runs on your machine, fully private\n- **OpenAI**: GPT-4/3.5 models\n- **Anthropic**: Claude models\n- **Ollama**: Local models via Ollama\n\nChange backend with:\n```bash\ncortex backend set openai\n```',
    links: [
      { title: 'Supported AI Backends', url: '/docs/reference/ai-backends' },
      { title: 'Configuration', url: '/docs/getting-started/configuration' },
    ],
  },
  privacy: {
    answer: 'With the default local backend, all processing happens on your machine. No data is sent anywhere. If you use cloud backends (OpenAI, Anthropic), your prompts are sent to those providers.',
    links: [
      { title: 'FAQ', url: '/docs/faq' },
      { title: 'AI Backends', url: '/docs/reference/ai-backends' },
    ],
  },
  contribute: {
    answer: 'We welcome contributions! You can:\n\n1. Report bugs or suggest features on GitHub\n2. Submit pull requests\n3. Improve documentation\n4. Earn bounties for your work\n\nCheck out our Contributing guide to get started.',
    links: [
      { title: 'Development Setup', url: '/docs/contributing/development-setup' },
      { title: 'Bounty Program', url: '/docs/contributing/bounty-program' },
      { title: 'PR Guidelines', url: '/docs/contributing/pr-guidelines' },
    ],
  },
  docker: {
    answer: 'Cortex works great with Docker. To install Docker:\n\n```bash\ncortex "install docker"\n```\n\nCortex can help with container management, building images, and docker-compose.',
    links: [
      { title: 'Docker Integration', url: '/docs/tutorials/docker-integration' },
    ],
  },
  ci: {
    answer: 'Cortex works in CI/CD pipelines. Set these environment variables:\n\n```bash\nCORTEX_CI=true\nCORTEX_YES=true\n```\n\nWe have guides for GitHub Actions, GitLab CI, Jenkins, and more.',
    links: [
      { title: 'CI/CD Usage', url: '/docs/tutorials/cicd-usage' },
      { title: 'Environment Variables', url: '/docs/reference/environment-variables' },
    ],
  },
};

const FALLBACK_RESPONSE = {
  answer: "This isn't documented yet — check our Discord for help from the community, or browse the documentation using the search bar.",
  links: [
    { title: 'FAQ', url: '/docs/faq' },
    { title: 'Join Discord', url: 'https://discord.gg/ASvzWcuTfk' },
  ],
};

function findAnswer(query: string): { answer: string; links: Array<{ title: string; url: string }> } {
  const lowerQuery = query.toLowerCase();

  // Check for keyword matches
  for (const [keyword, response] of Object.entries(KNOWLEDGE_BASE)) {
    if (lowerQuery.includes(keyword)) {
      return response;
    }
  }

  // Check for related terms
  if (lowerQuery.includes('setup') || lowerQuery.includes('start')) {
    return KNOWLEDGE_BASE.install;
  }
  if (lowerQuery.includes('undo') || lowerQuery.includes('revert')) {
    return KNOWLEDGE_BASE.rollback;
  }
  if (lowerQuery.includes('preview') || lowerQuery.includes('test')) {
    return KNOWLEDGE_BASE['dry-run'];
  }
  if (lowerQuery.includes('ai') || lowerQuery.includes('model') || lowerQuery.includes('openai')) {
    return KNOWLEDGE_BASE.backend;
  }
  if (lowerQuery.includes('secure') || lowerQuery.includes('data')) {
    return KNOWLEDGE_BASE.privacy;
  }
  if (lowerQuery.includes('help') || lowerQuery.includes('pr') || lowerQuery.includes('bounty')) {
    return KNOWLEDGE_BASE.contribute;
  }
  if (lowerQuery.includes('container') || lowerQuery.includes('kubernetes')) {
    return KNOWLEDGE_BASE.docker;
  }
  if (lowerQuery.includes('github') || lowerQuery.includes('gitlab') || lowerQuery.includes('jenkins') || lowerQuery.includes('pipeline')) {
    return KNOWLEDGE_BASE.ci;
  }

  return FALLBACK_RESPONSE;
}

export default function AIAssistant(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = findAnswer(userMessage.content);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.answer,
      links: response.links,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.container}>
      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerTitle}>
              <span className={styles.headerIcon}>🧠</span>
              <span>Ask about Cortex</span>
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <div className={styles.welcomeMessage}>
                <p>Hi! I can help you find information in the Cortex Linux documentation.</p>
                <p>Try asking about:</p>
                <ul>
                  <li>Installation</li>
                  <li>Dry-run mode</li>
                  <li>Rollback & recovery</li>
                  <li>AI backends</li>
                  <li>Contributing</li>
                </ul>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage
                }`}
              >
                <div className={styles.messageContent}>
                  {message.content.split('```').map((part, index) => {
                    if (index % 2 === 1) {
                      // Code block
                      const lines = part.split('\n');
                      const language = lines[0];
                      const code = lines.slice(1).join('\n');
                      return (
                        <pre key={index} className={styles.codeBlock}>
                          <code>{code || part}</code>
                        </pre>
                      );
                    }
                    return <span key={index}>{part}</span>;
                  })}
                </div>
                {message.links && message.links.length > 0 && (
                  <div className={styles.messageLinks}>
                    <span className={styles.linksLabel}>Related docs:</span>
                    {message.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        className={styles.docLink}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Cortex..."
              className={styles.input}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              →
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`${styles.floatingButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {isOpen ? '×' : '🧠'}
      </button>
    </div>
  );
}
