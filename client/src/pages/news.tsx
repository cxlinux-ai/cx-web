import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, ArrowRight, Newspaper, Tag } from "lucide-react";
import { pressReleases } from "@/data/pressReleases";
import Footer from "@/components/Footer";

export default function NewsPage() {
  const sortedReleases = [...pressReleases].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
              <Newspaper size={16} />
              Press Room
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              News & <span className="gradient-text">Press Releases</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The latest announcements, updates, and news from Cortex Linux
            </p>
          </motion.div>

          <div className="space-y-6">
            {sortedReleases.map((release, index) => (
              <motion.article
                key={release.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/news/${release.slug}`}>
                  <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <time dateTime={release.date}>{formatDate(release.date)}</time>
                      </div>
                      {release.dateline && (
                        <>
                          <span>•</span>
                          <span>{release.dateline}</span>
                        </>
                      )}
                    </div>

                    <h2 className="text-xl md:text-2xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                      {release.headline || release.title}
                    </h2>

                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {release.summary}
                    </p>

                    {release.tags && release.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {release.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-gray-400"
                          >
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-blue-400 font-medium">
                      Read Full Release
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
            >
              <Newspaper size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500">No press releases yet. Check back soon!</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
