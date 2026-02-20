interface SEOConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
  jsonLd?: object | object[];
}

const BASE_URL = 'https://cxlinux.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'CX Linux';
const TWITTER_HANDLE = '@cortexlinux';

export function updateSEO(config: SEOConfig): () => void {
  const {
    title,
    description,
    canonicalPath = '',
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    keywords = [],
    noIndex = false,
    jsonLd
  } = config;

  const fullTitle = title.includes('CX') ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  
  const originalTitle = document.title;
  const createdElements: Element[] = [];
  const originalValues: Map<Element, string | null> = new Map();

  document.title = fullTitle;

  const updateOrCreateMeta = (selector: string, attribute: string, value: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      const [attrName, attrValue] = selector.match(/\[([^=]+)="([^"]+)"\]/)?.slice(1) || [];
      if (attrName && attrValue) {
        el.setAttribute(attrName, attrValue);
      }
      document.head.appendChild(el);
      createdElements.push(el);
    } else {
      originalValues.set(el, el.getAttribute(attribute));
    }
    el.setAttribute(attribute, value);
  };

  const updateOrCreateLink = (rel: string, href: string) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
      createdElements.push(el);
    } else {
      originalValues.set(el, el.getAttribute('href'));
    }
    el.setAttribute('href', href);
  };

  updateOrCreateMeta('meta[name="description"]', 'content', description);
  
  if (keywords.length > 0) {
    updateOrCreateMeta('meta[name="keywords"]', 'content', keywords.join(', '));
  }
  
  if (noIndex) {
    updateOrCreateMeta('meta[name="robots"]', 'content', 'noindex, nofollow');
  }

  updateOrCreateLink('canonical', canonicalUrl);

  updateOrCreateMeta('meta[property="og:title"]', 'content', fullTitle);
  updateOrCreateMeta('meta[property="og:description"]', 'content', description);
  updateOrCreateMeta('meta[property="og:type"]', 'content', ogType);
  updateOrCreateMeta('meta[property="og:url"]', 'content', canonicalUrl);
  updateOrCreateMeta('meta[property="og:image"]', 'content', ogImage);

  updateOrCreateMeta('meta[name="twitter:title"]', 'content', fullTitle);
  updateOrCreateMeta('meta[name="twitter:description"]', 'content', description);
  updateOrCreateMeta('meta[name="twitter:url"]', 'content', canonicalUrl);
  updateOrCreateMeta('meta[name="twitter:image"]', 'content', ogImage);

  let jsonLdScript: HTMLScriptElement | null = null;
  if (jsonLd) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'page-json-ld';
    jsonLdScript.textContent = JSON.stringify(jsonLd);
    
    const existingScript = document.getElementById('page-json-ld');
    if (existingScript) {
      existingScript.remove();
    }
    document.head.appendChild(jsonLdScript);
  }

  return () => {
    document.title = originalTitle;
    
    createdElements.forEach(el => el.remove());
    
    originalValues.forEach((value, el) => {
      if (value !== null) {
        const attr = el.tagName === 'LINK' ? 'href' : 'content';
        el.setAttribute(attr, value);
      }
    });
    
    if (jsonLdScript) {
      jsonLdScript.remove();
    }
  };
}

export function useSEO(config: SEOConfig) {
  return { updateSEO: () => updateSEO(config) };
}

