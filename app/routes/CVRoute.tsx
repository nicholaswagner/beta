import {
  data,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  type ClientLoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { CVLayout, type CVLink, type ExperienceItem } from "~/layouts/cv/CVLayout";
import { mdxComponents } from "~/lib/mdxComponents";
import { getExperiencePages, source } from "~/lib/source";

interface CVIndexData {
  name?: string;
  subtitle?: string;
  links?: CVLink[];
  /** Compiled MDX body of the page (the bio prose), same shape as the
   *  experience pages' `body`. Rendered as a component so inline JSX in the
   *  markdown — e.g. `<ScrambleText>` — resolves to real components. */
  body: ExperienceItem["Body"];
}

export async function clientLoader(_args: ClientLoaderFunctionArgs) {
  const indexPage = source.getPage(["cv"]);
  if (!indexPage) {
    throw data({ message: "No /cv index page found" }, { status: 404 });
  }

  const fm = indexPage.data as unknown as CVIndexData;

  // The bio is the page's markdown body, compiled to a component (not the
  // `getText("processed")` string). Rendering it through `mdxComponents` lets
  // inline tags in vault/cv/index.md — e.g. `<ScrambleText>Nicholas Wagner
  // </ScrambleText>` — render as actual components instead of literal text.
  const Blurb = fm.body;

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
    Blurb,
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

export default function CVRoute() {
  const { name, subtitle, Blurb, links, experience } = useLoaderData<typeof clientLoader>();
  return (
    <CVLayout
      name={name}
      subtitle={subtitle}
      Blurb={Blurb}
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
