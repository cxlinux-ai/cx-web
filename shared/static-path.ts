/** Paths that should be served from the static asset bundle when present. */
export function shouldServeAsStaticAsset(pathname: string): boolean {
  if (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/brand/")
  ) {
    return true;
  }
  return /\.[a-z0-9]+$/i.test(pathname);
}
