import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/blog/schema";

interface ArticleCardHeroProps {
  post: BlogPost;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ArticleCardHero({ post }: ArticleCardHeroProps) {
  const { slug, frontmatter, readingTimeMinutes } = post;
  const imageUrl = frontmatter.ogImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link href={`/blog/${slug}`}>
        <article className="group relative rounded-2xl overflow-hidden border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/60 transition-all duration-300 cursor-pointer bg-[#0D0D10] min-h-[340px] flex flex-col justify-end">
          {/* Background image */}
          {imageUrl && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
            </>
          )}
          {!imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0E0E12]" />
          )}

          {/* Featured badge */}
          <div className="absolute top-4 left-4">
            <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 bg-[#2F6BFF] text-white rounded-full">
              Featured
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {frontmatter.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2F6BFF]/15 text-[#7AA0FF] font-medium border border-[#2F6BFF]/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-[#7AA0FF] transition-colors duration-200">
              {frontmatter.title}
            </h2>

            {/* Excerpt */}
            <p className="text-gray-300 mb-6 leading-relaxed line-clamp-2 max-w-2xl">
              {frontmatter.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(frontmatter.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readingTimeMinutes} min read
                </span>
              </div>
              <span className="inline-flex items-center gap-2 bg-[#2F6BFF] text-white text-sm font-semibold px-4 py-2 rounded-lg group-hover:bg-[#2257E0] transition-colors">
                Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
