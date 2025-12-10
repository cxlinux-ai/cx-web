import { useParams, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Clock, User, Tag, ArrowRight } from "lucide-react";
import { getPostBySlug, getRelatedPosts, BlogPost } from "@/data/blogPosts";
import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";

// Simple markdown to HTML converter
function formatContent(content: string): string {
  let html = content
    // Headers with IDs for TOC linking
    .replace(/^## (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h2 id="${id}" class="text-2xl font-bold mt-8 mb-4 text-white scroll-mt-24">${text}</h2>`;
    })
    .replace(/^### (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h3 id="${id}" class="text-xl font-semibold mt-6 mb-3 text-gray-200 scroll-mt-24">${text}</h3>`;
    })
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-gray-900/50 border border-white/10 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm text-gray-300 language-${lang || 'text'}">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800/50 px-1.5 py-0.5 rounded text-blue-300 text-sm">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links - internal
    .replace(/\[([^\]]+)\]\(\/blog\/([^)]+)\)/g, '<a href="/blog/$2" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">$1</a>')
    // Links - external
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">$1</a>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      const isHeader = cells.some(c => c.includes('---'));
      if (isHeader) return '';
      const cellHtml = cells.map(c => `<td class="border border-white/10 px-3 py-2">${c.trim()}</td>`).join('');
      return `<tr>${cellHtml}</tr>`;
    })
    // Wrap tables
    .replace(/(<tr>[\s\S]*?<\/tr>)/g, (match) => {
      if (match.includes('<table')) return match;
      return match;
    })
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-gray-300 list-decimal">$1</li>')
    // Checkboxes
    .replace(/^- \[ \] (.+)$/gm, '<li class="ml-4 text-gray-300 flex items-center gap-2"><input type="checkbox" disabled class="rounded border-gray-600" /> $1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="ml-4 text-gray-300 flex items-center gap-2"><input type="checkbox" checked disabled class="rounded border-gray-600" /> $1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-white/10 my-8" />')
    // Paragraphs
    .replace(/^(?!<[hluotp]|<pre|<hr|<tr)(.+)$/gm, '<p class="text-gray-300 leading-relaxed mb-4">$1</p>');

  // Wrap consecutive li elements in ul
  html = html.replace(/(<li[\s\S]*?<\/li>\n?)+/g, (match) => {
    if (match.includes('list-decimal')) {
      return `<ol class="list-decimal list-inside space-y-1 mb-4">${match}</ol>`;
    }
    return `<ul class="list-disc list-inside space-y-1 mb-4">${match}</ul>`;
  });

  // Wrap consecutive tr elements in table
  html = html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (match) => {
    return `<table class="w-full border-collapse border border-white/10 my-6 text-sm">${match}</table>`;
  });

  return html;
}

// Extract TOC from content - captures both h2 and h3
function extractTOC(content: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = [];
  const headingRegex = /^(#{2,3}) (.+)$/gm;
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    toc.push({ id, text, level });
  }
  
  return toc;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const post = slug ? getPostBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 2) : [];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toc = post ? extractTOC(post.content) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    setImageLoaded(false);
    setImageError(false);
  }, [slug]);

  // Update document title and meta tags
  useEffect(() => {
    const originalTitle = document.title;
    const createdElements: Element[] = [];
    const originalValues: Map<Element, string> = new Map();

    if (post) {
      document.title = post.seoTitle || post.title;
      
      // Update meta description - cache original value
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
        createdElements.push(metaDesc);
      } else {
        originalValues.set(metaDesc, metaDesc.getAttribute('content') || '');
      }
      metaDesc.setAttribute('content', post.seoDescription || post.excerpt);

      // Update OG tags - cache original values
      const ogTags = [
        { property: 'og:title', content: post.seoTitle || post.title },
        { property: 'og:description', content: post.seoDescription || post.excerpt },
        { property: 'og:type', content: 'article' },
        { property: 'og:image', content: post.image || '' },
      ];

      ogTags.forEach(({ property, content }) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
          createdElements.push(tag);
        } else {
          originalValues.set(tag, tag.getAttribute('content') || '');
        }
        tag.setAttribute('content', content);
      });

      // Add JSON-LD structured data with unique ID for this component
      const jsonLdId = 'blog-post-jsonld';
      let scriptTag = document.getElementById(jsonLdId);
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = jsonLdId;
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
        createdElements.push(scriptTag);
      }
      
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        author: {
          '@type': 'Organization',
          name: post.author,
        },
        datePublished: post.date,
        image: post.image,
        wordCount: post.wordCount,
      };
      scriptTag.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      
      // Restore original values for existing elements
      originalValues.forEach((value, element) => {
        element.setAttribute('content', value);
      });
      
      // Remove created elements
      createdElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
          <Link href="/blog" className="text-blue-400 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 flex gap-8">
        {/* Main Content */}
        <article className="flex-1 max-w-4xl">
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8">
            <ChevronLeft size={16} />
            Back to Blog
          </Link>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="inline-block mb-4 px-3 py-1 text-sm font-medium bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
              {post.category}
            </span>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <User size={14} />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {new Date(post.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={14} />
                {post.readingTime}
              </span>
              {post.wordCount && (
                <span className="text-gray-500">
                  {post.wordCount.toLocaleString()} words
                </span>
              )}
            </div>
          </motion.header>

          {/* Featured Image */}
          {post.image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10 rounded-xl overflow-hidden relative h-64 md:h-80 bg-gradient-to-br from-blue-900/20 to-gray-900/40"
            >
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
              )}
              {!imageError ? (
                <img
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl text-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                      <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none mb-12"
          >
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
            />
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-2 mb-12 pb-12 border-b border-white/10"
          >
            <Tag size={14} className="text-gray-500" />
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-white/5 border border-white/10 rounded-full text-gray-400"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} index={index} />
                ))}
              </div>
            </motion.section>
          )}
        </article>

        {/* TOC Sidebar - Desktop Only */}
        {toc.length > 0 && (
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                On this page
              </h3>
              <nav className="space-y-2">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-sm text-gray-500 hover:text-blue-400 transition-colors ${
                      item.level === 3 ? 'pl-4' : ''
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
