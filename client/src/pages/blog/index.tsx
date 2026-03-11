import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { updateSEO, seoConfigs } from "@/lib/seo";
import { blogPosts } from "@/data/blog-posts";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import Footer from "@/components/Footer";

export default function BlogIndex() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.blog);
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            CX Linux <span className="text-[#00FF9F]">Blog</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tutorials, insights, and updates from the CX Linux team.
          </p>
        </motion.div>

        <div className="space-y-6">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <article className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#00FF9F]/30 hover:bg-white/[0.07] transition-all cursor-pointer group">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
                  </div>

                  <h2 className="text-xl font-bold mb-2 group-hover:text-[#00FF9F] transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
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
                    <span className="text-[#00FF9F] text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
