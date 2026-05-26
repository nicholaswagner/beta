import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  data,
  type ClientLoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { LandingShell } from "~/layouts/LandingShell";
import { mdxComponents } from "~/lib/mdxComponents";
import { source } from "~/lib/source";

export async function clientLoader(_args: ClientLoaderFunctionArgs) {
  const page = source.getPage([]);
  if (!page) {
    throw data({ message: "No index page found" }, { status: 404 });
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

export default function Page() {
  const { title, Body, toc } = useLoaderData<typeof clientLoader>();
  return (
    // <LandingShell pageTree={source.pageTree} toc={toc} title={title}>
    <LandingShell>
      <Body components={mdxComponents} />
    </LandingShell>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <LandingShell pageTree={source.pageTree} toc={[]} title="Error">
      <pre>
        {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : String(error)}
      </pre>
    </LandingShell>
  );
}
