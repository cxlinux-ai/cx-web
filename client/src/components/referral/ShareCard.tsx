/**
 * ShareCard Component
 *
 * Generates shareable cards for various viral moments:
 * - Waitlist position
 * - Installation success
 * - Command success
 * - GitHub badge
 */

import React, { useState } from "react";

interface ShareCardProps {
  type: "waitlist" | "install" | "command" | "badge";
  data: {
    position?: number;
    totalWaitlist?: number;
    referralCode: string;
    tier?: string;
    command?: string;
    result?: string;
    timeSaved?: string;
    osInfo?: string;
  };
}

export function ShareCard({ type, data }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareUrl = () => `https://cxlinux-ai.com/join?ref=${data.referralCode}&utm_source=share_card`;

  const renderWaitlistCard = () => (
    <div className="share-card waitlist-card">
      <div className="card-content">
        <div className="card-logo">🧠 Cortex Linux</div>
        <div className="card-position">
          <span className="position-number">#{data.position?.toLocaleString()}</span>
          <span className="position-text">in line for early access</span>
        </div>
        <div className="card-cta">Join the waitlist →</div>
      </div>
      <div className="card-footer">
        <span className="powered-by">Powered by Cortex Linux</span>
      </div>
    </div>
  );

  const renderInstallCard = () => (
    <div className="share-card install-card">
      <div className="card-content">
        <div className="card-icon">🎉</div>
        <h3>Successfully installed Cortex Linux!</h3>
        {data.osInfo && <p className="os-info">{data.osInfo}</p>}
        <div className="card-badge">🧠 Powered by Cortex Linux</div>
      </div>
      <div className="card-cta">
        Get AI-powered Linux at cxlinux-ai.com
      </div>
    </div>
  );

  const renderCommandCard = () => (
    <div className="share-card command-card">
      <div className="card-content">
        <div className="card-header">
          <span className="card-icon">⚡</span>
          <span className="card-label">Cortex Linux</span>
        </div>
        <div className="command-block">
          <div className="prompt">$ cortex</div>
          <div className="command">"{data.command}"</div>
        </div>
        {data.result && (
          <div className="result-block">
            <div className="result-label">Result:</div>
            <div className="result-text">{data.result}</div>
          </div>
        )}
        {data.timeSaved && (
          <div className="time-saved">
            ⏱️ This would've taken {data.timeSaved} to research manually
          </div>
        )}
      </div>
    </div>
  );

  const renderBadgeCard = () => (
    <div className="share-card badge-card">
      <div className="badge-preview">
        <img
          src={`https://img.shields.io/badge/Powered%20by-Cortex%20Linux-blue?style=for-the-badge`}
          alt="Powered by Cortex Linux"
        />
      </div>
      <div className="badge-code">
        <h4>Markdown</h4>
        <code>
          {`[![Powered by Cortex Linux](https://img.shields.io/badge/Powered%20by-Cortex%20Linux-blue?style=for-the-badge)](${getShareUrl()})`}
        </code>
        <button
          onClick={() =>
            handleCopy(
              `[![Powered by Cortex Linux](https://img.shields.io/badge/Powered%20by-Cortex%20Linux-blue?style=for-the-badge)](${getShareUrl()})`
            )
          }
          className="copy-btn"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="badge-code">
        <h4>HTML</h4>
        <code>
          {`<a href="${getShareUrl()}"><img src="https://img.shields.io/badge/Powered%20by-Cortex%20Linux-blue?style=for-the-badge" alt="Powered by Cortex Linux" /></a>`}
        </code>
        <button
          onClick={() =>
            handleCopy(
              `<a href="${getShareUrl()}"><img src="https://img.shields.io/badge/Powered%20by-Cortex%20Linux-blue?style=for-the-badge" alt="Powered by Cortex Linux" /></a>`
            )
          }
          className="copy-btn"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="badge-hint">
        Add this badge to your README to earn referral credit when others click it!
      </p>
    </div>
  );

  const renderCard = () => {
    switch (type) {
      case "waitlist":
        return renderWaitlistCard();
      case "install":
        return renderInstallCard();
      case "command":
        return renderCommandCard();
      case "badge":
        return renderBadgeCard();
      default:
        return null;
    }
  };

  const shareCard = () => {
    const shareText = {
      waitlist: `Just joined the Cortex Linux waitlist! AI that actually understands Linux. Join me 👇`,
      install: `Just installed Cortex Linux! 🧠 AI-powered Linux is here.`,
      command: `This Cortex Linux command just saved me ${data.timeSaved || "so much time"}!`,
      badge: `Using Cortex Linux on my projects!`,
    };

    const text = encodeURIComponent(shareText[type]);
    const url = encodeURIComponent(getShareUrl());

    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <div className="share-card-container">
      {renderCard()}

      <div className="share-actions">
        <button onClick={shareCard} className="share-btn twitter">
          Share on 𝕏
        </button>
        <button
          onClick={() => {
            const url = encodeURIComponent(getShareUrl());
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
          }}
          className="share-btn linkedin"
        >
          Share on LinkedIn
        </button>
        <button onClick={() => handleCopy(getShareUrl())} className="share-btn copy">
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}

export default ShareCard;
