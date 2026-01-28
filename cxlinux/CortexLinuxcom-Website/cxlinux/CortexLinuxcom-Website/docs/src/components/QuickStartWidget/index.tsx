/**
 * Quick Start Widget Component
 *
 * A persistent sidebar widget that displays the main install command
 * with one-click copy functionality and success feedback.
 */

import React, { useState } from 'react';
import styles from './styles.module.css';

interface QuickStartWidgetProps {
  /** Whether to show in sidebar (persistent) or inline */
  variant?: 'sidebar' | 'inline';
}

const INSTALL_COMMAND = 'curl -fsSL https://cortexlinux.com/install.sh | bash';

export default function QuickStartWidget({
  variant = 'inline',
}: QuickStartWidgetProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = INSTALL_COMMAND;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`${styles.widget} ${styles[variant]}`}>
      <div className={styles.header}>
        <span className={styles.icon}>⚡</span>
        <span className={styles.title}>Quick Install</span>
      </div>

      <div className={styles.commandContainer}>
        <code className={styles.command}>{INSTALL_COMMAND}</code>
        <button
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <span className={styles.checkIcon}>✓</span>
          ) : (
            <span className={styles.copyIcon}>📋</span>
          )}
        </button>
      </div>

      {copied && (
        <div className={styles.feedback}>
          <span className={styles.feedbackIcon}>✓</span>
          Copied to clipboard!
        </div>
      )}

      <div className={styles.hint}>
        Works on Ubuntu, Debian, Fedora, Arch, and more
      </div>
    </div>
  );
}

/**
 * Sidebar version of the Quick Start Widget
 * For use in the Docusaurus sidebar
 */
export function QuickStartSidebar(): JSX.Element {
  return <QuickStartWidget variant="sidebar" />;
}
