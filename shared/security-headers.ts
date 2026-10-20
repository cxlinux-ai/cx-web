/**
 * Security headers for every response the Pages middleware returns.
 *
 * `client/public/_headers` sets the same values for static assets, but responses built inside a
 * Pages Function (the SPA shell, the branded 404, redirects) do not reliably inherit them, so the
 * middleware applies them too. Existing values are kept; only missing headers are added.
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export function withSecurityHeaders(response: Response): Response {
  const missing = Object.entries(SECURITY_HEADERS).filter(([name]) => !response.headers.has(name));
  if (missing.length === 0) {
    return response;
  }
  const headers = new Headers(response.headers);
  for (const [name, value] of missing) {
    headers.set(name, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
