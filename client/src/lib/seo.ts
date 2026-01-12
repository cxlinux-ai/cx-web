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
  hackathon: {
    title: 'AI Linux Hackathon 2026 - $15,000 in Prizes | Cortex Linux',
    description: 'Join the first AI Linux hackathon. Build monetization strategies and production features for Cortex Linux. $15,000 prize pool. February 17, 2026.',
    canonicalPath: '/hackathon',
    keywords: ['AI hackathon', 'Linux hackathon', 'open source hackathon', 'developer hackathon 2026', 'Cortex Linux', 'AI competition'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Cortex Linux AI Hackathon 2026',
      description: 'Build monetization strategies and production features for the AI Layer for Linux. $15,000 in prizes.',
      startDate: '2026-02-17',
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
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
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
      name: 'How to Get Started with Cortex Linux',
      description: 'Complete guide to installing and using Cortex Linux, the AI Layer for Linux.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Choose Installation Method',
          text: 'Select from fresh install, dual-boot, virtual machine, or WSL2'
        },
        {
          '@type': 'HowToStep',
          name: 'Download Cortex Linux',
          text: 'Download the ISO from the official website or clone from GitHub'
        },
        {
          '@type': 'HowToStep',
          name: 'Install and Configure',
          text: 'Follow the installation wizard and configure your preferences'
        },
        {
          '@type': 'HowToStep',
          name: 'Run Your First Command',
          text: 'Use natural language to tell Cortex what you want to accomplish'
        }
      ]
    }
  },
  
  faq: {
    title: 'Cortex Linux FAQ - Common Questions Answered',
    description: 'Frequently asked questions about Cortex Linux. Learn about security, pricing, how it works, and technical requirements.',
    canonicalPath: '/faq',
    keywords: ['Cortex Linux FAQ', 'AI Linux questions', 'security', 'pricing', 'how it works']
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
