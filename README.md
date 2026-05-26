# AI Generated Readme.md

A personal site whose content is sourced from an Obsidian vault, rendered by
[Fumadocs Core], shelled in [Radix Themes], served as a static SPA on
[React Router] + [Bun], deployed to GitHub Pages under
`nicholaswagner.dev/beta`.

[Fumadocs Core]: https://www.fumadocs.dev/docs/headless
[Radix Themes]: https://www.radix-ui.com/themes
[React Router]: https://reactrouter.com
[Bun]: https://bun.sh

### Build pipeline

```
bun run build
  ├─ bun scripts/generate.ts            # vault/ → content/*.mdx + public/images/*
  ├─ bun scripts/build-search-index.ts  # placeholder search index
  ├─ react-router build                 # SPA bundle → build/client/
  ├─ cp index.html → 404.html           # GitHub Pages SPA fallback
  └─ touch build/client/.nojekyll
```

## Local development

```bash
bun install
bun run generate        # one-time: vault/ → content/ + public/
bun run dev             # http://localhost:5173/beta/
```

Edit a file in `vault/`, re-run `bun run generate`, and HMR picks up the new
MDX. (There's no watcher for the vault → MDX step yet; see ICEBOX.)

## Deployment

GitHub Pages, via `.github/workflows/deploy.yml`. Push to `main`, the workflow
builds + uploads the artifact + deploys. The custom domain (CNAME at the
user-site level) maps `nicholaswagner.dev` to the Pages site; the `/beta/`
subpath is set by Vite `base` + React Router `basename`.

## Notable design decisions

### SPA mode (no SSR)

`react-router.config.ts` sets `ssr: false`. Trade-offs explained inline in
that file. Short version: `fumadocs-mdx/runtime/server` imports `node:path`,
which we shim with `path-browserify` (see [vite.config.ts](vite.config.ts))
so the loader works client-side. Without this shim the client bundle throws
`path.join is not a function` at runtime.

GitHub Pages serves `404.html` for any path not on disk; we copy `index.html`
→ `404.html` so the SPA boots for deep links.

### Project rules exceptions

Per project rules we use `@radix-ui/themes` for everything _except_ the TOC,
where the styled fumadocs-ui component (`fumadocs-ui/components/toc/default`)
is allowed for its scroll-tracking thumb. See
[app/components/TOC.tsx](app/components/TOC.tsx). To swap to the variant with
the SVG indicator that follows the active anchor, change the import to
`.../toc/clerk` and pass `thumbBox` to `<TOCItems>`.

We may also violate this rule for other components in the future, but those
will be evaluated on a case by case basis.

### Hash-link scroll handling

React Router intercepts in-page `<a href="#...">` clicks and updates the URL
via `history.pushState`, which bypasses the browser's native fragment scroll.
[`useHashScroll`](app/layouts/DocsShell.tsx) watches `useLocation().hash` and
calls `scrollIntoView` explicitly.

### Stable MDX components

`mdxComponents` is a module-level constant in
[app/lib/mdx-components.tsx](app/lib/mdx-components.tsx) — _not_ a function
called per render. Earlier we had `getMDXComponents()` called inside each
route component, which returned a fresh object every render. That caused
`<Body>` (the compiled MDX module) to re-render on hash changes, replacing
heading DOM nodes, which detached the TOC IntersectionObserver from them and
froze the active-anchor highlighting after one click.

## Asset caching (and why images live in `public/`)

Short version: images from the vault are written by `fumadocs-obsidian` into
`public/images/`. They're referenced by stable, unhashed URLs like
`/images/me.png`. Browser caching is handled by GitHub Pages' default
`Cache-Control: max-age=600` plus `ETag`-based revalidation. Returning visits
within 10 minutes use the disk cache with zero network; after that the
browser sends a conditional request and gets a 304 with no image bytes if
unchanged.

**This is about as good as caching gets on GitHub Pages.** GH Pages doesn't
let you customize response headers, so you can't reach the "cached forever"
tier (`Cache-Control: max-age=31536000, immutable`) that production sites
get via content-hashed filenames behind a CDN.

`source.config.ts` sets `remarkImageOptions.useImport: false` to suppress
Vite's "Assets in public directory cannot be imported from JavaScript"
warning. With `useImport: true` (the fumadocs-core default), `remarkImage`
emits an ES import for each image — but since the file lives in `public/`,
Vite returns the literal URL string anyway. No hashing, no benefit, just a
warning. With `useImport: false`, the MDX output is plain
`<img src="/images/me.png" width="..." height="..." />` and Vite is happy.

If long-cache headers ever become important (e.g. we move behind a CDN, or
host elsewhere), see [ICEBOX.md](ICEBOX.md) → "Hashed asset URLs".
