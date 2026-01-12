import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { Calendar, ArrowLeft, Tag, Share2, Mail, Phone, Building } from "lucide-react";
import { getPressReleaseBySlug, getRecentPressReleases } from "@/data/pressReleases";
import { updateSEO } from "@/lib/seo";
import Footer from "@/components/Footer";

export default function NewsArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const release = getPressReleaseBySlug(slug || "");

  useEffect(() => {
    if (!release) {
      setLocation("/news");
      return;
    }

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://cortexlinux.com";

    const keywords = [
      "press release",
      "cortex linux",
      "AI Linux",
      ...(release.tags || [])
    ];

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": release.headline || release.title,
      "datePublished": release.date,
      "dateModified": release.date,
      "description": release.summary,
      "author": {
        "@type": "Organization",
        "name": "Cortex Linux",
        "url": siteUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": "Cortex Linux",
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${siteUrl}/news/${release.slug}`
      },
      "keywords": release.tags?.join(", ") || "Cortex Linux, AI, Linux"
    };

    return updateSEO({
      title: `${release.headline || release.title} | Cortex Linux News`,
      description: release.summary,
      canonicalPath: `/news/${release.slug}`,
      ogType: "article",
      ogImage: release.image,
      keywords,
      jsonLd
    });
  }, [release, setLocation]);

  if (!release) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const recentReleases = getRecentPressReleases(3).filter(r => r.slug !== release.slug);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: release.title,
        text: release.summary,
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <article className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/news">
              <span className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8 cursor-pointer" data-testid="link-back-to-news">
                <ArrowLeft size={16} />
                Back to News
              </span>
            </Link>

            <header className="mb-12">
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <time dateTime={release.date}>{formatDate(release.date)}</time>
                </div>
                {release.dateline && (
                  <>
                    <span>•</span>
                    <span className="font-medium">{release.dateline}</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {release.headline || release.title}
              </h1>

              <p className="text-xl text-gray-400 mb-6">
                {release.summary}
              </p>

              {release.tags && release.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {release.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                data-testid="button-share"
              >
                <Share2 size={16} />
                Share
              </button>
            </header>

            <div className="prose prose-invert prose-lg max-w-none">
              {release.content.map((paragraph, index) => (
                <p key={index} className="text-gray-300 leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}

              {release.quotes && release.quotes.length > 0 && (
                <div className="my-10 space-y-8">
                  {release.quotes.map((quote, index) => (
                    <blockquote
                      key={index}
                      className="border-l-4 border-blue-500 pl-6 py-2 my-8"
                    >
                      <p className="text-xl text-white italic mb-3">"{quote.text}"</p>
                      <footer className="text-gray-400">
                        <strong className="text-white">{quote.author}</strong>
                        {quote.title && <span>, {quote.title}</span>}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              )}

              {release.subheadings && release.subheadings.map((section, index) => (
                <div key={index} className="mt-10">
                  <h3 className="text-xl font-semibold mb-4 text-white">{section.title}</h3>
                  {section.paragraphs.map((para, pIndex) => (
                    <p key={pIndex} className="text-gray-300 leading-relaxed mb-4">
                      {para}
                    </p>
                  ))}
                  {release.bulletPoints?.find(bp => bp.heading === section.title) && (
                    <ul className="list-none space-y-3 my-6">
                      {release.bulletPoints.find(bp => bp.heading === section.title)?.items.map((item, iIndex) => (
                        <li key={iIndex} className="flex items-start gap-3 text-gray-300">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.title === "How to Participate" && release.links && (
                    <ul className="list-none space-y-2 my-6">
                      {release.links.map((link, lIndex) => (
                        <li key={lIndex} className="flex items-center gap-2">
                          <span className="text-gray-400">{link.label}:</span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {release.boilerplate && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <h3 className="text-lg font-semibold mb-4 text-white">About Cortex Linux</h3>
                  <p className="text-gray-400">{release.boilerplate}</p>
                </div>
              )}

              {release.companyBoilerplate && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-white">About AI Venture Holdings LLC</h3>
                  <p className="text-gray-400">{release.companyBoilerplate}</p>
                </div>
              )}

              {release.contactInfo && (
                <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building size={18} />
                    Media Contact
                  </h3>
                  <div className="space-y-2 text-gray-400">
                    <p className="font-medium text-white">{release.contactInfo.name}</p>
                    {release.contactInfo.title && (
                      <p className="text-sm">{release.contactInfo.title}</p>
                    )}
                    <p className="flex items-center gap-2">
                      <Mail size={14} />
                      <a href={`mailto:${release.contactInfo.email}`} className="text-blue-400 hover:text-blue-300">
                        {release.contactInfo.email}
                      </a>
                    </p>
                    {release.contactInfo.phone && (
                      <p className="flex items-center gap-2">
                        <Phone size={14} />
                        <a href={`tel:${release.contactInfo.phone}`} className="text-blue-400 hover:text-blue-300">
                          {release.contactInfo.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {recentReleases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-16 pt-12 border-t border-white/10"
            >
              <h2 className="text-2xl font-bold mb-8">More News</h2>
              <div className="space-y-4">
                {recentReleases.map(pr => (
                  <Link key={pr.slug} href={`/news/${pr.slug}`}>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all cursor-pointer group">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar size={12} />
                        <time dateTime={pr.date}>{formatDate(pr.date)}</time>
                      </div>
                      <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                        {pr.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
}
