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

const BASE_URL = 'https://cortexlinux.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Cortex Linux';
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

  const fullTitle = title.includes('Cortex') ? title : `${title} | ${SITE_NAME}`;
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
    title: 'Cortex Linux - The AI Layer for Linux | Execute Any Task with Natural Language',
    description: 'Transform how you use Linux with Cortex. Execute any task through natural language - automation, security, DevOps, system administration. Open source, sandboxed, instant rollback.',
    canonicalPath: '/',
    keywords: ['AI Linux', 'natural language Linux', 'Linux automation', 'AI operating system', 'Cortex Linux', 'intelligent Linux'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Cortex Linux',
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
        name: 'Cortex Linux',
        url: 'https://cortexlinux.com'
      }
    }
  },

  hackathon: {
    title: 'AI Linux Hackathon 2026 - $15,000 in Prizes | Cortex Linux',
    description: 'Join the first AI Linux hackathon. Build monetization strategies and production features for Cortex Linux. $15,000 prize pool. February 17, 2026.',
    canonicalPath: '/hackathon',
    keywords: ['AI hackathon', 'Linux hackathon', 'open source hackathon', 'developer hackathon 2026', 'Cortex Linux', 'AI competition'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Cortex Hackathon 2026',
      description: 'A two-phase, 13-week open-source hackathon to crowdsource monetization strategies and production features for Cortex Linux. Phase 1 (Weeks 1-4): Submit ideas for monetization strategies, features, and marketing via GitHub Issues with a 100-point rubric. Phase 2 (Weeks 6-13): Build production code and submit via GitHub Pull Requests. $15,000 total prize pool. Free to participate, open to developers of all skill levels worldwide. 100% open source (Apache 2.0).',
      startDate: '2026-02-17',
      endDate: '2026-05-18',
      url: 'https://cortexlinux.com/hackathon',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'VirtualLocation',
        url: 'https://github.com/cortexlinux/cortex'
      },
      organizer: {
        '@type': 'Organization',
        name: 'Cortex Linux',
        url: 'https://cortexlinux.com'
      },
      image: 'https://cortexlinux.com/og-image.png',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        url: 'https://cortexlinux.com/hackathon',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  
  startup: {
    title: 'Cortex Linux for AI Startups & Agencies | Pre-Configured AI Stack',
    description: 'The Linux built for AI founders. Pre-installed Python, Ollama, LangChain, Docker, CUDA. Ship AI products faster with Cortex Linux.',
    canonicalPath: '/startup',
    keywords: ['AI startup', 'AI agency', 'AI Linux', 'machine learning', 'pre-configured AI stack', 'Ollama', 'LangChain']
  },
  
  blog: {
    title: 'Cortex Linux Blog - AI Linux Tutorials & Best Practices',
    description: 'Technical insights, tutorials, and best practices for AI-powered Linux automation. Learn to use Cortex for system administration, DevOps, and development.',
    canonicalPath: '/blog',
    keywords: ['Linux tutorials', 'AI automation', 'Cortex Linux guides', 'system administration', 'DevOps']
  },
  
  news: {
    title: 'Cortex Linux News & Press Releases',
    description: 'Latest announcements, updates, and press releases from Cortex Linux. Stay informed about the AI Layer for Linux.',
    canonicalPath: '/news',
    keywords: ['Cortex Linux news', 'AI Linux updates', 'press releases']
  },
  
  gettingStarted: {
    title: 'Getting Started with Cortex Linux - Installation & Setup Guide',
    description: 'Learn how to install and configure Cortex Linux. Step-by-step guide for beginners covering installation, first commands, and learning paths.',
    canonicalPath: '/getting-started',
    keywords: ['Cortex Linux installation', 'AI Linux setup', 'getting started guide', 'Linux tutorial'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Getting Started with Cortex Linux',
      description: 'Complete guide to installing and using Cortex Linux, the AI Layer for Linux. Learn how to choose an installation method, install Cortex, verify the setup, run your first command, and unlock unlimited possibilities on Linux.',
      totalTime: 'PT15M',
      estimatedCost: {
        '@type': 'PriceSpecification',
        'priceCurrency': 'USD',
        'price': '0'
      },
      tool: [
        {
          '@type': 'HowToTool',
          'name': 'Cortex Linux'
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
          'text': 'Cortex Linux supports multiple installation methods: fresh install, dual-boot, virtual machine, or WSL2. Choose the method that best fits your workflow and system setup.'
        },
        {
          '@type': 'HowToStep',
          'position': '2',
          'name': 'Install Cortex Linux',
          'text': 'Download the ISO from the official website or clone from GitHub. Create a bootable USB or mount in a virtual machine. Follow the interactive installer wizard which will handle all dependencies automatically in approximately 15 minutes.'
        },
        {
          '@type': 'HowToStep',
          'position': '3',
          'name': 'Verify Installation',
          'text': 'Confirm that Cortex is properly installed by running diagnostic commands. Check your installation with cortex --version, verify hardware detection with cortex hw detect, and review system health with cortex diagnose.'
        },
        {
          '@type': 'HowToStep',
          'position': '4',
          'name': 'Run Your First Command',
          'text': 'Experience the power of intent-based computing by describing what you want to accomplish in natural language. For example: "cortex configure my nginx web server with SSL" or "cortex set up automated daily backups to S3". Preview commands before execution.'
        },
        {
          '@type': 'HowToStep',
          'position': '5',
          'name': 'Do Anything on Linux',
          'text': 'Cortex is your intelligent Linux assistant for unlimited tasks. Use it for system administration, DevOps, development environments, security hardening, and literally anything else you can do on Linux. Simply ask Cortex to do what you need.'
        }
      ]
    }
  },
  
  faq: {
    title: 'Cortex Linux FAQ - Security, Pricing & How It Works',
    description: 'Answers to common questions about Cortex Linux: Is it safe? How does it work? What hardware do I need? Free vs paid tiers explained.',
    canonicalPath: '/faq',
    keywords: ['Cortex Linux FAQ', 'AI Linux questions', 'is Cortex safe', 'Cortex pricing', 'AI Linux requirements'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is Cortex safe? Won\'t it break my system?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cortex is designed with security as the #1 priority. Every command runs in an isolated Firejail container. You see and approve every command before it runs. We create snapshots before major changes for instant rollback. Dangerous commands are blocked automatically.'
          }
        },
        {
          '@type': 'Question',
          name: 'How is Cortex different from Warp, Gemini CLI, or Claude Code?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cortex is an OS-level AI layer, not a terminal wrapper or code editor. It executes ANY task on Linux with multi-step workflow orchestration, system-wide awareness, and hardware-aware optimization. Package management is just one of unlimited capabilities.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is Cortex free or paid?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Both! Community Edition is free forever and open source (Apache 2.0) with full AI capabilities. Enterprise Edition adds priority support, compliance features, and SLA guarantees for companies.'
          }
        },
        {
          '@type': 'Question',
          name: 'What hardware do I need to run Cortex?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cloud mode works on any Linux machine with 4GB+ RAM and internet. Local mode (optional) requires NVIDIA RTX 3060+ or equivalent with 8GB+ VRAM. Most users run cloud mode.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does Cortex work offline?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hybrid approach: Cloud mode (default) uses Claude API, Local mode runs LLM locally requiring GPU, or Hybrid mode uses local for simple tasks and cloud for complex ones.'
          }
        }
      ]
    }
  },
  
  security: {
    title: 'Cortex Linux Security - How We Protect Your System',
    description: 'Learn about Cortex Linux security architecture. Sandboxed execution, command validation, rollback protection, and vulnerability disclosure.',
    canonicalPath: '/security',
    keywords: ['Linux security', 'AI security', 'sandboxed execution', 'vulnerability disclosure']
  },
  
  privacy: {
    title: 'Privacy Policy | Cortex Linux',
    description: 'Cortex Linux privacy policy. Learn how we collect, use, and protect your personal data.',
    canonicalPath: '/privacy',
    noIndex: false
  },
  
  terms: {
    title: 'Terms of Service | Cortex Linux',
    description: 'Cortex Linux terms of service. MIT license, user conduct, disclaimers, and liability limitations.',
    canonicalPath: '/terms',
    noIndex: false
  },
  
  license: {
    title: 'MIT License | Cortex Linux',
    description: 'Cortex Linux is open-source software licensed under the MIT License. Free to use, modify, and distribute.',
    canonicalPath: '/license',
    noIndex: false
  },
  
  status: {
    title: 'System Status | Cortex Linux',
    description: 'Check the operational status of Cortex Linux services and infrastructure.',
    canonicalPath: '/status',
    noIndex: true
  },
  
  beta: {
    title: 'Beta Preview | Cortex Linux',
    description: 'Try the interactive Cortex Linux beta preview. Experience AI-powered Linux commands in your browser.',
    canonicalPath: '/beta',
    noIndex: true
  }
};
