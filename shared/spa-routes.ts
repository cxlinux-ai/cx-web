/** Client-side routes that should return index.html with HTTP 200. */
const EXACT_SPA_ROUTES = new Set([
  "/getting-started",
  "/pricing",
  "/pricing/checkout",
  "/pricing/success",
  "/pricing/faq",
  "/privacy",
  "/terms",
  "/faq",
  "/about",
  "/status",
  "/affiliates",
  "/account",
  "/blog",
  "/admin",
  "/admin/referrals",
]);

const SPA_PREFIXES = ["/blog/"];

/** Static assets under SPA-looking paths (must not return index.html). */
const NON_SPA_EXACT = new Set(["/blog/rss.xml"]);

export function isSpaRoute(pathname: string): boolean {
  if (NON_SPA_EXACT.has(pathname)) {
    return false;
  }
  if (pathname === "/") {
    return true;
  }
  if (EXACT_SPA_ROUTES.has(pathname)) {
    return true;
  }
  return SPA_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
