import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import {
  transformerNotationErrorLevel,
  transformerMetaHighlight,
} from '@shikijs/transformers';
import type { ShikiTransformer } from 'shiki';

/**
 * Lift `data-no-copy` / `data-no-header` fence-meta flags onto the rendered
 * `<pre>` element. The defaults' `parseMetaString` parks the rest of the meta
 * string (after `title=`, `tab=`, etc.) into `meta.__raw`, which is what we
 * read here.
 *
 * `buildPre` (app/lib/mdxCodeBuilders.tsx) consumes the resulting props to
 * suppress the title bar / copy button on a per-block basis.
 */
function transformerLiftFumaFlags(): ShikiTransformer {
  return {
    name: 'fuma-lift-flags',
    pre(node) {
      const raw = String(this.options.meta?.__raw ?? '');
      if (/(?:^|\s)data-no-copy(?:\s|$)/.test(raw)) {
        node.properties['data-no-copy'] = true;
      }
      if (/(?:^|\s)data-no-header(?:\s|$)/.test(raw)) {
        node.properties['data-no-header'] = true;
      }
    },
  };
}

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
    // Spread the upstream defaults so we inherit themes, `parseMetaString`
    // (which already understands `title=`, `tab=`, line numbers), and the
    // default transformer set (Highlight, WordHighlight, Diff, Focus are in
    // there — don't double-add them).
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      addLanguageClass: true,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerNotationErrorLevel(), // `// [!code error]` / `// [!code warning]`
        transformerMetaHighlight(),      // fence meta `{1,3-5}`
        transformerLiftFumaFlags(),      // reads `data-no-copy` / `data-no-header`
      ],
    },
  },
});
