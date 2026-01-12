import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, ArrowRight, Newspaper, Tag, MapPin, Image as ImageIcon } from "lucide-react";
import { pressReleases } from "@/data/pressReleases";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";

export default function NewsPage() {
  const sortedReleases = useMemo(() => 
    [...pressReleases].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ), 
  []);

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
        "description": release.summary,
        "url": `https://cortexlinux.com/news/${release.slug}`,
        "author": {
          "@type": "Organization",
          "name": "Cortex Linux"
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
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6"
              data-testid="badge-press-room"
            >
              <Newspaper size={16} />
              Press Room
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
                Cortex Linux
              </span>
              <br />
              <span className="text-white">News & Press</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Official announcements, press releases, and company updates for journalists, investors, and the developer community
            </p>
          </motion.div>

          <div className="space-y-8" data-testid="news-list">
            {sortedReleases.map((release, index) => (
              <motion.article
                key={release.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
                data-testid={`article-news-${release.slug}`}
              >
                <Link href={`/news/${release.slug}`}>
                  <div className="rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer overflow-hidden">
                    {release.image && (
                      <div className="relative w-full h-48 md:h-56 bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
                        <img 
                          src={release.image} 
                          alt={release.headline || release.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                      </div>
                    )}
                    
                    {!release.image && (
                      <div className="relative w-full h-32 md:h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 flex items-center justify-center">
                        <ImageIcon size={48} className="text-white/10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
                      </div>
                    )}

                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                          <Calendar size={14} className="text-blue-400" />
                          <time 
                            dateTime={release.date} 
                            className="text-sm font-medium text-blue-400"
                            data-testid={`date-news-${release.slug}`}
                          >
                            {formatShortDate(release.date)}
                          </time>
                        </div>
                        {release.dateline && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin size={12} />
                            <span>{release.dateline}</span>
                          </div>
                        )}
                      </div>

                      <h2 
                        className="text-xl md:text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors leading-tight"
                        data-testid={`title-news-${release.slug}`}
                      >
                        {release.headline || release.title}
                      </h2>

                      <p className="text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                        {release.summary}
                      </p>

                      {release.tags && release.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                          {release.tags.slice(0, 4).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400"
                              data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <Tag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium hover:bg-blue-500/20 transition-colors"
                        data-testid={`link-read-article-${release.slug}`}
                      >
                        Read Full Article
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {sortedReleases.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
              data-testid="empty-state-news"
            >
              <Newspaper size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500">No press releases yet. Check back soon!</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 p-8 rounded-2xl bg-white/5 border border-white/10 text-center"
            data-testid="section-media-contact"
          >
            <h2 className="text-2xl font-bold mb-3">Media Contact</h2>
            <p className="text-gray-400 mb-4">
              For press inquiries, interviews, and media requests
            </p>
            <a 
              href="mailto:press@cortexlinux.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
              data-testid="link-media-contact-email"
            >
              press@cortexlinux.com
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
