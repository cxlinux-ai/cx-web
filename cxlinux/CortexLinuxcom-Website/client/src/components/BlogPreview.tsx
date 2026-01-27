import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { getLatestPosts } from "@/data/blogPosts";
import BlogCard from "./BlogCard";

export default function BlogPreview() {
  const latestPosts = getLatestPosts(3);

  return (
    <section className="py-24 px-4 border-t border-white/5 relative">
      {/* Subtle background blobs */}
      <div className="bg-blob bg-blob-blue w-[400px] h-[400px] top-10 right-1/4" style={{ animationDelay: '4s' }} />
      <div className="bg-blob bg-blob-blue w-[300px] h-[300px] bottom-0 left-1/3" style={{ animationDelay: '9s' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Latest from the <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Technical insights, tutorials, and best practices for ML engineers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <BlogCard post={post} index={index} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-gray-300 hover:border-blue-500/50 hover:text-white hover:bg-blue-500/10 transition-all duration-300"
            data-testid="link-view-all-posts"
          >
            View all posts
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
