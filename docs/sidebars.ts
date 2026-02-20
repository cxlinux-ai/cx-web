import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebar configuration for CX Linux documentation
 *
 * Structure follows the exact information architecture specified:
 * - Getting Started: Installation, Quick Start, Configuration, First Commands
 * - User Guide: Natural Language Commands, Package Management, etc.
 * - Reference: CLI Commands, Configuration Options, AI Backends, Env Vars
 * - Tutorials: Dev Environments, Server Configuration, Docker, CI/CD
 * - Contributing: Development Setup, Bounty Program, PR Guidelines, Code Style
 * - FAQ
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    // Getting Started section - Essential onboarding
    {
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'generated-index',
        title: 'Getting Started',
        description: 'Get up and running with CX Linux in minutes. Learn how to install, configure, and start using AI-powered system management.',
        slug: '/getting-started',
        keywords: ['install', 'setup', 'quickstart', 'configuration'],
      },
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/configuration',
        'getting-started/first-commands',
      ],
    },

    // User Guide section - Daily usage
    {
      type: 'category',
      label: 'User Guide',
      link: {
        type: 'generated-index',
        title: 'User Guide',
        description: 'Learn how to use CX Linux for everyday tasks with natural language commands.',
        slug: '/user-guide',
        keywords: ['guide', 'usage', 'commands', 'natural language'],
      },
      items: [
        'user-guide/natural-language-commands',
        'user-guide/package-management',
        'user-guide/system-configuration',
        'user-guide/dry-run-mode',
        'user-guide/rollback-recovery',
      ],
    },

    // Reference section - Technical details
    {
      type: 'category',
      label: 'Reference',
      link: {
        type: 'generated-index',
        title: 'Reference',
        description: 'Complete technical reference for CX Linux CLI, configuration, and integrations.',
        slug: '/reference',
        keywords: ['cli', 'api', 'configuration', 'reference'],
      },
      items: [
        'reference/cli-commands',
        'reference/configuration-options',
        'reference/supported-ai-backends',
        'reference/environment-variables',
      ],
    },

    // Tutorials section - Step-by-step guides
    {
      type: 'category',
      label: 'Tutorials',
      link: {
        type: 'generated-index',
        title: 'Tutorials',
        description: 'Step-by-step tutorials for common workflows and integrations.',
        slug: '/tutorials',
        keywords: ['tutorial', 'guide', 'how-to', 'walkthrough'],
      },
      items: [
        'tutorials/dev-environments',
        'tutorials/server-configuration',
        'tutorials/docker-integration',
        'tutorials/ci-cd-usage',
      ],
    },

    // Contributing section - Open source participation
    {
      type: 'category',
      label: 'Contributing',
      link: {
        type: 'generated-index',
        title: 'Contributing',
        description: 'Help improve CX Linux. Learn how to contribute code, documentation, and more.',
        slug: '/contributing',
        keywords: ['contributing', 'development', 'open source', 'bounty'],
      },
      items: [
        'contributing/development-setup',
        'contributing/bounty-program',
        'contributing/pr-guidelines',
        'contributing/code-style',
      ],
    },

    // FAQ - Standalone page
    {
      type: 'doc',
      id: 'faq',
      label: 'FAQ',
    },
  ],
};

export default sidebars;