export const seoConfigs = {
  home: {
    title: 'CX Linux - The AI Layer for Linux | Execute Any Task with Natural Language',
    description: 'Transform how you use Linux with CX. Execute any task through natural language - automation, security, DevOps, system administration. Sandboxed execution, instant rollback.',
    canonicalPath: '/',
    keywords: ['AI Linux', 'natural language Linux', 'Linux automation', 'AI operating system', 'CX Linux', 'intelligent Linux'],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'CX Linux',
        url: 'https://cxlinux.com',
        description: 'The AI Layer for Linux - Execute any task through natural language commands.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://cxlinux.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'CX Linux',
        applicationCategory: 'OperatingSystem',
        operatingSystem: 'Linux',
        description: 'The AI Layer for Linux. Execute any task through natural language commands.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        author: {
          '@type': 'Organization',
          name: 'CX Linux',
          url: 'https://cxlinux.com'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CX Linux',
        url: 'https://cxlinux.com',
        logo: 'https://cxlinux.com/og-image.png',
        sameAs: [
          'https://github.com/cxlinux-ai/cx-core',
          'https://twitter.com/cortexlinux',
          'https://discord.gg/ASvzWcuTfk'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'hello@cxlinux.com',
          contactType: 'customer support'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is CX Linux?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CX Linux is an AI-powered layer for Linux that lets you execute any task through natural language commands. It supports automation, security, DevOps, and system administration with sandboxed execution and instant rollback.'
            }
          },
          {
            '@type': 'Question',
            name: 'Is CX Linux free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CX Linux offers a free tier to get started. Paid tiers (Core+, Pro, Enterprise) unlock advanced features and priority support.'
            }
          },
          {
            '@type': 'Question',
            name: 'How does CX Linux ensure safety?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CX Linux uses sandboxed execution to preview commands before running them. Every action has instant rollback capability, and nothing runs without your explicit approval.'
            }
          }
        ]
      }
    ]
  },

  hackathon: {
    title: 'The First AI Linux Hackathon Worldwide - $18,800 in Prizes | CX Linux',
    description: 'Join the first-ever AI Linux Hackathon. Phase 1: Submit monetizable feature ideas. Phase 2: Build real code. $18,800 in prizes. February 17, 2026. Open worldwide.',
    canonicalPath: '/hackathon',
    keywords: ['first AI Linux hackathon', 'AI hackathon worldwide', 'Linux hackathon', 'developer hackathon 2026', 'CX Linux', 'AI competition', 'Ideathon'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'The First AI Linux Hackathon Worldwide',
      description: 'The first-ever AI Linux Hackathon. A two-phase, 17-week program: Phase 1 (Ideathon, Weeks 1-4) generates monetizable feature ideas, followed by a 1-month prep period. Phase 2 (Hackathon, Weeks 9-17) builds real code via GitHub PRs. $18,800 in prizes. Free to participate, open to developers worldwide.',
      startDate: '2026-02-17',
      endDate: '2026-05-25',
      url: 'https://cxlinux.com/hackathon',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'VirtualLocation',
        url: 'https://github.com/cxlinux-ai/cx-core'
      },
      organizer: {
        '@type': 'Organization',
        name: 'CX Linux',
        url: 'https://cxlinux.com'
      },
      image: 'https://cxlinux.com/og-image.png',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        url: 'https://cxlinux.com/hackathon',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  
  startup: {
    title: 'CX Linux for AI Startups & Agencies | Pre-Configured AI Stack',
    description: 'The Linux built for AI founders. Pre-installed Python, Ollama, LangChain, Docker, CUDA. Ship AI products faster with CX Linux.',
    canonicalPath: '/startup',
    keywords: ['AI startup', 'AI agency', 'AI Linux', 'machine learning', 'pre-configured AI stack', 'Ollama', 'LangChain']
  },
  
  blog: {
    title: 'CX Linux Blog - AI Linux Tutorials & Best Practices',
    description: 'Technical insights, tutorials, and best practices for AI-powered Linux automation. Learn to use CX for system administration, DevOps, and development.',
    canonicalPath: '/blog',
    keywords: ['Linux tutorials', 'AI automation', 'CX Linux guides', 'system administration', 'DevOps']
  },
  
  news: {
    title: 'CX Linux News & Press Releases',
    description: 'Latest announcements, updates, and press releases from CX Linux. Stay informed about the AI Layer for Linux.',
    canonicalPath: '/news',
    keywords: ['CX Linux news', 'AI Linux updates', 'press releases']
  },
  
  gettingStarted: {
    title: 'Getting Started with CX Linux - Installation & Setup Guide',
    description: 'Learn how to install and configure CX Linux. Step-by-step guide for beginners covering installation, first commands, and learning paths.',
    canonicalPath: '/getting-started',
    keywords: ['CX Linux installation', 'AI Linux setup', 'getting started guide', 'Linux tutorial'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Getting Started with CX Linux',
      description: 'Complete guide to installing and using CX Linux, the AI Layer for Linux. Learn how to choose an installation method, install CX, verify the setup, run your first command, and unlock unlimited possibilities on Linux.',
      totalTime: 'PT15M',
      estimatedCost: {
        '@type': 'PriceSpecification',
        'priceCurrency': 'USD',
        'price': '0'
      },
      tool: [
        {
          '@type': 'HowToTool',
          'name': 'CX Linux'
        },
        {
          '@type': 'HowToTool',
          'name': 'Linux System'
        },
        {
          '@type': 'HowToTool',
          'name': 'Terminal'
        }
      ],
      step: [
        {
          '@type': 'HowToStep',
          'position': '1',
          'name': 'Choose Your Installation Method',
          'text': 'CX Linux supports multiple installation methods: fresh install, dual-boot, virtual machine, or WSL2. Choose the method that best fits your workflow and system setup.'
        },
        {
          '@type': 'HowToStep',
          'position': '2',
          'name': 'Install CX Linux',
          'text': 'Download the ISO from the official website or clone from GitHub. Create a bootable USB or mount in a virtual machine. Follow the interactive installer wizard which will handle all dependencies automatically in approximately 15 minutes.'
        },
        {
          '@type': 'HowToStep',
          'position': '3',
          'name': 'Verify Installation',
          'text': 'Confirm that CX is properly installed by running diagnostic commands. Check your installation with cx --version, verify hardware detection with cx hw detect, and review system health with cx diagnose.'
        },
        {
          '@type': 'HowToStep',
          'position': '4',
          'name': 'Run Your First Command',
          'text': 'Experience the power of intent-based computing by describing what you want to accomplish in natural language. For example: "cx configure my nginx web server with SSL" or "cx set up automated daily backups to S3". Preview commands before execution.'
        },
        {
          '@type': 'HowToStep',
          'position': '5',
          'name': 'Do Anything on Linux',
          'text': 'CX is your intelligent Linux assistant for unlimited tasks. Use it for system administration, DevOps, development environments, security hardening, and literally anything else you can do on Linux. Simply ask CX to do what you need.'
        }
      ]
    }
  },
  
  faq: {
    title: 'CX Linux FAQ - Security, Pricing & How It Works',
    description: 'Answers to common questions about CX Linux: Is it safe? How does it work? What hardware do I need? Free vs paid tiers explained.',
    canonicalPath: '/faq',
    keywords: ['CX Linux FAQ', 'AI Linux questions', 'is CX safe', 'CX pricing', 'AI Linux requirements'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is CX safe? Won\'t it break my system?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CX is designed with security as the #1 priority. Every command runs in an isolated Firejail container. You see and approve every command before it runs. We create snapshots before major changes for instant rollback. Dangerous commands are blocked automatically.'
          }
        },
        {
          '@type': 'Question',
          name: 'How is CX different from Warp, Gemini CLI, or Claude Code?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CX is an OS-level AI layer, not a terminal wrapper or code editor. It executes ANY task on Linux with multi-step workflow orchestration, system-wide awareness, and hardware-aware optimization. Package management is just one of unlimited capabilities.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is CX free or paid?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Both! Core Edition is free to get started. Paid tiers (Core+, Pro, Enterprise) add advanced features, priority support, compliance features, and SLA guarantees.'
          }
        },
        {
          '@type': 'Question',
          name: 'What hardware do I need to run CX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cloud mode works on any Linux machine with 4GB+ RAM and internet. Local mode (optional) requires NVIDIA RTX 3060+ or equivalent with 8GB+ VRAM. Most users run cloud mode.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does CX work offline?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hybrid approach: Cloud mode (default) uses Claude API, Local mode runs LLM locally requiring GPU, or Hybrid mode uses local for simple tasks and cloud for complex ones.'
          }
        }
      ]
    }
  },
  
  security: {
    title: 'CX Linux Security - How We Protect Your System',
    description: 'Learn about CX Linux security architecture. Sandboxed execution, command validation, rollback protection, and vulnerability disclosure.',
    canonicalPath: '/security',
    keywords: ['Linux security', 'AI security', 'sandboxed execution', 'vulnerability disclosure']
  },
  
  privacy: {
    title: 'Privacy Policy | CX Linux',
    description: 'CX Linux privacy policy. Learn how we collect, use, and protect your personal data.',
    canonicalPath: '/privacy',
    noIndex: false
  },
  
  terms: {
    title: 'Terms of Service | CX Linux',
    description: 'CX Linux terms of service. MIT license, user conduct, disclaimers, and liability limitations.',
    canonicalPath: '/terms',
    noIndex: false
  },
  
  license: {
    title: 'MIT License | CX Linux',
    description: 'CX Linux software is licensed under the MIT License. Free to use, modify, and distribute.',
    canonicalPath: '/license',
    noIndex: false
  },
  
  status: {
    title: 'System Status | CX Linux',
    description: 'Check the operational status of CX Linux services and infrastructure.',
    canonicalPath: '/status',
    noIndex: true
  },
  
  beta: {
    title: 'Beta Preview | CX Linux',
    description: 'Try the interactive CX Linux beta preview. Experience AI-powered Linux commands in your browser.',
    canonicalPath: '/beta',
    noIndex: true
  },

  pricing: {
    title: 'Pricing - Simple, Transparent Plans | CX Linux',
    description: 'Choose the right CX Linux plan for you. From free Community edition to Enterprise with SSO, audit logs, and 24/7 support. 14-day free trial on all paid plans.',
    canonicalPath: '/pricing',
    keywords: ['CX Linux pricing', 'AI Linux subscription', 'Linux automation pricing', 'enterprise Linux plans'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'CX Linux',
      description: 'The AI Layer for Linux - Execute any task through natural language commands.',
      brand: {
        '@type': 'Brand',
        name: 'CX Linux'
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Community',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier with local LLM and CLI access'
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '20',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '20',
            priceCurrency: 'USD',
            billingDuration: 'P1M'
          },
          description: 'Cloud LLMs, Web Console, up to 3 servers'
        },
        {
          '@type': 'Offer',
          name: 'Enterprise',
          price: '99',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '99',
            priceCurrency: 'USD',
            billingDuration: 'P1M'
          },
          description: 'SSO/LDAP, Audit logs, Compliance, 99.9% SLA'
        },
        {
          '@type': 'Offer',
          name: 'Managed',
          price: '299',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '299',
            priceCurrency: 'USD',
            billingDuration: 'P1M'
          },
          description: 'Fully managed infrastructure with 24/7 dedicated support'
        }
      ]
    }
  },

  bounties: {
    title: 'Bounty Board - Earn Rewards Contributing to CX Linux',
    description: 'Browse open bounties and earn rewards for contributing to CX Linux projects. Find issues with rewards, claim bounties, and get paid for your contributions.',
    canonicalPath: '/bounties',
    keywords: ['developer bounties', 'GitHub bounties', 'CX Linux contributions', 'developer rewards', 'bug bounty', 'feature bounty'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'CX Linux Bounty Board',
      description: 'Bounties for contributing to CX Linux. Earn rewards by fixing bugs, building features, and improving documentation.',
      url: 'https://cxlinux.com/bounties',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Open Bounties',
          description: 'Browse currently available bounties ready to be claimed'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Completed Bounties',
          description: 'View successfully completed bounties and total payouts'
        }
      ],
      mainEntity: {
        '@type': 'Organization',
        name: 'CX Linux',
        url: 'https://cxlinux.com',
        sameAs: [
          'https://github.com/cxlinux-ai',
          'https://twitter.com/cortexlinux'
        ]
      }
    }
  }
};
