import {
  data,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  type ClientLoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { CVShell, type CVLink, type ExperienceItem } from "~/layouts/CVShell";
import { mdxComponents } from "~/lib/mdxComponents";
import { getExperiencePages, source } from "~/lib/source";

interface CVIndexData {
  name?: string;
  subtitle?: string;
  blurb?: string;
  links?: CVLink[];
}

export async function clientLoader(_args: ClientLoaderFunctionArgs) {
  const indexPage = source.getPage(["cv"]);
  if (!indexPage) {
    throw data({ message: "No /cv index page found" }, { status: 404 });
  }

  const fm = indexPage.data as CVIndexData;
  const experience: ExperienceItem[] = getExperiencePages().map((p) => {
    const d = p.data as unknown as ExperienceItem & { body: ExperienceItem["Body"] };
    return {
      role: d.role,
      company: d.company,
      companyUrl: d.companyUrl,
      startYear: d.startYear,
      endYear: d.endYear,
      location: d.location,
      Body: d.body,
    };
  });

  return {
    name: fm.name ?? "Nicholas Wagner",
    subtitle: fm.subtitle ?? "Software Engineer",
    blurb: fm.blurb ?? "",
    links: fm.links ?? [],
    experience,
  };
}

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  if (!data) return [{ title: "CV" }];
  return [
    { title: `${data.name} — CV` },
    { name: "description", content: data.subtitle },
  ];
};

export default function CV() {
  const { name, subtitle, blurb, links, experience } = useLoaderData<typeof clientLoader>();
  return (
    <CVShell
      name={name}
      subtitle={subtitle}
      blurb={blurb}
      links={links}
      experience={experience}
      mdxComponents={mdxComponents}
    />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error";
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>CV unavailable</h1>
      <p>{message}</p>
    </main>
  );
}
