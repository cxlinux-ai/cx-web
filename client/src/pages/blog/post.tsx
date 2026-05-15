import { useEffect, useState, useRef, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MDXProvider } from "@mdx-js/react";
import { ArrowLeft, ArrowRight, ChevronUp, Clock, Calendar, BookOpen } from "lucide-react";
import { updateSEO } from "@/lib/seo";
import { getAllPosts, getRelatedPosts, getMdxComponent } from "@/blog/parse";
import { getMDXComponents } from "@/blog/mdxComponents";
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
  const mdxComponents = useMemo(() => getMDXComponents(slug), [slug]);

  // Load post data
  useEffect(() => {
    let cancelled = false;
    setMdxContent(null);
    setPost(undefined);

    getAllPosts().then((posts) => {
      if (cancelled) return;
      const found = posts.find((p) => p.slug === slug) ?? null;
      setPost(found);
      setAllPosts(posts);
      if (found) getRelatedPosts(found, 3).then((r) => !cancelled && setRelated(r));
    });
    getMdxComponent(slug).then((c) => !cancelled && setMdxContent(() => c));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Scroll to top whenever the slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  // SEO + JSON-LD (Article + BreadcrumbList)
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
      ogImageAlt: fm.title,
      keywords: fm.tags,
      article: {
        publishedTime: new Date(fm.publishedAt).toISOString(),
        modifiedTime: new Date(fm.updatedAt ?? fm.publishedAt).toISOString(),
        author: author.name,
        section: fm.tags[0],
        tags: fm.tags,
        readingTime: post.readingTimeMinutes,
      },
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
            url: author.twitter ? `https://twitter.com/${author.twitter}` : BASE_URL,
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
          articleSection: fm.tags[0],
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

  // Scroll depth tracking + scroll-to-top button visibility
  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    const fired = new Set<number>();
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const pct = total > 0 ? Math.round((window.scrollY / total) * 100) : 0;
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
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00FF9F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">
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
  const prevPost = postIndex >= 0 && postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : null;
  const nextPost = postIndex > 0 ? allPosts[postIndex - 1] : null;
  const canonicalUrl = `${BASE_URL}/blog/${slug}`;

  return (
    <div className="relative min-h-screen bg-[#1E1E1E] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#00FF9F]/[0.035] rounded-full blur-[110px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[400px] bg-[#00FF9F]/[0.02] rounded-full blur-[100px]" />
      </div>
      {/* Hero band: image + title overlay */}
      <header className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={frontmatter.ogImage || "/og-image.png"}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F]/40 via-[#0F0F0F]/80 to-[#0F0F0F]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#00FF9F] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            All Articles
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {frontmatter.tags.map((tag) => (
              <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00FF9F]/10 text-[#00FF9F] hover:bg-[#00FF9F]/20 transition-colors cursor-pointer font-medium border border-[#00FF9F]/20">
                  {tag}
                </span>
              </Link>
            ))}
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] text-white mb-6 tracking-tight max-w-3xl"
          >
            {frontmatter.title}
          </motion.h1>

          {/* Lead description */}
          <p className="text-lg text-gray-400 max-w-3xl leading-relaxed mb-8">
            {frontmatter.description}
          </p>

          {/* Byline */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2.5">
              <img src={author.avatar} alt={author.name} width={32} height={32} className="w-8 h-8 rounded-full ring-1 ring-white/10 object-cover" />
              <span className="text-white font-medium">{author.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={frontmatter.publishedAt}>{formatDate(frontmatter.publishedAt)}</time>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTimeMinutes} min read</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{post.wordCount.toLocaleString()} words</span>
            </div>
            {frontmatter.updatedAt && frontmatter.updatedAt !== frontmatter.publishedAt && (
              <span className="text-xs text-gray-600 italic">Updated {formatDate(frontmatter.updatedAt)}</span>
            )}
          </div>
        </div>
      </header>

      {/* Hero image card */}
      {frontmatter.ogImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
          >
            <img
              src={frontmatter.ogImage}
              alt={frontmatter.title}
              width={1200}
              height={630}
              loading="eager"
              decoding="async"
              className="w-full aspect-[1200/630] object-cover"
            />
          </motion.div>
        </div>
      )}

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)_180px] lg:gap-12">
          {/* Left: TOC timeline (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              {MdxContent && <TableOfContents contentRef={contentRef} key={slug} />}
            </div>
          </aside>

          {/* Center: Article content */}
          <article className="min-w-0">
            <div
              ref={contentRef}
              className="prose prose-invert prose-lg max-w-[68ch] mx-auto
                prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight prose-headings:scroll-mt-24
                prose-h2:text-[1.75rem] prose-h2:mt-14 prose-h2:mb-5 prose-h2:pb-3 prose-h2:border-b prose-h2:border-white/10
                prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
                prose-p:text-gray-200 prose-p:leading-[1.85] prose-p:text-[1.125rem]
                prose-a:text-[#00FF9F] prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:decoration-2 prose-a:underline-offset-2
                prose-strong:text-white prose-strong:font-semibold
                prose-em:text-gray-300
                prose-blockquote:border-l-[3px] prose-blockquote:border-[#00FF9F]/60 prose-blockquote:pl-5 prose-blockquote:text-gray-400 prose-blockquote:not-italic prose-blockquote:font-normal
                prose-code:text-[#00FF9F] prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.9em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-code:font-normal
                prose-pre:!p-0 prose-pre:!bg-transparent prose-pre:!border-0 prose-pre:!rounded-none prose-pre:!shadow-none prose-pre:!my-6
                prose-ul:text-gray-200 prose-ul:my-5 prose-li:my-1.5 prose-li:leading-relaxed
                prose-ol:text-gray-200
                prose-img:rounded-xl prose-img:border prose-img:border-white/10
                prose-table:text-sm prose-table:my-8
                prose-th:text-white prose-th:font-semibold prose-th:border-b prose-th:border-white/15 prose-th:pb-3 prose-th:text-left
                prose-td:text-gray-300 prose-td:border-b prose-td:border-white/5 prose-td:py-3
                prose-hr:border-white/10 prose-hr:my-12
                [&>*:first-child]:mt-0"
            >
              {MdxContent ? (
                <MDXProvider components={mdxComponents}>
                  <MdxContent />
                </MDXProvider>
              ) : (
                <div className="animate-pulse space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${65 + Math.random() * 35}%` }} />
                  ))}
                </div>
              )}
            </div>

            {/* End-of-article footer */}
            <div className="max-w-[68ch] mx-auto">
              {/* Author card */}
              <div className="mt-16">
                <AuthorCard author={author} />
              </div>

              {/* Mobile share */}
              <div className="mt-8 lg:hidden">
                <ShareBar title={frontmatter.title} url={canonicalUrl} />
              </div>


              {/* Related posts */}
              {related.length > 0 && (
                <div className="mt-20">
                  {/* Gradient separator */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#00FF9F]/20 to-transparent mb-14" />

                  {/* Header row */}
                  <div className="flex items-end justify-between mb-10">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-[#00FF9F] font-semibold mb-2">
                        Keep reading
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        Deepen your understanding
                      </h2>
                      <p className="text-gray-400 mt-2 text-sm max-w-sm">
                        Hand-picked to help you get more out of CX Linux
                      </p>
                    </div>
                    <Link
                      href="/blog"
                      className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#00FF9F] transition-colors flex-shrink-0 pb-1"
                    >
                      All articles <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {related.map((p, i) => (
                      <Link href={`/blog/${p.slug}`} key={p.slug}>
                        <motion.article
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
                          className="group relative h-full bg-[#131313] border border-white/8 rounded-2xl overflow-hidden hover:border-[#00FF9F]/30 hover:shadow-[0_0_40px_rgba(0,255,159,0.06)] transition-all duration-300 cursor-pointer flex flex-col"
                        >
                          {/* Hero image */}
                          {p.frontmatter.ogImage && (
                            <div className="aspect-[16/9] overflow-hidden bg-[#0D0D0D]">
                              <img
                                src={p.frontmatter.ogImage}
                                alt={p.frontmatter.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-500"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="p-5 flex flex-col flex-1">
                            <span className="text-[10px] uppercase tracking-wider text-[#00FF9F] font-semibold">
                              {p.frontmatter.tags[0]}
                            </span>
                            <h3 className="mt-2 text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#00FF9F] transition-colors duration-200">
                              {p.frontmatter.title}
                            </h3>
                            <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
                              {p.frontmatter.description}
                            </p>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                              <span className="text-[11px] text-gray-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {p.readingTimeMinutes} min read
                              </span>
                              <span className="text-[11px] text-[#00FF9F] flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200">
                                Read <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </motion.article>
                      </Link>
                    ))}
                  </div>

                  {/* Browse all CTA */}
                  <div className="flex justify-center mt-10">
                    <Link href="/blog">
                      <button className="px-6 py-2.5 rounded-full border border-white/10 hover:border-[#00FF9F]/30 text-sm text-gray-400 hover:text-[#00FF9F] transition-all duration-200 flex items-center gap-2">
                        Browse all articles <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Right: ShareBar (sticky desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ShareBar title={frontmatter.title} url={canonicalUrl} />
            </div>
          </aside>
        </div>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 w-11 h-11 bg-[#00FF9F] text-black rounded-full flex items-center justify-center shadow-lg hover:bg-[#00CC7F] transition-colors z-50"
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
