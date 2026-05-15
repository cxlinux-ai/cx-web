import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/blog/schema";

interface ArticleCardProps {
  post: BlogPost;
  index?: number;
  compact?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ArticleCard({ post, index = 0, compact = false }: ArticleCardProps) {
  const { slug, frontmatter, readingTimeMinutes } = post;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
    >
      <Link href={`/blog/${slug}`}>
        <article className="group h-full bg-[#1A1A1A] border border-white/8 rounded-xl p-6 hover:border-[#00FF9F]/30 hover:bg-[#1F1F1F] transition-all duration-200 cursor-pointer flex flex-col">
          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(frontmatter.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readingTimeMinutes} min read
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {frontmatter.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FF9F]/10 text-[#00FF9F] font-medium"
              >
                {tag}
              </span>
            ))}
            {frontmatter.tags.length > 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                +{frontmatter.tags.length - 2}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-white group-hover:text-[#00FF9F] transition-colors leading-snug mb-2 line-clamp-2">
            {frontmatter.title}
          </h2>

          {/* Excerpt */}
          {!compact && (
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
              {frontmatter.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
            <span className="text-xs text-gray-500">{frontmatter.author}</span>
            <span className="text-[#00FF9F] text-xs flex items-center gap-1 group-hover:gap-2 transition-all duration-150">
              Read <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
