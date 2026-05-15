import { useEffect, useState, useRef, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MDXProvider } from "@mdx-js/react";
import { ArrowLeft, ChevronUp } from "lucide-react";
import { updateSEO } from "@/lib/seo";
import { getAllPosts, getRelatedPosts, getMdxComponent } from "@/blog/parse";
import { getMDXComponents } from "@/blog/mdxComponents";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareBar } from "@/components/blog/ShareBar";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { trackEvent } from "@/lib/analytics";
import Footer from "@/components/Footer";
import authorsJson from "../../../../content/authors.json";
import type { BlogPost } from "@/blog/schema";

const BASE_URL = "https://cxlinux.com";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [MdxContent, setMdxContent] = useState<React.ComponentType | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Load post data
  useEffect(() => {
    getAllPosts().then((posts) => {
      const found = posts.find((p) => p.slug === slug) ?? null;
      setPost(found);
      setAllPosts(posts);
      if (found) getRelatedPosts(found, 3).then(setRelated);
    });
    getMdxComponent(slug).then(setMdxContent);
  }, [slug]);

  // SEO
  useEffect(() => {
    if (!post) return;
    const fm = post.frontmatter;
    const ogImage = fm.ogImage ?? `${BASE_URL}/og/${slug}.png`;
    const canonicalUrl = `${BASE_URL}/blog/${slug}`;
    const author = authorsJson.find((a) => a.id === fm.author) ?? authorsJson[0];

    const cleanup = updateSEO({
      title: `${fm.title} | CX Linux Blog`,
      description: fm.description,
      canonicalPath: `/blog/${slug}`,
      ogType: "article",
      ogImage,
      keywords: fm.tags,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: fm.title,
          description: fm.description,
          image: [ogImage],
          author: {
            "@type": "Person",
            name: author.name,
            url: `https://twitter.com/${author.twitter}`,
          },
          publisher: {
            "@type": "Organization",
            name: "CX Linux",
            logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
          },
          datePublished: fm.publishedAt,
          dateModified: fm.updatedAt ?? fm.publishedAt,
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          wordCount: post.wordCount,
          keywords: fm.tags.join(", "),
          inLanguage: "en-US",
          isPartOf: {
            "@type": "Blog",
            "@id": `${BASE_URL}/blog`,
            name: "CX Linux Blog",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
            { "@type": "ListItem", position: 3, name: fm.title, item: canonicalUrl },
          ],
        },
      ],
    });
    return cleanup;
  }, [post, slug]);

  // Analytics: article viewed
  useEffect(() => {
    if (!post) return;
    trackEvent({ category: "engagement", action: "blog_article_viewed", label: slug });
  }, [post, slug]);

  // Scroll depth tracking
  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    const fired = new Set<number>();
    const onScroll = () => {
      const el = document.documentElement;
      const pct = Math.round((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
      for (const t of thresholds) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          trackEvent({ category: "engagement", action: "blog_scroll_depth", label: `${slug}::${t}` });
        }
      }
      setShowScrollTop(window.scrollY > 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00FF9F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-[#00FF9F] hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const { frontmatter } = post;
  const author = authorsJson.find((a) => a.id === frontmatter.author) ?? authorsJson[0];
  const postIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : null;
  const nextPost = postIndex > 0 ? allPosts[postIndex - 1] : null;
  const canonicalUrl = `${BASE_URL}/blog/${slug}`;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <ReadingProgress />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00FF9F] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            All Posts
          </Link>

          {/* Article header */}
          <header className="max-w-2xl mb-10">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {frontmatter.tags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00FF9F]/10 text-[#00FF9F] hover:bg-[#00FF9F]/20 transition-colors cursor-pointer font-medium border border-[#00FF9F]/20">
                    {tag}
                  </span>
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mb-6">
              {frontmatter.title}
            </h1>

            {/* Byline */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <img src={author.avatar} alt={author.name} width={32} height={32} className="w-8 h-8 rounded-full ring-1 ring-white/10 object-cover" />
              <span className="text-gray-400 font-medium">{author.name}</span>
              <span>·</span>
              <time dateTime={frontmatter.publishedAt}>{formatDate(frontmatter.publishedAt)}</time>
              <span>·</span>
              <span>{post.readingTimeMinutes} min read</span>
              <span>·</span>
              <span>{post.wordCount.toLocaleString()} words</span>
            </div>
            {frontmatter.updatedAt && frontmatter.updatedAt !== frontmatter.publishedAt && (
              <p className="text-xs text-gray-600 mt-2">Updated {formatDate(frontmatter.updatedAt)}</p>
            )}
          </header>

          {/* Three-column layout */}
          <div className="flex gap-10">
            {/* Left: TOC (sticky desktop) */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24">
                <TableOfContents contentRef={contentRef} />
              </div>
            </aside>

            {/* Center: Article content */}
            <article className="flex-1 min-w-0 max-w-2xl">
              <div
                ref={contentRef}
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/8
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:text-[1.0625rem]
                  prose-a:text-[#00FF9F] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-semibold
                  prose-blockquote:border-l-4 prose-blockquote:border-[#00FF9F]/40 prose-blockquote:pl-4 prose-blockquote:text-gray-400 prose-blockquote:italic prose-blockquote:not-italic
                  prose-code:text-[#00FF9F] prose-code:bg-white/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                  prose-pre:!p-0 prose-pre:!bg-transparent prose-pre:!border-0 prose-pre:!rounded-none prose-pre:!shadow-none
                  prose-ul:text-gray-300 prose-li:mb-1
                  prose-ol:text-gray-300
                  prose-table:text-sm
                  prose-th:text-white prose-th:font-semibold prose-th:border-b prose-th:border-white/10 prose-th:pb-2
                  prose-td:text-gray-300 prose-td:border-b prose-td:border-white/5 prose-td:py-2
                  [&>*:first-child]:mt-0"
              >
                {MdxContent ? (
                  <MDXProvider components={getMDXComponents(slug)}>
                    <MdxContent />
                  </MDXProvider>
                ) : (
                  <div className="animate-pulse space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Author card */}
              <div className="mt-14">
                <AuthorCard author={author} />
              </div>

              {/* Prev / Next navigation */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                {prevPost ? (
                  <Link href={`/blog/${prevPost.slug}`} className="bg-[#1A1A1A] border border-white/8 rounded-xl p-5 hover:border-[#00FF9F]/40 transition-all">
                    <p className="text-xs text-gray-500 mb-2">← Previous</p>
                    <p className="text-sm font-semibold text-white line-clamp-2">{prevPost.frontmatter.title}</p>
                  </Link>
                ) : <div />}
                {nextPost ? (
                  <Link href={`/blog/${nextPost.slug}`} className="bg-[#1A1A1A] border border-white/8 rounded-xl p-5 hover:border-[#00FF9F]/40 transition-all text-right">
                    <p className="text-xs text-gray-500 mb-2">Next →</p>
                    <p className="text-sm font-semibold text-white line-clamp-2">{nextPost.frontmatter.title}</p>
                  </Link>
                ) : <div />}
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div className="mt-14">
                  <h2 className="text-lg font-bold text-white mb-5">Related Articles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {related.map((p, i) => (
                      <ArticleCard key={p.slug} post={p} index={i} compact />
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Right: Share bar (sticky desktop) */}
            <aside className="hidden xl:block w-16 flex-shrink-0">
              <div className="sticky top-24">
                <ShareBar title={frontmatter.title} url={canonicalUrl} />
              </div>
            </aside>
          </div>
        </motion.div>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 w-10 h-10 bg-[#00FF9F] text-black rounded-full flex items-center justify-center shadow-lg hover:bg-[#00CC7F] transition-colors z-50"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
