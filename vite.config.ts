import { reactRouter } from "@react-router/dev/vite";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

export default defineConfig(async () => ({
  base: "/beta/",
  plugins: [await mdx(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // fumadocs-mdx/runtime/server imports `node:path` (only uses `.join`).
      // In SPA mode this module is bundled into the client; we shim it so
      // `path.join` exists at browser runtime.
      "node:path": "path-browserify",
    },
  },
}));
