import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import {
  transformerNotationErrorLevel,
  transformerMetaHighlight,
} from '@shikijs/transformers';
import type { ShikiTransformer } from 'shiki';

/**
 * Lift our custom fence-meta flags + the upstream `lineNumbers` directive
 * onto the rendered `<pre>` element so they survive shiki's tree rewrite.
 *
 *   - `data-no-copy` / `data-no-header`: parsed from `meta.__raw` (the
 *     remainder after fumadocs's default `parseMetaString` strips `title=`,
 *     `tab=`, etc.).
 *   - `data-line-numbers` / `data-line-numbers-start`: already set into
 *     `meta` by fumadocs's default `parseMetaString` when it sees the
 *     `lineNumbers` keyword. We just copy them onto `pre.properties` because
 *     fumadocs-core doesn't ship a transformer that does it for us.
 *
 * `buildPre` (app/lib/mdxCodeBuilders.tsx) consumes the resulting props.
 */
function transformerLiftFumaFlags(): ShikiTransformer {
  return {
    name: 'fuma-lift-flags',
    pre(node) {
      const meta = this.options.meta ?? {};
      const raw = String(meta.__raw ?? '');

      if (/(?:^|\s)data-no-copy(?:\s|$)/.test(raw)) {
        node.properties['data-no-copy'] = true;
      }
      if (/(?:^|\s)data-no-header(?:\s|$)/.test(raw)) {
        node.properties['data-no-header'] = true;
      }

      if (meta['data-line-numbers']) {
        node.properties['data-line-numbers'] = true;
      }
      if (typeof meta['data-line-numbers-start'] === 'number') {
        node.properties['data-line-numbers-start'] = meta['data-line-numbers-start'];
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
