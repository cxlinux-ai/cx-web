import { useEffect, useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { updateSEO, seoConfigs } from "@/lib/seo";
import { getAllPosts, getAllTags } from "@/blog/parse";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { ArticleCardHero } from "@/components/blog/ArticleCardHero";
import Footer from "@/components/Footer";
import type { BlogPost } from "@/blog/schema";

const POSTS_PER_PAGE = 10;

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const search = useSearch();

  const params = new URLSearchParams(search);
  const activeTag = params.get("tag") ?? "";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const [query, setQuery] = useState("");

  useEffect(() => {
    const cleanup = updateSEO({
      ...seoConfigs.blog,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": "https://cxlinux.com/blog",
        name: "CX Linux Blog",
        description: seoConfigs.blog.description,
        url: "https://cxlinux.com/blog",
        publisher: {
          "@type": "Organization",
          name: "CX Linux",
          logo: { "@type": "ImageObject", url: "https://cxlinux.com/logo.png" },
        },
      },
    });
    return cleanup;
  }, []);

  useEffect(() => {
    getAllPosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });
    getAllTags().then(setTags);
  }, []);

  const featured = useMemo(() => posts.find((p) => p.frontmatter.featured), [posts]);

  const filtered = useMemo(() => {
    let result = posts.filter((p) => !p.frontmatter.featured || activeTag || query);
    if (activeTag) result = result.filter((p) => p.frontmatter.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase()));
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) => p.frontmatter.title.toLowerCase().includes(q) || p.frontmatter.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeTag, query]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,159,0.06)_0%,transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              CX Linux <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Tutorials, architecture deep-dives, and practical guides for AI-powered Linux engineering.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col gap-3 mb-10">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Search className="w-4 h-4 text-gray-500" />
            </span>
            <input
              type="text"
              placeholder="Search posts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF9F]/40 transition-all"
            />
          </div>

          {/* Tags — top 8 only to prevent overflow */}
          <div className="flex flex-wrap gap-2">
            <Link href="/blog">
              <span className={`text-xs px-3 py-1.5 rounded-full cursor-pointer border transition-all ${!activeTag ? "bg-[#00FF9F] text-black border-[#00FF9F] font-semibold" : "bg-white/5 border-white/10 text-gray-400 hover:border-[#00FF9F]/40 hover:text-white"}`}>
                All
              </span>
            </Link>
            {tags.slice(0, 8).map(({ tag }) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <span className={`text-xs px-3 py-1.5 rounded-full cursor-pointer border transition-all ${activeTag === tag ? "bg-[#00FF9F] text-black border-[#00FF9F] font-semibold" : "bg-white/5 border-white/10 text-gray-400 hover:border-[#00FF9F]/40 hover:text-white"}`}>
                  {tag}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#00FF9F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Featured hero (only on first page, no filter, no search) */}
            {featured && !activeTag && !query && page === 1 && (
              <div className="mb-10">
                <ArticleCardHero post={featured} />
              </div>
            )}

            {/* Post grid */}
            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                {paginated.map((post, i) => (
                  <ArticleCard key={post.slug} post={post} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                No posts found{query ? ` for "${query}"` : ""}{activeTag ? ` tagged "${activeTag}"` : ""}.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-10">
                {page > 1 && (
                  <Link href={`/blog?${new URLSearchParams({ ...(activeTag ? { tag: activeTag } : {}), page: String(page - 1) })}`}>
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer">← Prev</span>
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/blog?${new URLSearchParams({ ...(activeTag ? { tag: activeTag } : {}), page: String(p) })}`}>
                    <span className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all ${p === page ? "bg-[#00FF9F] text-black font-semibold" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"}`}>{p}</span>
                  </Link>
                ))}
                {page < totalPages && (
                  <Link href={`/blog?${new URLSearchParams({ ...(activeTag ? { tag: activeTag } : {}), page: String(page + 1) })}`}>
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer">Next →</span>
                  </Link>
                )}
              </div>
            )}
          </>
        )}

      </div>

      <Footer />
    </div>
  );
}
