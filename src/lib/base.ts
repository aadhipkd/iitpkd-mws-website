const base = import.meta.env.BASE_URL.replace(/\/$/, "");

// Prefix internal (site-root-relative) URLs with the deploy base path so the
// site works on GitHub Pages (/iitpkd-mws-website/) and at a domain root.
export function withBase(url: string | undefined | null): string {
  if (!url) return base || "/";
  // External, anchors, special schemes, and protocol-relative URLs pass through.
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//") ||
    url.startsWith("#") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  ) {
    return url;
  }
  if (url.startsWith("/")) return `${base}${url}`;
  return url;
}
