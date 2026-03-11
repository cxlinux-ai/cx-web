import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { updateSEO } from "@/lib/seo";
import { getBlogPost, blogPosts } from "@/data/blog-posts";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import Footer from "@/components/Footer";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const post = params?.slug ? getBlogPost(params.slug) : undefined;

  useEffect(() => {
    if (post) {
      const cleanup = updateSEO({
        title: `${post.title} | CX Linux Blog`,
        description: post.excerpt,
        canonicalPath: `/blog/${post.slug}`,
        ogType: "article",
        keywords: post.tags,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          author: {
            "@type": "Organization",
            name: post.author,
          },
          publisher: {
            "@type": "Organization",
            name: "CX Linux",
            url: "https://cxlinux.com",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://cxlinux.com/blog/${post.slug}`,
          },
        },
      });
      return cleanup;
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#121212] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <Link
            href="/blog"
            className="text-[#00FF9F] hover:underline"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Find next/prev posts
  const currentIndex = blogPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#121212] text-white py-16 px-4">
      <article className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-[#00FF9F] transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="text-gray-600">by {post.author}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-[#00FF9F]/10 text-[#00FF9F]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-[#00FF9F] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-code:text-[#00FF9F] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-4
              prose-ul:text-gray-300 prose-li:mb-1"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#00FF9F]/30 transition-all"
              >
                <p className="text-xs text-gray-500 mb-1">← Previous</p>
                <p className="text-sm font-semibold line-clamp-2">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#00FF9F]/30 transition-all text-right"
              >
                <p className="text-xs text-gray-500 mb-1">Next →</p>
                <p className="text-sm font-semibold line-clamp-2">
                  {nextPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </motion.div>
      </article>
      <Footer />
    </div>
  );
}
