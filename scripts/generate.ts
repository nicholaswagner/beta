import { fromVault } from "fumadocs-obsidian";

import { synthesizeFolderIndexes } from "./synthesizeFolderIndexes";

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

console.log("Generated MDX from vault...");
