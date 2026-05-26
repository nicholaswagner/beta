import * as Accordion from "@radix-ui/react-accordion";
import type * as PageTree from "fumadocs-core/page-tree";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";

import { SidebarTrack } from "~/components/ui/Sidebar/SidebarTrack";
import "~/styles/sidebar.css";

interface SidebarProps {
  tree: PageTree.Root;
  collapsible?: boolean;
  defaultOpenPath?: string;
}

export function Sidebar({ tree, collapsible = false, defaultOpenPath }: SidebarProps) {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const seeded = useMemo(
    () => Array.from(seedOpenFolders(tree.children, defaultOpenPath ?? pathname)),
    [tree, defaultOpenPath, pathname],
  );

  const [openTop, setOpenTop] = useState<string[]>(seeded);

  useEffect(() => {
    setOpenTop((prev) => {
      const next = new Set(prev);
      for (const key of seeded) next.add(key);
      return Array.from(next);
    });
  }, [seeded]);

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>("[aria-current='page']");
    active?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  return (
    <nav ref={navRef} className="sb-nav">
      <SidebarTrack containerRef={navRef} />
      <ul className="sb-list">
        {tree.children.map((node, i) => (
          <li key={i}>
            <TreeNode
              node={node}
              depth={0}
              collapsible={collapsible}
              defaultOpenPath={defaultOpenPath ?? pathname}
              openValues={openTop}
              onOpenChange={setOpenTop}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface NodeProps {
  node: PageTree.Node;
  depth: number;
  collapsible: boolean;
  defaultOpenPath: string;
  openValues: string[];
  onOpenChange: (values: string[]) => void;
}

function TreeNode({ node, depth, collapsible, defaultOpenPath, openValues, onOpenChange }: NodeProps) {
  if (node.type === "separator") {
    return <div className="sb-separator">{flattenName(node.name)}</div>;
  }

  if (node.type === "folder") {
    return (
      <FolderNode
        node={node}
        depth={depth}
        collapsible={collapsible}
        defaultOpenPath={defaultOpenPath}
        openValues={openValues}
        onOpenChange={onOpenChange}
      />
    );
  }

  return <PageRow url={node.url} name={node.name} depth={depth} />;
}

function FolderNode({
  node,
  depth,
  collapsible,
  defaultOpenPath,
  openValues,
  onOpenChange,
}: NodeProps & { node: PageTree.Folder }) {
  const key = folderKey(node);
  const hasChildren = node.children.length > 0;

  if (!collapsible || !hasChildren) {
    return (
      <>
        {node.index ? (
          <PageRow url={node.index.url} name={node.index.name} depth={depth} />
        ) : (
          <div className="sb-row sb-row-label-only" data-depth={depth}>
            <span className="sb-row-label">{flattenName(node.name)}</span>
          </div>
        )}
        {hasChildren && (
          <ChildrenList
            nodes={node.children}
            depth={depth + 1}
            collapsible={collapsible}
            defaultOpenPath={defaultOpenPath}
          />
        )}
      </>
    );
  }

  return (
    <Accordion.Root
      type="multiple"
      value={openValues.includes(key) ? [key] : []}
      onValueChange={(vals) => {
        const isOpen = vals.includes(key);
        const next = new Set(openValues);
        if (isOpen) next.add(key);
        else next.delete(key);
        onOpenChange(Array.from(next));
      }}
    >
      <Accordion.Item value={key}>
        {node.index ? (
          <div className="sb-row" data-depth={depth}>
            <NavLink to={node.index.url} end className="sb-row-link">
              <span className="sb-row-label">{flattenName(node.index.name)}</span>
            </NavLink>
            <Accordion.Header asChild>
              <div>
                <Accordion.Trigger className="sb-chevron-btn" aria-label="Toggle folder">
                  <ChevronIcon />
                </Accordion.Trigger>
              </div>
            </Accordion.Header>
          </div>
        ) : (
          <Accordion.Header asChild>
            <div>
              <Accordion.Trigger className="sb-row" data-depth={depth}>
                <span className="sb-row-label">{flattenName(node.name)}</span>
                <ChevronIcon />
              </Accordion.Trigger>
            </div>
          </Accordion.Header>
        )}
        <Accordion.Content className="sb-acc-content">
          <ChildrenList
            nodes={node.children}
            depth={depth + 1}
            collapsible={collapsible}
            defaultOpenPath={defaultOpenPath}
          />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

function ChildrenList({
  nodes,
  depth,
  collapsible,
  defaultOpenPath,
}: {
  nodes: PageTree.Node[];
  depth: number;
  collapsible: boolean;
  defaultOpenPath: string;
}) {
  const seeded = useMemo(
    () => Array.from(seedOpenFolders(nodes, defaultOpenPath)),
    [nodes, defaultOpenPath],
  );
  const [open, setOpen] = useState<string[]>(seeded);

  useEffect(() => {
    setOpen((prev) => {
      const next = new Set(prev);
      for (const key of seeded) next.add(key);
      return Array.from(next);
    });
  }, [seeded]);

  return (
    <ul className="sb-list">
      {nodes.map((node, i) => (
        <li key={i}>
          <TreeNode
            node={node}
            depth={depth}
            collapsible={collapsible}
            defaultOpenPath={defaultOpenPath}
            openValues={open}
            onOpenChange={setOpen}
          />
        </li>
      ))}
    </ul>
  );
}

function PageRow({
  url,
  name,
  depth,
}: {
  url: string;
  name: PageTree.Node["name"];
  depth: number;
}) {
  return (
    <NavLink to={url} end className="sb-row" data-depth={depth}>
      <span className="sb-row-label">{flattenName(name)}</span>
    </NavLink>
  );
}

function ChevronIcon() {
  return <ChevronRight className="sb-chevron" size={14} />;
}

function folderKey(node: PageTree.Folder): string {
  if (node.index) return node.index.url;
  const first = findFirstUrl(node.children);
  if (first) return `folder:${first}`;
  return `folder:${flattenName(node.name)}`;
}

function findFirstUrl(nodes: PageTree.Node[]): string | undefined {
  for (const n of nodes) {
    if (n.type === "page") return n.url;
    if (n.type === "folder") {
      if (n.index) return n.index.url;
      const nested = findFirstUrl(n.children);
      if (nested) return nested;
    }
  }
  return undefined;
}

function seedOpenFolders(nodes: PageTree.Node[], activePath: string): Set<string> {
  const open = new Set<string>();
  const visit = (ns: PageTree.Node[]): boolean => {
    let containsActive = false;
    for (const n of ns) {
      if (n.type === "page" && n.url === activePath) {
        containsActive = true;
      } else if (n.type === "folder") {
        const childHas = visit(n.children) || n.index?.url === activePath;
        if (childHas) {
          open.add(folderKey(n));
          containsActive = true;
        }
      }
    }
    return containsActive;
  };
  visit(nodes);
  return open;
}

function flattenName(name: PageTree.Node["name"]): string {
  if (typeof name === "string") return name;
  return String(name ?? "");
}
