/**
 * Copyright (c) 2026 CX Linux
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

interface SEOConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

const DEFAULT_TITLE = 'CX Linux - The Agentic OS';
const DEFAULT_DESCRIPTION = 'CX Linux is the sovereign operating system for autonomous AI agents. Built for security, compliance, and performance.';
const BASE_URL = 'https://cxlinux.com';

/**
 * Update document SEO meta tags dynamically
 * Returns a cleanup function to restore defaults
 */
export function updateSEO(config: SEOConfig): () => void {
  const previousTitle = document.title;

  // Update title
  document.title = config.title;

  // Update or create meta tags
  updateMetaTag('description', config.description);

  if (config.keywords?.length) {
    updateMetaTag('keywords', config.keywords.join(', '));
  }

  // Open Graph tags
  updateMetaTag('og:title', config.title, 'property');
  updateMetaTag('og:description', config.description, 'property');
  updateMetaTag('og:type', config.ogType || 'website', 'property');
  updateMetaTag('og:url', config.canonicalPath ? `${BASE_URL}${config.canonicalPath}` : BASE_URL, 'property');

  if (config.ogImage) {
    updateMetaTag('og:image', config.ogImage, 'property');
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', config.twitterCard || 'summary_large_image', 'name');
  updateMetaTag('twitter:title', config.title, 'name');
  updateMetaTag('twitter:description', config.description, 'name');

  // Canonical URL
  if (config.canonicalPath) {
    updateCanonicalLink(`${BASE_URL}${config.canonicalPath}`);
  }

  // Return cleanup function
  return () => {
    document.title = previousTitle;
    updateMetaTag('description', DEFAULT_DESCRIPTION);
    updateMetaTag('og:title', DEFAULT_TITLE, 'property');
    updateMetaTag('og:description', DEFAULT_DESCRIPTION, 'property');
  };
}

function updateMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name'): void {
  let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, name);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

function updateCanonicalLink(href: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = href;
}

export default updateSEO;
