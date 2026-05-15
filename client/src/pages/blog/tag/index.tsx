import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Hash } from "lucide-react";
import { updateSEO } from "@/lib/seo";
import { getPostsByTag } from "@/blog/parse";
import { ArticleCard } from "@/components/blog/ArticleCard";
import Footer from "@/components/Footer";
import type { BlogPost } from "@/blog/schema";

export default function BlogTagArchive() {
  const [, params] = useRoute("/blog/tag/:tag");
  const tag = params?.tag ? decodeURIComponent(params.tag) : "";

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tag) return;
    getPostsByTag(tag).then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, [tag]);

  useEffect(() => {
    if (!tag) return;
    const cleanup = updateSEO({
      title: `#${tag} Posts | CX Linux Blog`,
      description: `Browse all CX Linux blog posts tagged with "${tag}". Tutorials, guides, and technical deep-dives for AI-powered Linux engineering.`,
      canonicalPath: `/blog/tag/${encodeURIComponent(tag)}`,
    });
    return cleanup;
  }, [tag]);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,159,0.04)_0%,transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00FF9F] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              All Posts
            </Link>
            <div className="flex items-center gap-3">
              <Hash className="w-8 h-8 text-[#00FF9F]" />
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="text-[#00FF9F]">{tag}</span>
              </h1>
            </div>
            {!loading && (
              <p className="text-gray-400 mt-3">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#00FF9F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {posts.map((post, i) => (
              <ArticleCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">No posts found for this tag.</div>
        )}
      </div>

      <Footer />
    </div>
  );
}
