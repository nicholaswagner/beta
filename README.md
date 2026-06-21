# readme.md

A personal site whose content is sourced from an Obsidian vault, rendered by
[Fumadocs Core], wrapped in [Radix Themes], served as a static SPA on
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

## Deployment Notes

GitHub Pages, via `.github/workflows/deploy.yml`. Push to `main`, the workflow
builds + uploads the artifact + deploys. The custom domain (CNAME at the
user-site level) maps `nicholaswagner.dev` to the Pages site; the `/beta/`
subpath is set by Vite `base` + React Router `basename`.
