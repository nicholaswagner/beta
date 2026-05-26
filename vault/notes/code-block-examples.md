---
title: Code block examples
description: Reference for shiki transformer syntax — line highlighting, diffs, focus, errors, word highlighting.
---

# Code block examples

A working reference for every shiki transformer we can wire up. The **fence syntax** snippets below are what you'd type in a vault note; the **live block** under each one is the same source rendered through fumadocs.

## Language label

The title bar of every code block shows the language id from the fence. Override it with `title="..."`.

### Fence syntax

````bash data-no-header data-no-copy
# ```bash data-no-header data-no-copy
bun add lucide-react
````

````bash title="install.sh"
# ```bash title="install.sh"
bun add lucide-react
````

---

## Line highlighting (`transformerMetaHighlight`)

Pick lines or ranges via a `{...}` directive in the fence meta. Comma-separated, ranges with hyphens.

### Fence syntax

````md
```ts {1,3-5}
const a = 1;
const b = 2;
const c = 3;
const d = 4;
const e = 5;
```
````

### Live

```ts {1,3-5}
const a = 1;
const b = 2;
const c = 3;
const d = 4;
const e = 5;
```

---

## Line numbers

Not a transformer — fumadocs's default `parseMetaString` recognizes a `lineNumbers` keyword in the fence meta and turns it into a `data-line-numbers` prop on the rendered `<CodeBlock>`. `lineNumbers=N` starts the count at N.

### Fence syntax

````md
```ts lineNumbers
function add(a: number, b: number) {
  return a + b;
}
```

```ts lineNumbers=42
function startsAtFortyTwo() {
  return "see line numbers on the side";
}
```
````

### Live

```ts lineNumbers
function add(a: number, b: number) {
  return a + b;
}
```

```ts lineNumbers=42
function startsAtFortyTwo() {
  return "see line numbers on the side";
}
```

---

## Diff markers (`transformerNotationDiff`)

Inline `// [!code ++]` and `// [!code --]` comments mark added / removed lines. The comments themselves get stripped from the visible output.

### Fence syntax

````md
```ts
const oldName = "before"; // [!code --]
const newName = "after"; // [!code ++]
const unchanged = 42;
```
````

### Live

```ts
const oldName = "before"; // [!code --]
const newName = "after"; // [!code ++]
const unchanged = 42;
```

---

## Focus (`transformerNotationFocus`)

`// [!code focus]` highlights one line and dims the rest. Useful for drawing attention inside a longer snippet.

### Fence syntax

````md
```ts
function setup() {
  // boilerplate...
  const result = doTheThing(); // [!code focus]
  // more boilerplate...
  return result;
}
```
````

### Live

```ts
function setup() {
  // boilerplate...
  const result = doTheThing(); // [!code focus]
  // more boilerplate...
  return result;
}
```

---

## Error / warning markers (`transformerNotationErrorLevel`)

`// [!code error]` and `// [!code warning]` paint a line with a red / amber emphasis. Good for "here's the line the compiler complains about" examples.

### Fence syntax

````md
```ts
const x: number = "oops"; // [!code error]
const y = unusedVariable; // [!code warning]
const z = 42;
```
````

### Live

```ts
const x: number = "oops"; // [!code error]
const y = unusedVariable; // [!code warning]
const z = 42;
```

---

## Word highlighting (`transformerNotationWordHighlight`)

`// [!code word:NEEDLE]` wraps every occurrence of `NEEDLE` in the block in a highlighted span. The directive comment is stripped.

### Fence syntax

````md
```ts
// [!code word:async]
async function fetchUser(id: string) {
  const res = await fetch(`/users/${id}`);
  return await res.json();
}
```
````

### Live

```ts
// [!code word:async]
async function fetchUser(id: string) {
  const res = await fetch(`/users/${id}`);
  return await res.json();
}
```

---

## Combining transformers in one block

The directives stack — you can highlight a range, mark a diff, and dim focus all at once.

### Fence syntax

````md
```ts {2-3} title="combined.ts"
function before() {
  return 1;
} // [!code --]
function after() {
  return 2;
} // [!code ++]
const main = () => after(); // [!code focus]
```
````

### Live

```ts {2-3} title="combined.ts"
function before() {
  return 1;
} // [!code --]
function after() {
  return 2;
} // [!code ++]
const main = () => after(); // [!code focus]
```

---

## Per-block chrome opt-outs (`data-no-header`, `data-no-copy`)

Two fence-meta flags let you tone down the `<CodeBlock>` chrome for individual blocks. Set them on the fence line.

| Flags                         | Result                                            |
| ----------------------------- | ------------------------------------------------- |
| (none)                        | Full: language label header + copy button         |
| `data-no-copy`                | Language label header, no copy button             |
| `data-no-header`              | No header bar, copy button still floats top-right |
| `data-no-header data-no-copy` | Minimal: just the syntax-highlighted code         |

### Fence syntax

````md
```bash data-no-header data-no-copy
# minimal mode — no chrome at all
echo "hello"
```
````

### Live

```bash data-no-header data-no-copy
# minimal mode — no chrome at all
echo "hello"
```

```bash data-no-copy
# header but no copy button
echo "see, language label still here"
```

```bash data-no-header
# copy button floats; no header
echo "compact mode"
```

---

## How to enable the transformers

```ts title="source.config.ts"
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationErrorLevel,
  transformerNotationWordHighlight,
  transformerMetaHighlight,
} from "@shikijs/transformers";

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      addLanguageClass: true,
      transformers: [
        transformerNotationDiff(),
        transformerNotationFocus(),
        transformerNotationErrorLevel(),
        transformerNotationWordHighlight(),
        transformerMetaHighlight(),
      ],
    },
  },
});
```

Install: `bun add -d @shikijs/transformers`.

After enabling, run `rm -rf .source && bunx fumadocs-mdx` to force a regen (the `source.config.ts` change doesn't always propagate through Vite HMR — same gotcha we hit when adding `addLanguageClass`).
