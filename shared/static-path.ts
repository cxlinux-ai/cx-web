import { HOWTO_PATHS } from "./howto/manifest";

/**
 * Paths that should be served from the static asset bundle when present.
 * /how-to pages are pre-rendered HTML files (client/public/how-to.html and how-to/*.html). Only
 * the paths in the generated manifest count: the Pages asset server falls back to index.html with
 * HTTP 200 for unknown paths, so a prefix rule would turn every mistyped guide URL into a soft 404.
 */
export function shouldServeAsStaticAsset(pathname: string): boolean {
  // Guides are decided by the manifest alone, including `.html` spellings (which the asset
  // server 308-redirects to the clean URL); the extension rule below must not catch them.
  if (pathname.startsWith("/how-to/")) {
    return HOWTO_PATHS.has(pathname.replace(/\.html$/, ""));
  }
  if (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/brand/") ||
    HOWTO_PATHS.has(pathname)
  ) {
    return true;
  }
  return /\.[a-z0-9]+$/i.test(pathname);
}
