/**
 * Build a static Orama search index from the compiled MDX collection.
 *
 * Runs after `bun run generate` and `fumadocs-mdx`, before `react-router build`.
 * Reads `.source/server.ts`'s docs collection via Node (eager glob is bundler-
 * dependent, so we read frontmatter + processed markdown directly off disk and
 * feed it to Orama), and emits `public/search-index.json`.
 *
 * The client search UI loads `/beta/search-index.json` at runtime and queries
 * with @orama/orama in-browser — no server endpoint required.
 *
 * NOTE: stub. Wire up when the search UI lands. The shape below mirrors what
 * `fumadocs-core/search/server` ships server-side; we'll re-implement
 * client-side using the same field names so the UI is portable.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

await mkdir('public', { recursive: true });
await writeFile(
  join('public', 'search-index.json'),
  JSON.stringify({
    version: 1,
    note: 'placeholder — see scripts/build-search-index.ts',
    documents: [],
  }),
);

console.log('Wrote placeholder search index to public/search-index.json');
