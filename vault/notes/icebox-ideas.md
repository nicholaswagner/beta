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

## Real Orama search index

**What:** Replace the placeholder `public/search-index.json` written by
`scripts/build-search-index.ts` with a real prebuilt Orama index. Add a
search UI component that loads the index lazily and queries it client-side.

**Why later:** No content volume yet to justify the UI work. The placeholder
keeps the build pipeline shape correct so wiring it up later is a few-hours
job instead of a rearchitect.
