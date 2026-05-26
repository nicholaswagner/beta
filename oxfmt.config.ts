import { defineConfig } from "oxfmt";

export default defineConfig({
  options: {
    typeAware: true,
  },
  sortImports: {
    groups: ["builtin", "external", "internal", "unknown"],
    ignoreCase: true,
    newlinesBetween: true,
    order: "asc",
  },
});
