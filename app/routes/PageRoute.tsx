import {
  data,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  type ClientLoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { DocsLayout } from "~/layouts/DocsLayout";
import { mdxComponents } from "~/lib/mdxComponents";
import { getNotesTree, source } from "~/lib/source";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const splat = params["*"] ?? "";
  const slugs = splat.split("/").filter(Boolean);
  const page = source.getPage(slugs);
  if (!page) {
    throw data({ message: `No page at /${splat}` }, { status: 404 });
  }
  return {
    title: page.data.title,
    description: page.data.description ?? null,
    toc: page.data.toc,
    Body: page.data.body,
    url: page.url,
  };
}

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  if (!data) return [{ title: "Not found" }];
  return [
    { title: data.title },
    ...(data.description ? [{ name: "description", content: data.description }] : []),
  ];
};

export default function PageRoute() {
  const { title, Body, toc } = useLoaderData<typeof clientLoader>();
  return (
    <DocsLayout pageTree={getNotesTree()} toc={toc} title={title}>
      <Body components={mdxComponents} />
    </DocsLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <DocsLayout pageTree={getNotesTree()} toc={[]} title="Not found">
        <p>This page does not exist.</p>
      </DocsLayout>
    );
  }
  throw error;
}
