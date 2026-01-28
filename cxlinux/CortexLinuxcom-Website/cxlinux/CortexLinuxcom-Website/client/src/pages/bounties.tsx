import { useEffect } from "react";
import Footer from "@/components/Footer";
import { BountiesBoard } from "@/components/bounties";
import { updateSEO, seoConfigs } from "@/lib/seo";

/**
 * Bounties Page
 *
 * Displays GitHub issues labeled "bounty" from the cortexlinux organization.
 *
 * SEO Optimized:
 * - Server-side data fetching via API (data cached for 5 minutes)
 * - Semantic HTML structure
 * - Structured data (JSON-LD) for rich search results
 * - Proper meta tags for social sharing
 *
 * Performance:
 * - Server caches GitHub API responses to prevent rate limits
 * - Client refreshes data every 5 minutes to stay in sync
 * - Loading skeletons for perceived performance
 */
export default function BountiesPage() {
  // Set up SEO meta tags on mount
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.bounties);
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Main Content */}
      <BountiesBoard />

      {/* Footer */}
      <Footer />
    </div>
  );
}
