import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { Code } from '@radix-ui/themes';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';

/**
 * MDX `code` mapping.
 *
 * Inline (single-backtick) code → Radix `<Code variant="ghost">`.
 * Block (fenced) code → plain `<code>` so the surrounding `<CodeBlock>` /
 * `<Pre>` from fumadocs-ui owns the visual.
 *
 * The discriminator is the `language-xxx` class — rehypeCode emits it when
 * `addLanguageClass: true` is set in `source.config.ts`. Inline code never
 * gets that class.
 */
export function buildCode(p: React.ComponentProps<'code'>) {
  const isBlock = typeof p.className === 'string' && /(?:^|\s)language-/.test(p.className);
  if (isBlock) return <code {...p} />;
  return <Code variant="ghost" {...p} />;
}

/**
 * MDX `pre` mapping.
 *
 * Swaps the plain `<pre>` for fumadocs-ui's `<CodeBlock>` + `<Pre>` so we get
 * the copy button, scroll viewport, and (if a language is detected) the
 * title bar with the language label.
 *
 * Language extraction reads the `language-xxx` class off the child `<code>`
 * element — produced by rehypeCode with `addLanguageClass: true`.
 *
 * If the fence has an explicit `title="..."` in the meta, fumadocs-mdx
 * forwards it as a `title` prop on the `<pre>` and we honor it over the
 * extracted language.
 */
export function buildPre(p: React.ComponentProps<'pre'> & { title?: string }) {
  const { title, children, ...rest } = p;
  const detectedLang = extractCodeLanguage(children);
  const headerTitle = title ?? detectedLang;

  return (
    <CodeBlock {...rest} title={headerTitle}>
      <Pre>{children}</Pre>
    </CodeBlock>
  );
}

function extractCodeLanguage(children: ReactNode): string | undefined {
  if (!isValidElement(children)) return undefined;
  const el = children as ReactElement<{ className?: string }>;
  const cls = el.props?.className;
  if (typeof cls !== 'string') return undefined;
  const match = /(?:^|\s)language-([\w-]+)/.exec(cls);
  return match?.[1];
}
