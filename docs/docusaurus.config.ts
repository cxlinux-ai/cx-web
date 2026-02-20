import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Docusaurus configuration for CX Linux documentation
// This config enables versioning, Algolia search, and SEO optimization
const config: Config = {
  title: 'CX Linux',
  tagline: 'The AI-native operating system that simplifies software installation using natural language',
  favicon: 'img/favicon.ico',

  // Production URL - update this when deploying
  url: 'https://docs.cxlinux.com',
  baseUrl: '/',

  // GitHub repository configuration for "Edit this page" links
  organizationName: 'cxlinux-ai',
  projectName: 'cx-core',

  // Strict mode to catch broken links during build
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Internationalization (English only for now)
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Enable "Edit this page" links to GitHub
          editUrl: 'https://github.com/cxlinux-ai/cx-core/tree/main/docs/',
          // Enable versioning with 'current' as the development version
          lastVersion: 'current',
          versions: {
            current: {
              label: 'Latest (stable)',
              badge: true,
            },
          },
          // Show last update time for each doc
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false, // Disable blog for documentation-focused site
        theme: {
          customCss: './src/css/custom.css',
        },
        // Sitemap for SEO
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        // Google Tag Manager (uncomment when ready)
        // gtag: {
        //   trackingID: 'G-XXXXXXXXXX',
        //   anonymizeIP: true,
        // },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card image for OpenGraph
    image: 'img/cx-social-card.png',

    // Announcement bar for important updates
    announcementBar: {
      id: 'hackathon_2025',
      content:
        'Join the Global AI Hackathon 2025! <a target="_blank" rel="noopener noreferrer" href="https://cxlinux.com/hackathon">Learn more</a>',
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      isCloseable: true,
    },

    // Navbar configuration
    navbar: {
      title: 'CX Linux',
      logo: {
        alt: 'CX Linux Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/tutorials/dev-environments',
          label: 'Tutorials',
          position: 'left',
        },
        {
          to: '/docs/reference/cli-commands',
          label: 'Reference',
          position: 'left',
        },
        // Version dropdown - shows stable and canary versions
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
          dropdownItemsAfter: [
            {
              type: 'html',
              value: '<hr class="dropdown-separator">',
            },
            {
              type: 'html',
              className: 'dropdown-archived-versions',
              value: '<b>Archived versions</b>',
            },
            {
              href: 'https://github.com/cxlinux-ai/cx-core/releases',
              label: 'All releases',
            },
          ],
        },
        {
          href: 'https://github.com/cxlinux-ai/cx-core',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },

    // Footer configuration
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'User Guide',
              to: '/docs/user-guide/natural-language-commands',
            },
            {
              label: 'Reference',
              to: '/docs/reference/cli-commands',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/ASvzWcuTfk',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/cxlinux_ai',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/cxlinux-ai/cx-core/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/cxlinux-ai/cx-core',
            },
            {
              label: 'Contributing',
              to: '/docs/contributing/development-setup',
            },
            {
              label: 'Bounty Program',
              to: '/docs/contributing/bounty-program',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AI Venture Holdings LLC. Built with Docusaurus.`,
    },

    // Algolia DocSearch configuration
    // Sign up at https://docsearch.algolia.com/ to get your API keys
    algolia: {
      appId: 'YOUR_APP_ID', // Replace with actual Algolia App ID
      apiKey: 'YOUR_SEARCH_API_KEY', // Replace with public search-only API key
      indexName: 'cxlinux',
      contextualSearch: true,
      // Optional: path for search page
      searchPagePath: 'search',
      // Keyboard shortcut
      insights: true,
    },

    // Prism code highlighting configuration
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      // Additional languages for syntax highlighting
      additionalLanguages: [
        'bash',
        'diff',
        'json',
        'yaml',
        'toml',
        'ini',
        'docker',
        'python',
        'rust',
        'go',
      ],
      // Enable line numbers by default for code blocks
      magicComments: [
        {
          className: 'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: { start: 'highlight-start', end: 'highlight-end' },
        },
        {
          className: 'code-block-error-line',
          line: 'error-next-line',
        },
      ],
    },

    // Color mode configuration
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    // Table of contents configuration
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },

    // Documentation-specific configurations
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },

    // Metadata for SEO
    metadata: [
      { name: 'keywords', content: 'cx linux, ai operating system, natural language commands, linux distro, ai-native os' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'og:type', content: 'website' },
    ],
  } satisfies Preset.ThemeConfig,

  // Plugins
  plugins: [
    // Enable ideal image optimization
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030,
        min: 640,
        steps: 2,
        disableInDev: false,
      },
    ],
  ],

  // Head tags for SEO and structured data
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'CX Linux',
        applicationCategory: 'OperatingSystem',
        operatingSystem: 'Linux',
        description: 'The AI-native operating system that simplifies software installation using natural language',
        url: 'https://cxlinux.com',
        author: {
          '@type': 'Organization',
          name: 'AI Venture Holdings LLC',
        },
      }),
    },
  ],

  // Markdown configuration
  markdown: {
    mermaid: true,
  },

  // Enable Mermaid diagrams
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
