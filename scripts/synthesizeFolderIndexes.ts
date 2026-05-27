/**
 * Folder-index synthesis.
 *
 * After `fromVault()` writes `content/`, this walks the tree and generates an
 * `index.mdx` for every folder that:
 *   - contains at least one `.mdx` file, AND
 *   - does NOT already have an `index.mdx`.
 *
 * Hand-authored indexes always win — if you create `vault/notes/foo/index.md`,
 * `fromVault` writes `content/notes/foo/index.mdx` first and this step skips
 * that folder entirely.
 *
 * Synthesized files get `generated: true` in their frontmatter so they're easy
 * to identify (filter in queries, exclude from search, etc.).
 *
 * The template is a plain-markdown bullet list of child pages. Each link uses
 * the child's frontmatter `title` (or a humanized fallback from the filename);
 * each child's frontmatter `description` becomes the dash-separated tail of
 * the bullet, when present.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep, basename } from "node:path";

interface SynthOptions {
  root: string;
}

interface ChildPage {
  /** Filename without extension — used to build the relative link. */
  slug: string;
  /** Title from frontmatter, or a humanized fallback derived from the slug. */
  title: string;
  /** Optional description from frontmatter (one-line). */
  description?: string;
}

export async function synthesizeFolderIndexes({ root }: SynthOptions) {
  const created: string[] = [];
  await walk(root, root, created);
  if (created.length > 0) {
    console.log(`[synth] Generated ${created.length} folder index(es):`);
    for (const c of created) console.log(`  - ${c}`);
  } else {
    console.log("[synth] No folder indexes needed — every folder has one.");
  }
}

async function walk(absDir: string, root: string, created: string[]) {
  const entries = await readdir(absDir, { withFileTypes: true });

  // Recurse first (post-order). Nested folders get their indexes before their
  // parents, which keeps output predictable when iterating later.
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await walk(join(absDir, entry.name), root, created);
    }
  }

  const mdxFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
    .map((e) => e.name);

  if (mdxFiles.length === 0) return; // Empty folder — nothing to index.
  if (mdxFiles.includes("index.mdx")) return; // Hand-authored wins.

  const children = await collectChildren(absDir, mdxFiles);
  const body = renderBulletTemplate(basename(absDir), children);
  const outPath = join(absDir, "index.mdx");
  await writeFile(outPath, body, "utf8");
  created.push(relative(root, outPath).split(sep).join("/"));
}

async function collectChildren(absDir: string, mdxFiles: string[]): Promise<ChildPage[]> {
  const sorted = [...mdxFiles].sort();
  const pages: ChildPage[] = [];
  for (const file of sorted) {
    const fm = await readFrontmatter(join(absDir, file));
    const slug = file.replace(/\.mdx$/, "");
    pages.push({
      slug,
      title: fm.title ?? humanize(slug),
      description: fm.description,
    });
  }
  return pages;
}

function renderBulletTemplate(folderName: string, children: ChildPage[]): string {
  const title = humanize(folderName);
  const lines = children.map((c) => {
    const link = `[**${c.title}**](./${c.slug})`;
    return c.description ? `- ${link} — ${c.description}` : `- ${link}`;
  });
  return frontmatter(title) + `## Pages in this section\n\n${lines.join("\n")}\n`;
}

function frontmatter(title: string): string {
  return `---\ntitle: ${yamlEscape(title)}\ngenerated: true\n---\n\n`;
}

function humanize(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    // Split CamelCase: "CaritasZespire" → "Caritas Zespire", "API" left alone.
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function yamlEscape(s: string): string {
  // Quote if contains characters YAML would interpret (`:`, `#`, `&`, etc.).
  return /[:#&*!|>%@`]/.test(s) ? JSON.stringify(s) : s;
}

/**
 * Tiny YAML frontmatter reader. Only handles `key: value` lines for the keys
 * we care about (`title`, `description`), plus YAML block scalars (`>`, `|`
 * with optional `+`/`-` chomping indicators). Avoids adding gray-matter as a
 * dep for two string fields.
 */
async function readFrontmatter(absPath: string): Promise<{ title?: string; description?: string }> {
  const raw = await readFile(absPath, "utf8");
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = raw.slice(3, end);
  const out: { title?: string; description?: string } = {};
  const lines = block.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = /^(title|description)\s*:\s*(.*)$/.exec(lines[i]);
    if (!m) continue;
    const key = m[1] as "title" | "description";
    let val = m[2].trim();

    // Block scalars: gather indented continuation lines until we hit a
    // less-indented line. `>` folds newlines to spaces, `|` preserves them.
    if (/^[|>][+-]?\s*$/.test(val)) {
      const fold = val.startsWith(">");
      const collected: string[] = [];
      i++;
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i].trim() === "")) {
        collected.push(lines[i].replace(/^ {2}/, ""));
        i++;
      }
      i--; // step back so the outer `for` increment lands on the next key
      val = fold ? collected.join(" ").trim() : collected.join("\n").trim();
    } else if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    out[key] = val;
  }
  return out;
}
