# ICEBOX

Not-yet-built things that have been thought through enough to act on later.
Each item has a "why later" so we remember the constraint that put it on ice.

## Hashed asset URLs (cache-busting)

**What:** Make image (and other static asset) URLs content-fingerprinted, so
each unique version of a file lives at a unique URL like
`/_assets/me-a8f3.png`. This is what lets a server send
`Cache-Control: max-age=31536000, immutable` safely — the browser caches the
file effectively forever, and any change ships as a new URL.

**Why later:** Two prerequisites — neither is in place today.

1. **Asset output dir.** `fumadocs-obsidian` currently writes assets into
   `public/`, which Vite serves as-is (no hashing). To get hashed filenames,
   the assets need to land somewhere Vite's bundler can process them
   (e.g. `app/_assets/` or a sibling of `content/`). Then flip
   `remarkImageOptions.useImport` back to `true` in `source.config.ts` so
   `remarkImage` emits ES imports — those imports flow through Vite's asset
   pipeline and come out hashed.

   Check whether `fumadocs-obsidian`'s `out.publicDir` / `out.contentDir`
   options support landing assets outside `public/`; if not, a small
   post-processing step in `scripts/generate.ts` can move them.

2. **Per-path response headers.** Hashed URLs only pay off when the server
   can send `Cache-Control: immutable` for the hashed-asset prefix. GitHub
   Pages does not allow custom headers. So this matters only if:
   - The site moves behind a CDN (Cloudflare in front of GH Pages — free
     tier — would do it; the page rule lives in Cloudflare, not GH Pages).
   - The site migrates off GH Pages (Cloudflare Pages, Vercel, Netlify all
     support per-path cache headers natively).

**Effort estimate:** ~1 hour for the asset-dir change + remarkImage flip,
once the hosting situation supports custom headers. Cloudflare-in-front
setup is another ~30 min (DNS change + page rule).

**Concrete next steps if/when we do this:**

1. Decide where assets live (suggest: `app/_assets/`).
2. Update `scripts/generate.ts` to point `fumadocs-obsidian`'s asset output
   there (or post-process to move them).
3. Set `remarkImageOptions: { useImport: true }` in `source.config.ts`.
4. Verify built output: `build/client/assets/me-<hash>.png` should exist
   and the generated `<img src>` should reference the hashed URL.
5. Set `Cache-Control: max-age=31536000, immutable` for `/_assets/*` (or
   wherever Vite emits hashed files) at the CDN/host layer.

## Vault watcher (auto re-run `generate` on file change)

**What:** A `chokidar`-based watcher that re-runs `fromVault()` when files
under `vault/` change, so editing in Obsidian shows up in the dev server
without manually running `bun run generate`.

**Why later:** Manual is fine for now (vault edits during development are
infrequent). Wiring this in as a Vite plugin requires care: re-emitting MDX
mid-dev triggers fumadocs-mdx to regenerate `.source/`, which Vite then
HMR-updates. Needs validation that no transient bad states slip through.

## Real Orama search index

**What:** Replace the placeholder `public/search-index.json` written by
`scripts/build-search-index.ts` with a real prebuilt Orama index. Add a
search UI component that loads the index lazily and queries it client-side.

**Why later:** No content volume yet to justify the UI work. The placeholder
keeps the build pipeline shape correct so wiring it up later is a few-hours
job instead of a rearchitect.

## SSG-style HTML prerendering

**What:** Pre-render each route's HTML at build time so the first paint
doesn't require JS execution. Currently SPA mode means every page is the
same `index.html` shell until the bundle hydrates.

**Why later:** `fumadocs-mdx`'s Vite plugin doesn't currently survive
react-router's SSR pre-render pipeline (vite-node's `ssrTransformScript`
doesn't apply the mdx loader during the SSR build, so MDX frontmatter
parses as broken JS). Worth periodically re-testing as both libraries
evolve. If it ever works, flip `ssr: true` + `prerender: <list>` in
`react-router.config.ts` and we get static HTML per route for free, with
real SEO benefits.

## Custom Radix Themes for Obsidian-flavored callouts

**What:** Map Obsidian's callout syntax (`> [!note]`, `> [!warning]`, etc.)
to Radix `<Callout.Root>` variants in `mdx-components.tsx`. Currently the
`Callout` slot exists but Obsidian-generated MDX may not be using it.

**Why later:** Need to verify what `fumadocs-obsidian` actually emits for
callout syntax. If it emits `<Callout type="...">` JSX, we're already wired.
If it emits raw blockquotes with `[!note]` text inside, we need a remark
plugin to lift those into `<Callout>` JSX nodes first.

## Theme persistence consistency

**What:** `ThemeContext` writes to `localStorage` but also picks a random
`accentColor` on every render. The accent flickers when the theme changes.
Either pin the accent, persist it alongside appearance, or build a small UI
to let the user pick.

**Why later:** The randomization may be intentional for the personal site
vibe. Worth asking before "fixing."
