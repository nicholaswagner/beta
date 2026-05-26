import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationErrorLevel,
  transformerNotationWordHighlight,
  transformerMetaHighlight,
} from '@shikijs/transformers';

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
    // Shiki strips the original `language-xxx` class off the inner <code>
    // element by default. Put it back so our `pre` MDX mapping can read the
    // language and pass it to fumadocs-ui <CodeBlock>'s title bar.
    rehypeCodeOptions: {
      addLanguageClass: true,
      // Transformers add data-attrs to nodes based on inline directives in
      // the source. fumadocs-ui's `style.css` already styles every one of
      // these out of the box (`data-highlighted`, `data-added`,
      // `data-removed`, `data-highlighted-error`, etc.). See
      // `vault/notes/code-block-examples.md` for the syntax cheat sheet.
      transformers: [
        transformerNotationDiff(),       // `// [!code ++]` and `// [!code --]`
        transformerNotationFocus(),      // `// [!code focus]`
        transformerNotationErrorLevel(), // `// [!code error]` / `// [!code warning]`
        transformerNotationWordHighlight(), // `// [!code word:NEEDLE]`
        transformerMetaHighlight(),      // fence meta `{1,3-5}`
      ],
    },
  },
});
