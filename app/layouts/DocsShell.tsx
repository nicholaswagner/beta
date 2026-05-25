import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { Box, Container, Flex, Heading, ScrollArea, Separator } from '@radix-ui/themes';
import type * as PageTree from 'fumadocs-core/page-tree';
import type { TOCItemType } from 'fumadocs-core/toc';
import { Sidebar } from '../components/Sidebar';
import { DocsTOC } from '../components/TOC';
import { SiteNav } from '~/components/ui/site-nav';

interface DocsShellProps {
  pageTree: PageTree.Root;
  toc: TOCItemType[];
  title: string;
  children: ReactNode;
}

/**
 * React Router intercepts in-page anchor clicks and updates the URL via
 * `history.pushState`, which does not trigger the browser's native fragment
 * scroll. Watch `location.hash` and explicitly `scrollIntoView` the target.
 *
 * Runs on mount (for deep links like `/notes/hello#parlor`) and on every hash
 * change. `requestAnimationFrame` defers to after the DOM commits so the
 * target element exists when we look it up.
 */
function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);
}

export function DocsShell({ pageTree, toc, title, children }: DocsShellProps) {
  useHashScroll();
  return (
    <Flex direction="column" minHeight="100vh">
    <SiteNav />
    <Flex direction="row" minHeight="100vh">
      <Box
        asChild
        style={{
          width: '280px',
          borderRight: '1px solid var(--gray-5)',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <aside>
          <ScrollArea type="auto" scrollbars="vertical" style={{ height: '100%' }}>
            <Box p="4">
              <Heading size="3" mb="3">
                nicholaswagner.dev / beta
              </Heading>
              <Separator size="4" my="3" />
              <Sidebar tree={pageTree} />
            </Box>
          </ScrollArea>
        </aside>
      </Box>

      <Box flexGrow="1" px="6" py="6" style={{ minWidth: 0 }}>
        <Container size="3">
          <Heading as="h1" size="8" mb="5">
            {title}
          </Heading>
          {children}
        </Container>
      </Box>

      <Box
        style={{
          width: '240px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          padding: '1.5rem 1rem',
        }}
      >
        <DocsTOC toc={toc} />
      </Box>
    </Flex>
    </Flex>
  );
}
