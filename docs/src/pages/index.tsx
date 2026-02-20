/**
 * CX Linux Documentation Homepage
 *
 * Landing page with hero section, feature highlights, and quick start.
 */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import QuickStartWidget from '@site/src/components/QuickStartWidget';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.heroCode}>
          <code>cx "install nginx and configure for production"</code>
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/installation"
          >
            Get Started →
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/getting-started/quick-start"
          >
            5-Minute Guide
          </Link>
        </div>
      </div>
    </header>
  );
}

interface FeatureItem {
  title: string;
  icon: string;
  description: JSX.Element;
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Natural Language Commands',
    icon: '🧠',
    description: (
      <>
        Forget memorizing command syntax. Just describe what you want in plain
        English, and CX figures out the rest.
      </>
    ),
  },
  {
    title: 'Safe by Design',
    icon: '🛡️',
    description: (
      <>
        Preview commands with dry-run mode. Automatic snapshots before changes.
        One-command rollback if anything goes wrong.
      </>
    ),
  },
  {
    title: 'Privacy First',
    icon: '🔒',
    description: (
      <>
        The default AI runs locally on your machine. Your commands never leave
        your system. Works completely offline.
      </>
    ),
  },
  {
    title: 'Universal Compatibility',
    icon: '🐧',
    description: (
      <>
        Works on Ubuntu, Debian, Fedora, Arch, and more. CX adapts to your
        distribution's package manager automatically.
      </>
    ),
  },
  {
    title: 'Developer Friendly',
    icon: '⚡',
    description: (
      <>
        Set up complete development environments with one command. Python, Node,
        Rust, Go, and more. CI/CD ready.
      </>
    ),
  },
  {
    title: 'Open Source',
    icon: '💻',
    description: (
      <>
        Fully open source under MIT license. Contribute features, report bugs,
        or earn bounties for your work.
      </>
    ),
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageQuickStart(): JSX.Element {
  return (
    <section className={styles.quickStartSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Quick Start</h2>
        <div className={styles.quickStartContainer}>
          <QuickStartWidget variant="inline" />
        </div>
        <div className={styles.examplesGrid}>
          <div className={styles.exampleCard}>
            <h4>Package Management</h4>
            <code>cx "install docker and docker-compose"</code>
          </div>
          <div className={styles.exampleCard}>
            <h4>System Configuration</h4>
            <code>cx "enable firewall and allow SSH"</code>
          </div>
          <div className={styles.exampleCard}>
            <h4>Service Management</h4>
            <code>cx "restart nginx and show status"</code>
          </div>
          <div className={styles.exampleCard}>
            <h4>Development Setup</h4>
            <code>cx "set up python for data science"</code>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageComparison(): JSX.Element {
  return (
    <section className={styles.comparisonSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Why CX?</h2>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonCard}>
            <h4>Traditional Way</h4>
            <pre className={styles.codeBlock}>
              {`sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo ufw allow 'Nginx Full'`}
            </pre>
          </div>
          <div className={styles.comparisonCard}>
            <h4>CX Way</h4>
            <pre className={styles.codeBlockHighlight}>
              {`cx "install nginx, enable it, and allow through firewall"`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageCTA(): JSX.Element {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <h2>Ready to simplify your Linux experience?</h2>
        <p>Get started in under 5 minutes.</p>
        <div className={styles.ctaButtons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started/installation"
          >
            Install CX
          </Link>
          <Link
            className="button button--outline button--lg"
            to="https://github.com/cxlinux/cx-linux"
          >
            Star on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Documentation"
      description="The AI-native operating system that simplifies Linux with natural language commands"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageQuickStart />
        <HomepageComparison />
        <HomepageCTA />
      </main>
    </Layout>
  );
}
