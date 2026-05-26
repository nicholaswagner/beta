import { loader } from "fumadocs-core/source";

import { docs } from "../../.source/server";

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
});

export type Source = typeof source;
