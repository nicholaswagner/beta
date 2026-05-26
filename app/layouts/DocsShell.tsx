import { Box, Container, Em, Flex, Heading, IconButton, ScrollArea } from "@radix-ui/themes";
import type * as PageTree from "fumadocs-core/page-tree";
import type { TOCItemType } from "fumadocs-core/toc";
import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";

import { SiteNav } from "~/components/ui/SiteNav";

import { Sidebar } from "../components/ui/Sidebar/Sidebar";
import { SidebarDrawer } from "../components/ui/Sidebar/SidebarDrawer";
import { DocsTOC } from "../components/TOC";

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
 */
function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [hash]);
}

export function DocsShell({ pageTree, toc, title, children }: DocsShellProps) {
  useHashScroll();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarContent = (
    <>
      <Box px="4" pt="4" pb="2">
        <Heading size="3">nicholaswagner.dev / beta</Heading>
      </Box>
      <Box px="2" pb="4">
        <Sidebar tree={pageTree} collapsible defaultOpenPath={pathname} />
      </Box>
    </>
  );

  return (
    <Flex direction="column" minHeight="100vh">
      <SiteNav />
      <Box
        display={{ initial: "block", lg: "none" }}
        style={{
          position: "fixed",
          top: "0.75rem",
          right: "0.75rem",
          zIndex: 40,
        }}
      >
        <IconButton
          variant="soft"
          color="gray"
          size="2"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </IconButton>
      </Box>
      <Flex direction="row" minHeight="100vh">
        <Box
          asChild
          display={{ initial: "none", lg: "block" }}
          style={{
            width: "280px",
            borderRight: "1px solid var(--gray-5)",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <aside>
            <ScrollArea type="auto" scrollbars="vertical" style={{ height: "100%" }}>
              {sidebarContent}
            </ScrollArea>
          </aside>
        </Box>

        <Box flexGrow="1" px={{ initial: "4", sm: "6" }} py="6" style={{ minWidth: 0 }}>
          <Container size="3">
            <Em>{title}</Em>
            {children}
          </Container>
        </Box>

        <Box
          display={{ initial: "none", md: "block" }}
          style={{
            width: "240px",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
            padding: "1.5rem 1rem",
          }}
        >
          <DocsTOC toc={toc} />
        </Box>
      </Flex>

      <SidebarDrawer open={drawerOpen} onOpenChange={setDrawerOpen} ariaLabel="Site navigation">
        {sidebarContent}
      </SidebarDrawer>
    </Flex>
  );
}
