import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig({
  mdxOptions: {
    // fumadocs-obsidian writes asset files into `public/`, but fumadocs-core's
    // remarkImage defaults to `useImport: true` and tries to ES-import them.
    // Vite warns about importing public/ assets from JS. Disable the import
    // injection — width/height attrs are still computed from disk, and the
    // <img src="/images/foo.png"> output is what we want anyway.
    //
    // See README.md → "Asset caching" for the cost/benefit discussion and
    // ICEBOX.md → "Hashed asset URLs" for the future workshop-mode option.
    remarkImageOptions: {
      useImport: false,
    },
  },
});
