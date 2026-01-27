import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, ArrowRight, Newspaper, Tag, Star, ExternalLink, Image as ImageIcon } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { pressReleases } from "@/data/pressReleases";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";

const FILTER_TAGS = ["All", "Product", "Company", "Hackathon", "Community"] as const;
type FilterTag = typeof FILTER_TAGS[number];

function mapReleaseToFilter(release: typeof pressReleases[0]): FilterTag[] {
  const tags: FilterTag[] = [];
  const releaseTags = release.tags?.map(t => t.toLowerCase()) || [];
  
  if (releaseTags.some(t => t.includes("product") || t.includes("release") || t.includes("update") || t.includes("v2"))) {
    tags.push("Product");
  }
  if (releaseTags.some(t => t.includes("funding") || t.includes("company") || t.includes("investment") || t.includes("milestone"))) {
    tags.push("Company");
  }
  if (releaseTags.some(t => t.includes("hackathon") || t.includes("event") || t.includes("global"))) {
    tags.push("Hackathon");
  }
  if (releaseTags.some(t => t.includes("community") || t.includes("contributor"))) {
    tags.push("Community");
  }
  
  return tags.length > 0 ? tags : ["Company"];
}

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTag>("All");

  const sortedReleases = useMemo(() => 
    [...pressReleases].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ), 
  []);

  const featuredRelease = sortedReleases[0];
  const regularReleases = sortedReleases.slice(1);

  const filteredReleases = useMemo(() => {
    if (activeFilter === "All") return regularReleases;
    return regularReleases.filter(release => 
      mapReleaseToFilter(release).includes(activeFilter)
    );
  }, [regularReleases, activeFilter]);

  const newsJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cortex Linux News & Press Releases",
    "description": "Latest announcements and press releases from Cortex Linux",
    "itemListElement": sortedReleases.map((release, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "NewsArticle",
        "headline": release.headline || release.title,
        "datePublished": release.date,
        "dateModified": release.date,
        "description": release.summary,
        "url": `https://cxlinux-ai.com/news/${release.slug}`,
        "image": release.image ? `https://cxlinux-ai.com${release.image}` : "https://cxlinux-ai.com/og-image.png",
        "author": {
          "@type": "Organization",
          "name": "Cortex Linux",
          "url": "https://cxlinux-ai.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Cortex Linux",
          "logo": {
            "@type": "ImageObject",
            "url": "https://cxlinux-ai.com/favicon.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://cxlinux-ai.com/news/${release.slug}`
        }
      }
    }))
  }), [sortedReleases]);

  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Cortex Linux News & Press | Official Announcements',
      description: 'Official press releases, company announcements, and news from Cortex Linux. Stay updated on product launches, funding rounds, partnerships, and the future of AI-native operating systems.',
      canonicalPath: '/news',
      keywords: ['Cortex Linux news', 'AI Linux press releases', 'Cortex announcements', 'AI operating system news', 'Linux company updates'],
      jsonLd: newsJsonLd
    });

    return cleanup;
  }, [newsJsonLd]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-6"
              data-testid="badge-press-room"
            >
              <Newspaper size={16} />
              Press Room
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
                Cortex Linux News & Press
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Official announcements, press releases, and company updates for journalists, investors, and the developer community
            </p>
          </motion.div>

          {featuredRelease && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
              data-testid="section-featured-article"
            >
              <div className="flex items-center gap-2 mb-6">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-300">Featured Article</h2>
              </div>
              <Link href={`/news/${featuredRelease.slug}`}>
                <article 
                  className="group relative rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:border-blue-500/30 cursor-pointer"
                  data-testid={`article-featured-${featuredRelease.slug}`}
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative aspect-video md:aspect-auto md:h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
                      {featuredRelease.image ? (
                        <img 
                          src={featuredRelease.image} 
                          alt={featuredRelease.headline || featuredRelease.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={64} className="text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]/50 md:block hidden" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                          Latest
                        </span>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <time 
                        dateTime={featuredRelease.date} 
                        className="text-sm text-gray-400 mb-3"
                        data-testid={`date-featured-${featuredRelease.slug}`}
                      >
                        {formatDate(featuredRelease.date)}
                      </time>
                      <h3 
                        className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 group-hover:text-blue-300 transition-colors leading-tight"
                        data-testid={`title-featured-${featuredRelease.slug}`}
                      >
                        {featuredRelease.headline || featuredRelease.title}
                      </h3>
                      <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed text-base">
                        {featuredRelease.summary}
                      </p>
                      {featuredRelease.tags && featuredRelease.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {featuredRelease.tags.slice(0, 4).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400"
                            >
                              <Tag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div 
                        className="inline-flex items-center gap-2 text-blue-300 font-medium group-hover:gap-3 transition-all"
                        data-testid={`link-read-featured-${featuredRelease.slug}`}
                      >
                        Read Full Article
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.section>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
            data-testid="section-tag-filters"
          >
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {FILTER_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === tag
                      ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                  data-testid={`filter-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="news-grid"
          >
            {filteredReleases.map((release, index) => (
              <motion.article
                key={release.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group"
                data-testid={`article-news-${release.slug}`}
              >
                <Link href={`/news/${release.slug}`}>
                  <div className="h-full rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:border-blue-500/30 cursor-pointer flex flex-col">
                    <div className="relative aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
                      {release.image ? (
                        <img 
                          src={release.image} 
                          alt={release.headline || release.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={40} className="text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <time 
                        dateTime={release.date} 
                        className="text-sm text-gray-400 mb-2"
                        data-testid={`date-news-${release.slug}`}
                      >
                        {formatShortDate(release.date)}
                      </time>

                      <h2 
                        className="text-lg font-bold mb-3 group-hover:text-blue-300 transition-colors leading-tight line-clamp-2"
                        style={{ fontSize: '18px' }}
                        data-testid={`title-news-${release.slug}`}
                      >
                        {release.headline || release.title}
                      </h2>

                      <p 
                        className="text-gray-400 mb-4 line-clamp-3 flex-1"
                        style={{ fontSize: '14px', lineHeight: '1.6' }}
                      >
                        {release.summary}
                      </p>

                      {release.tags && release.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {release.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-500"
                              data-testid={`tag-${release.slug}-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div 
                        className="inline-flex items-center gap-2 text-blue-300 text-sm font-medium group-hover:gap-3 transition-all mt-auto"
                        data-testid={`link-read-article-${release.slug}`}
                      >
                        Read More
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>

                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "NewsArticle",
                      "headline": release.headline || release.title,
                      "datePublished": release.date,
                      "dateModified": release.date,
                      "description": release.summary,
                      "image": release.image ? `https://cxlinux-ai.com${release.image}` : "https://cxlinux-ai.com/og-image.png",
                      "author": {
                        "@type": "Organization",
                        "name": "Cortex Linux"
                      },
                      "publisher": {
                        "@type": "Organization",
                        "name": "Cortex Linux",
                        "logo": {
                          "@type": "ImageObject",
                          "url": "https://cxlinux-ai.com/favicon.png"
                        }
                      },
                      "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `https://cxlinux-ai.com/news/${release.slug}`
                      }
                    })
                  }}
                />
              </motion.article>
            ))}
          </div>

          {filteredReleases.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
              data-testid="empty-state-news"
            >
              <Newspaper size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500">No articles found for this category. Try another filter!</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 p-8 rounded-xl bg-white/5 border border-white/10 text-center"
            data-testid="section-media-contact"
          >
            <h2 className="text-2xl font-bold mb-3">Media Contact</h2>
            <p className="text-gray-400 mb-6">
              For press inquiries, interviews, and media requests
            </p>
            <a 
              href="mailto:press@cxlinux-ai.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              data-testid="link-media-contact-email"
            >
              press@cxlinux-ai.com
              <ExternalLink size={16} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 p-6 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/5"
            data-testid="section-github-social-proof"
          >
            <div className="flex items-center gap-3">
              <SiGithub size={24} className="text-white" />
              <span className="text-gray-300 font-medium">Follow Cortex Linux on GitHub</span>
            </div>
            <a
              href="https://github.com/cxlinux-ai/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
              data-testid="link-github-stars"
            >
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white font-semibold">Star on GitHub</span>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
