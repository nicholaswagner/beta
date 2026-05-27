import type * as PageTree from "fumadocs-core/page-tree";
import { loader } from "fumadocs-core/source";

import { docs } from "../../.source/server";

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
});

export type Source = typeof source;

export function getNotesTree(): PageTree.Root {
  const notes = findFolderByPrefix(source.pageTree.children, "/notes");
  if (!notes) return { name: "Notes", children: [] };
  return { name: "Notes", children: notes.children };
}

/**
 * Resolve every leaf MDX page under `/cv/experience`, excluding the synthesized
 * `index.mdx` (which the post-process step in `scripts/synthesizeFolderIndexes.ts`
 * stamps with `generated: true`). Sorted by frontmatter `order` ascending (so
 * order=1 is the most recent role), then by `endYear` descending, then
 * `startYear` descending.
 */
export function getExperiencePages() {
  const all = source.getPages();
  const entries = all
    .filter((p) => p.url.startsWith("/cv/experience/"))
    .filter((p) => (p.data as { generated?: boolean }).generated !== true);

  return entries.sort((a, b) => {
    const ad = a.data as ExperienceData;
    const bd = b.data as ExperienceData;
    if (ad.order != null && bd.order != null) return ad.order - bd.order;
    const aEnd = yearOf(ad.endYear);
    const bEnd = yearOf(bd.endYear);
    if (aEnd !== bEnd) return bEnd - aEnd;
    return yearOf(bd.startYear) - yearOf(ad.startYear);
  });
}

interface ExperienceData {
  role?: string;
  company?: string;
  companyUrl?: string;
  startYear?: number | string;
  endYear?: number | string;
  location?: string;
  order?: number;
}

/** Coerce `endYear: present` (or any non-numeric) to a future-year sentinel so it sorts to the top. */
function yearOf(v: number | string | undefined): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    if (v.toLowerCase() === "present") return 9999;
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function findFolderByPrefix(nodes: PageTree.Node[], prefix: string): PageTree.Folder | undefined {
  for (const n of nodes) {
    if (n.type === "folder" && folderMatchesPrefix(n, prefix)) return n;
    if (n.type === "folder") {
      const found = findFolderByPrefix(n.children, prefix);
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
