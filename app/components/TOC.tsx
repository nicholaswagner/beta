import { TOCProvider, TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc';
import { TOCItems, TOCItem, TOCEmpty } from 'fumadocs-ui/components/toc/default';
import type { TOCItemType } from 'fumadocs-core/toc';

/**
 * The single allowed Fumadocs UI surface in this app: a styled TOC rail with
 * a static vertical bar and an active-item highlight (the "default" variant).
 *
 * Swap the import from `.../toc/default` to `.../toc/clerk` (and pass
 * `thumbBox` to `<TOCItems>`) to get the alternate variant with the SVG
 * scroll-indicator that follows the active anchor.
 *
 * Underlying primitives come from fumadocs-core/toc and Base UI — NOT
 * @radix-ui/themes. Styles ride on `fumadocs-ui/style.css` (imported once in
 * root.tsx); Radix Themes CSS variables harmonize the palette.
 */
export function DocsTOC({ toc }: { toc: TOCItemType[] }) {
  if (toc.length === 0) return null;
  return (
    <TOCProvider toc={toc}>
      <TOCScrollArea>
        <Inner />
      </TOCScrollArea>
    </TOCProvider>
  );
}

function Inner() {
  const items = useTOCItems();
  if (items.length === 0) return <TOCEmpty />;
  return (
    <TOCItems>
      {items.map((item) => (
        <TOCItem key={item.url} item={item} />
      ))}
    </TOCItems>
  );
}
