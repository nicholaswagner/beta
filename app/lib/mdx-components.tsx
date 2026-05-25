import type { ComponentPropsWithoutRef } from 'react';
import {
  Blockquote,
  Callout,
  Code,
  Heading,
  Kbd,
  Link as RLink,
  Separator,
  Table,
  Text,
} from '@radix-ui/themes';
import { Link as RouterLink } from 'react-router';
import type { MDXComponents } from 'mdx/types';
import { ScrambleText } from '~/components/ui/scrambleText';

/**
 * Prefix root-absolute URLs with Vite's `import.meta.env.BASE_URL` so assets
 * served from /public/ (which `fumadocs-obsidian` writes URLs for as
 * `/images/foo.png`) resolve correctly under the `/beta/` basename. Pass-through
 * for external URLs, data URIs, protocol-relative URLs, and anything that's
 * already prefixed.
 */
function withBase(src: string | undefined): string | undefined {
  if (typeof src !== 'string' || src.length === 0) return src;
  if (!src.startsWith('/')) return src; // relative, data:, http(s):, etc.
  if (src.startsWith('//')) return src; // protocol-relative
  const base = import.meta.env.BASE_URL; // '/beta/' in this app
  if (src.startsWith(base)) return src;
  return base.replace(/\/$/, '') + src;
}

function Anchor({ href = '#', children, color, ...rest }: ComponentPropsWithoutRef<'a'>) {
  const isExternal = /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <RLink href={href} target="_blank" rel="noreferrer" {...rest}>
        {children}
      </RLink>
    );
  }
  return (
    <RLink asChild {...rest}>
      <RouterLink to={href}>{children}</RouterLink>
    </RLink>
  );
}

/**
 * Build a fresh MDX components map. Prefer the module-level `mdxComponents`
 * constant for the no-arg case so React can bail out of `<Body>` re-renders
 * (each new object reference triggers a full MDX rerender, replacing heading
 * DOM nodes and detaching the TOC IntersectionObserver from them).
 */
export function getMDXComponents(extra?: MDXComponents): MDXComponents {
  return {
    h1: (p) => <Heading as="h1" size="8" mt="6" mb="3" {...p} />,
    h2: (p) => <Heading as="h2" size="6" mt="6" mb="2" {...p} />,
    h3: (p) => <Heading as="h3" size="5" mt="5" mb="2" {...p} />,
    h4: (p) => <Heading as="h4" size="4" mt="4" mb="2" {...p} />,
    h5: (p) => <Heading as="h5" size="3" mt="4" mb="1" {...p} />,
    h6: (p) => <Heading as="h6" size="2" mt="4" mb="1" {...p} />,
    p: (p) => <Text as="p" size="3" mb="3" {...p} />,
    a: Anchor,
    strong: (p) => <Text weight="bold" {...p} />,
    em: (p) => <Text style={{ fontStyle: 'italic' }} {...p} />,
    code: (p) => <Code variant="soft" {...p} />,
    pre: (p) => (
      <pre
        {...p}
        style={{
          background: 'var(--gray-2)',
          border: '1px solid var(--gray-5)',
          borderRadius: 'var(--radius-3)',
          padding: '1rem',
          overflowX: 'auto',
          margin: '1rem 0',
          ...p.style,
        }}
      />
    ),
    kbd: (p) => <Kbd {...p} />,
    hr: () => <Separator size="4" my="5" />,
    blockquote: (p) => <Blockquote {...p} />,
    ul: (p) => (
      <Text as="div" size="3" mb="3" asChild>
        <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }} {...p} />
      </Text>
    ),
    ol: (p) => (
      <Text as="div" size="3" mb="3" asChild>
        <ol style={{ paddingLeft: '1.5rem', listStyleType: 'decimal' }} {...p} />
      </Text>
    ),
    li: (p) => <li style={{ marginBottom: '0.25rem' }} {...p} />,
    table: (p) => <Table.Root variant="surface" my="4" {...p} />,
    thead: (p) => <Table.Header {...p} />,
    tbody: (p) => <Table.Body {...p} />,
    tr: (p) => <Table.Row {...p} />,
    th: (p) => <Table.ColumnHeaderCell {...p} />,
    td: (p) => <Table.Cell {...p} />,
    img: (p) => (
      <img
        {...p}
        src={withBase(p.src)}
        style={{ maxWidth: '100%', borderRadius: 'var(--radius-3)', ...p.style }}
        alt={p.alt ?? ''}
      />
    ),
    Callout: ({ type, children }: { type?: string; children?: React.ReactNode }) => (
      <Callout.Root color={mapCalloutColor(type)} my="3">
        <Callout.Text>{children}</Callout.Text>
      </Callout.Root>
    ),
    // Custom components reachable from vault `.md` as bare JSX, e.g.
    // `<ScrambleText>headline</ScrambleText>`. PascalCase is required for
    // the MDX parser to treat them as components rather than HTML tags.
    ScrambleText,
    ...extra,
  };
}

function mapCalloutColor(type?: string): React.ComponentProps<typeof Callout.Root>['color'] {
  switch (type?.toLowerCase()) {
    case 'warn':
    case 'warning':
      return 'amber';
    case 'error':
    case 'danger':
      return 'red';
    case 'success':
    case 'tip':
      return 'green';
    case 'info':
    default:
      return 'iris';
  }
}

/** Stable module-level instance — use this for the no-extras case. */
export const mdxComponents: MDXComponents = getMDXComponents();
