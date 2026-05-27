import type * as PageTree from "fumadocs-core/page-tree";
import { loader } from "fumadocs-core/source";

import { docs } from "../../.source/server";

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
});

export type Source = typeof source;

export function getNotesTree(): PageTree.Root {
  const notes = findNotesFolder(source.pageTree.children);
  if (!notes) return { name: "Notes", children: [] };
  return { name: "Notes", children: notes.children };
}

function findNotesFolder(nodes: PageTree.Node[]): PageTree.Folder | undefined {
  for (const n of nodes) {
    if (n.type === "folder" && folderMatchesPrefix(n, "/notes")) return n;
    if (n.type === "folder") {
      const found = findNotesFolder(n.children);
      if (found) return found;
    }
  }
  return undefined;
}

function folderMatchesPrefix(folder: PageTree.Folder, prefix: string): boolean {
  if (folder.index?.url?.startsWith(prefix)) return true;
  return firstUrlIn(folder.children)?.startsWith(prefix) ?? false;
}

function firstUrlIn(nodes: PageTree.Node[]): string | undefined {
  for (const n of nodes) {
    if (n.type === "page") return n.url;
    if (n.type === "folder") {
      const u = n.index?.url ?? firstUrlIn(n.children);
      if (u) return u;
    }
  }
  return undefined;
}
