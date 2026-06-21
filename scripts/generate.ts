import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { fromVault } from "fumadocs-obsidian";

import { synthesizeFolderIndexes } from "./synthesizeFolderIndexes";

// `fromVault` only writes/overwrites files — it never deletes. So a file
// removed from the vault would leave an orphaned copy behind. Wipe the
// generated output dirs first so each run is a clean mirror of the vault.
// Keep-files (.gitkeep/.nojekyll) are preserved so the dirs stay tracked.
const KEEP = new Set([".gitkeep", ".nojekyll"]);

async function cleanDir(dir: string) {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return; // dir doesn't exist yet — nothing to clean
  }
  await Promise.all(
    entries
      .filter((name) => !KEEP.has(name))
      .map((name) => rm(join(dir, name), { recursive: true, force: true })),
  );
}

await Promise.all([cleanDir("content"), cleanDir("public")]);

await fromVault({
  dir: "vault",
  out: {
    contentDir: "content",
    publicDir: "public",
  },
});

// Generate landing pages for folders that don't have a hand-authored
// `index.md` in `vault/`. Hand-authored always wins.
await synthesizeFolderIndexes({ root: "content" });

// Surface the repo README as a note. We write into the generated `content`
// dir (not the watched `vault`) so the dev-mode watcher doesn't re-trigger
// generate in a loop. Add the `title` frontmatter that vault notes carry.
const readme = await readFile("README.md", "utf8");
await writeFile(
  join("content", "notes", "readme.mdx"),
  `---\ntitle: readme\n---\n${readme}`,
);

console.log("Generated MDX from vault...");
