import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/Home.tsx"),
  route("notes/*", "routes/NotesPage.tsx"),
  route("*", "routes/Page.tsx"),
] satisfies RouteConfig;
