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
  // Strip native `color?: string` from the spread — Radix Code wants a
  // restricted union and we don't use the native one here.
  const { color: _color, ...rest } = p;
  return <Code variant="ghost" {...rest} />;
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
 *
 * Per-block opt-outs (lifted from fence meta in `source.config.ts`):
 *   - `data-no-header` → suppress the title bar (no language label)
 *   - `data-no-copy`   → suppress the copy button
 *
 * Setting both gives the minimal mode: syntax-highlighted code with no chrome.
 */
type PreProps = React.ComponentProps<'pre'> & {
  title?: string;
  'data-no-copy'?: boolean | string;
  'data-no-header'?: boolean | string;
};

export function buildPre(p: PreProps) {
  const {
    title,
    children,
    'data-no-copy': noCopy,
    'data-no-header': noHeader,
    ...rest
  } = p;
  const detectedLang = extractCodeLanguage(children);
  const headerTitle = noHeader ? undefined : (title ?? detectedLang);
  const allowCopy = !noCopy;

  return (
    <CodeBlock {...rest} title={headerTitle} allowCopy={allowCopy}>
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
