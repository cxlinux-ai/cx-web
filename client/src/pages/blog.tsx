import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search, ChevronLeft, Clock, Calendar } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { blogPosts, getAllCategories } from "@/data/blogPosts";
import { Input } from "@/components/ui/input";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { updateSEO, seoConfigs } from "@/lib/seo";

const FEATURED_POSTS = [
  {
    slug: "getting-started-cortex-first-workflow",
    level: "Beginner",
    step: 1,
    badge: "Start Here",
    badgeColor: "bg-green-500/20 text-green-300 border-green-500/30"
  },
  {
    slug: "ml-debugging-finding-real-problem",
    level: "Intermediate",
    step: 2,
    badge: "Most Popular",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  },
  {
    slug: "gpu-optimization-real-techniques",
    level: "Advanced",
    step: 3,
    badge: "Deep Dive",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
  }
];

export default function Blog() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.blog);
    return cleanup;
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => getAllCategories(), []);

  const filteredPosts = useMemo(() => {
    return blogPosts
      .filter(post => {
        const matchesSearch = 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = !selectedCategory || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, selectedCategory]);

  const featuredPostsData = useMemo(() => {
    return FEATURED_POSTS.map(featured => {
      const post = blogPosts.find(p => p.slug === featured.slug);
      return post ? { ...post, ...featured } : null;
    }).filter(Boolean);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section aria-labelledby="blog-heading" className="max-w-6xl mx-auto px-4 mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-300 transition-colors mb-8">
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 id="blog-heading" className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">CX</span>{" "}
            <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Technical insights, tutorials, and best practices for Linux automation and AI-powered workflows
          </p>
        </motion.div>
      </section>

      {/* Start Here Section - only shows when no search/filter active */}
      {!searchTerm && !selectedCategory && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-6xl mx-auto px-4 mb-12"
        >
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">New to CX?</h2>
            <p className="text-sm sm:text-base text-gray-400">Start your journey with this curated reading path.</p>
          </div>
          
          <div className="relative">
            {/* Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {featuredPostsData.map((post, index) => {
                if (!post) return null;
                const featured = FEATURED_POSTS[index];
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={index === 2 ? "sm:col-span-2 lg:col-span-1" : ""}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <article
                        className="group relative rounded-xl sm:rounded-2xl border-2 border-transparent bg-gradient-to-b from-white/[0.08] to-white/[0.02] overflow-hidden transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer h-full"
                        style={{
                          backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), linear-gradient(to right, ${
                            index === 0 ? 'rgba(34,197,94,0.3), rgba(34,197,94,0.1)' :
                            index === 1 ? 'rgba(168,85,247,0.3), rgba(168,85,247,0.1)' :
                            'rgba(249,115,22,0.3), rgba(249,115,22,0.1)'
                          })`,
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box'
                        }}
                        data-testid={`featured-card-${post.slug}`}
                      >
                        {/* Glow effect on hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${
                          index === 0 ? 'shadow-[0_0_40px_rgba(34,197,94,0.3)]' :
                          index === 1 ? 'shadow-[0_0_40px_rgba(168,85,247,0.3)]' :
                          'shadow-[0_0_40px_rgba(249,115,22,0.3)]'
                        }`} />
                        
                        {/* Step Number Circle - responsive sizing */}
                        <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold ${
                          index === 0 ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                          index === 1 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' :
                          'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                        }`}>
                          {featured.step}
                        </div>
                        
                        <div className="p-4 pt-14 sm:p-6 sm:pt-16 relative z-10">
                          {/* Badges Row */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${featured.badgeColor}`}>
                              {featured.badge}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              index === 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              index === 1 ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}>
                              {featured.level}
                            </span>
                          </div>
                          
                          <h3 className="text-base sm:text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          
                          <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          
                          {/* Meta - responsive sizing */}
                          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} className="sm:w-3 sm:h-3" />
                              {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} className="sm:w-3 sm:h-3" />
                              {post.readingTime}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50"
              data-testid="input-blog-search"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                !selectedCategory 
                  ? "bg-blue-500/20 border border-blue-500/50 text-blue-300" 
                  : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
              }`}
              data-testid="filter-all"
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCategory === category 
                    ? "bg-blue-500/20 border border-blue-500/50 text-blue-300" 
                    : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
                }`}
                data-testid={`filter-${category.toLowerCase().replace(' ', '-')}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid - responsive for all devices */}
      <div className="max-w-6xl mx-auto px-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-400">No posts found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BlogCard post={post} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
