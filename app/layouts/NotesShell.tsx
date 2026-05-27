import { Box, Container, Em, Flex, Heading, ScrollArea, Separator } from "@radix-ui/themes";
import type * as PageTree from "fumadocs-core/page-tree";
import type { TOCItemType } from "fumadocs-core/toc";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";

import { SiteNav } from "~/components/ui/SiteNav";

import { Sidebar } from "../components/ui/Sidebar/Sidebar";
import { SidebarDrawer } from "../components/ui/Sidebar/SidebarDrawer";
import { DocsTOC } from "../components/TOC";

interface NotesShellProps {
  pageTree: PageTree.Root;
  toc: TOCItemType[];
  title: string;
  children: ReactNode;
}

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

export function NotesShell({ pageTree, toc, title, children }: NotesShellProps) {
  useHashScroll();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarContent = (
    <>
      <Separator orientation="horizontal" mt="8" mb="8" />
      <Heading size="3" mb="4">
        Notes
      </Heading>
      <Box px="2" pb="4">
        <Sidebar tree={pageTree} collapsible defaultOpenPath={pathname} />
      </Box>
    </>
  );

  return (
    <Container size="4" py="4">
      <Flex direction="column" minHeight="100vh">
        <SiteNav onMenuClick={() => setDrawerOpen(true)} />
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

        <SidebarDrawer open={drawerOpen} onOpenChange={setDrawerOpen} ariaLabel="Notes navigation">
          {sidebarContent}
        </SidebarDrawer>
      </Flex >
    </Container>
  );
}
