import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/HomeRoute.tsx"),
  route("cv", "routes/CVRoute.tsx"),
  route("notes/*", "routes/NotesPageRoute.tsx"),
  route("*", "routes/PageRoute.tsx"),
] satisfies RouteConfig;
