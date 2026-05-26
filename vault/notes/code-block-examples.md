---
title: Code block examples
description: Reference for shiki transformer syntax — line highlighting, diffs, focus, errors, word highlighting.
---

# Code block examples

A working reference for every shiki transformer we can wire up. The **fence syntax** snippets below are what you'd type in a vault note; the **live block** under each one is the same source rendered through fumadocs.

> [!note] Most transformers aren't enabled yet
> The visual effects (highlighted lines, diff markers, dimmed focus, etc.) only appear once the transformers are added to `rehypeCodeOptions.transformers` in `source.config.ts`. The fence syntax itself is harmless without them — comments just render as plain code comments.

---

## Language label

Already enabled. The title bar of every code block shows the language id from the fence. Override it with `title="..."`.

### Fence syntax

````md
```ts
const greeting: string = 'hello'
```

```bash title="install.sh"
bun add lucide-react
```
````

### Live

```ts
const greeting: string = 'hello'
```

```bash title="install.sh"
bun add lucide-react
```

---

## Line highlighting (`transformerMetaHighlight`)

Pick lines or ranges via a `{...}` directive in the fence meta. Comma-separated, ranges with hyphens.

### Fence syntax

````md
```ts {1,3-5}
const a = 1
const b = 2
const c = 3
const d = 4
const e = 5
```
````

### Live

```ts {1,3-5}
const a = 1
const b = 2
const c = 3
const d = 4
const e = 5
```

---

## Line numbers

Not a transformer — a `<CodeBlock data-line-numbers>` attribute. We can opt in per-fence with a `{data-line-numbers}` meta directive, or flip it on globally in `buildPre` so every block is numbered.

### Fence syntax

````md
```ts {data-line-numbers}
function add(a: number, b: number) {
  return a + b
}
```
````

### Live

```ts
function add(a: number, b: number) {
  return a + b
}
```

(The live block above won't show numbers until we wire `data-line-numbers` through `buildPre`.)

---

## Diff markers (`transformerNotationDiff`)

Inline `// [!code ++]` and `// [!code --]` comments mark added / removed lines. The comments themselves get stripped from the visible output.

### Fence syntax

````md
```ts
const oldName = 'before' // [!code --]
const newName = 'after' // [!code ++]
const unchanged = 42
```
````

### Live

```ts
const oldName = 'before' // [!code --]
const newName = 'after' // [!code ++]
const unchanged = 42
```

---

## Focus (`transformerNotationFocus`)

`// [!code focus]` highlights one line and dims the rest. Useful for drawing attention inside a longer snippet.

### Fence syntax

````md
```ts
function setup() {
  // boilerplate...
  const result = doTheThing() // [!code focus]
  // more boilerplate...
  return result
}
```
````

### Live

```ts
function setup() {
  // boilerplate...
  const result = doTheThing() // [!code focus]
  // more boilerplate...
  return result
}
```

---

## Error / warning markers (`transformerNotationErrorLevel`)

`// [!code error]` and `// [!code warning]` paint a line with a red / amber emphasis. Good for "here's the line the compiler complains about" examples.

### Fence syntax

````md
```ts
const x: number = 'oops' // [!code error]
const y = unusedVariable // [!code warning]
const z = 42
```
````

### Live

```ts
const x: number = 'oops' // [!code error]
const y = unusedVariable // [!code warning]
const z = 42
```

---

## Word highlighting (`transformerNotationWordHighlight`)

`// [!code word:NEEDLE]` wraps every occurrence of `NEEDLE` in the block in a highlighted span. The directive comment is stripped.

### Fence syntax

````md
```ts
// [!code word:async]
async function fetchUser(id: string) {
  const res = await fetch(`/users/${id}`)
  return await res.json()
}
```
````

### Live

```ts
// [!code word:async]
async function fetchUser(id: string) {
  const res = await fetch(`/users/${id}`)
  return await res.json()
}
```

---

## Combining transformers in one block

The directives stack — you can highlight a range, mark a diff, and dim focus all at once.

### Fence syntax

````md
```ts {2-3} title="combined.ts"
function before() { return 1 } // [!code --]
function after() { return 2 }  // [!code ++]
const main = () => after()     // [!code focus]
```
````

### Live

```ts {2-3} title="combined.ts"
function before() { return 1 } // [!code --]
function after() { return 2 }  // [!code ++]
const main = () => after()     // [!code focus]
```

---

## How to enable the transformers

```ts title="source.config.ts"
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationErrorLevel,
  transformerNotationWordHighlight,
  transformerMetaHighlight,
} from '@shikijs/transformers';

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
