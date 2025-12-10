import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { getLatestPosts } from "@/data/blogPosts";

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
            Latest from the <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Blog</span>
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
              <Link href={`/blog/${post.slug}`}>
                <article
                  className="group h-full rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 cursor-pointer"
                  data-testid={`blog-card-${post.slug}`}
                >
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-900/20 to-gray-900/40">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl text-blue-500/30">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 px-2 py-1 text-xs font-medium bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300">
                      {post.category}
                    </span>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {post.readingTime}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-blue-400 group-hover:gap-2 transition-all">
                        Read
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
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
