import type { Config } from "@react-router/dev/config";

/**
 * SPA mode for GitHub Pages.
 *
 * `ssr: false` + Vite alias `node:path` → `path-browserify` (see vite.config.ts)
 * lets `fumadocs-mdx/runtime/server` run in the browser. fumadocs-mdx's Vite
 * plugin doesn't currently survive react-router's SSR pre-render pipeline, so
 * we go pure SPA and rely on a 404→index.html copy as the deep-link fallback
 * (configured in the build script + deploy workflow).
 *
 * Trade-off: crawlers see the SPA shell for every URL until JS runs. Refresh
 * and deep-links work for real users.
 *
 * `basename` must start with Vite's `base` (RR enforces this in dev). Both
 * keep the trailing slash.
 */
export default {
  ssr: false,
  basename: "/beta/",
} satisfies Config;
