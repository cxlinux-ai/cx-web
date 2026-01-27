import { Link } from "wouter";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-200 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 cursor-pointer"
        data-testid={`blog-card-${post.slug}`}
      >
        {/* Image Container - Fixed Height */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-900/20 to-gray-900/40">
          {/* Skeleton Loader */}
          {!imageLoaded && !imageError && post.image && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
          )}
          
          {/* Image */}
          {post.image && !imageError ? (
            <img
              src={post.image}
              alt={post.imageAlt || post.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-4xl text-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                  <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
                </svg>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Category Badge */}
          <span className="absolute bottom-3 left-3 px-2 py-1 text-xs font-medium bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300">
            {post.category}
          </span>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-sm text-gray-400 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {post.readingTime}
              </span>
            </div>
            
            <span className="flex items-center gap-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Read <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
