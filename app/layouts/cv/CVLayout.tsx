import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useMemo, type ComponentProps, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from "react";

import { NW } from "~/components/ui/SiteNav/NW";
import { ScrambleText } from "~/components/mdx/ScrambleText/ScrambleText";
import { SiteNav } from "~/components/ui/SiteNav/SiteNav";
import { TerminalSeparator } from "~/components/ui/TerminalSeparator/TerminalSeparator";

import styles from "./CVLayout.module.css";
import { ProfileColumn } from "~/layouts/cv/ProfileColumn";
import { WorkMatter } from "~/layouts/cv/WorkMatter";

export interface CVLink {
  label: string;
  href: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  companyUrl?: string;
  startYear: number | string;
  endYear: number | string;
  location: string;
  Body: (props: { components?: Record<string, unknown> }) => ReactNode;
}

interface CVLayoutProps {
  name: string;
  subtitle: string;
  /** Compiled MDX body for the bio prose. Rendered with `mdxComponents` so
   *  inline tags in vault/cv/index.md (e.g. `<ScrambleText>`) work. */
  Blurb: ExperienceItem["Body"];
  links: CVLink[];
  experience: ExperienceItem[];
  /** MDX components map to pass to each role's compiled body. */
  mdxComponents: Record<string, unknown>;
}

/** Shared bio typography — justified, relaxed line-height. Paired with
 *  `size="2" color="gray"` on the bio's `p`/`ScrambleText` map entries. */
// const BIO_TEXT_STYLE: CSSProperties = { lineHeight: 1.5, textAlign: "justify" };

export function CVLayout({ Blurb, links, experience, mdxComponents }: CVLayoutProps) {
  // Components for the bio body. Spread the shared MDX map (so inline tags like
  // `<ScrambleText>` resolve), then stamp the bio typography (muted, size-2,
  // justified) as *defaults* onto the two elements the bio is authored with —
  // whether it wraps the whole paragraph in `<ScrambleText>` or writes plain
  // prose (a `<p>`). Defaults sit before `{...props}` so anything the markdown
  // sets explicitly still wins. Radix `<Text>` controls its own line-height, so
  // setting it on a wrapper wouldn't reach a nested ScrambleText — it has to go
  // on the elements themselves.
  const blurbComponents = useMemo(
    () => ({
      ...mdxComponents,
      // `mb="0"` because the wrapping Flex owns the spacing below the bio.
      // Drop the native `color` attr (typed `string`) so it doesn't clash with
      // Radix `Text`'s accent-color enum when spread.
      // p: ({ color: _color, ...props }: ComponentPropsWithoutRef<"p">) => (
      //   <Text as="p" size="2" color="gray" mb="0" style={BIO_TEXT_STYLE} {...props} />
      // ),
      // ScrambleText: ({ style, ...rest }: ComponentProps<typeof ScrambleText>) => (
      //   <ScrambleText size="2" color="gray" {...rest} style={{ ...BIO_TEXT_STYLE, ...style }} />
      // ),
    }),
    [mdxComponents],
  );

  return (
    <Box className={styles.cvLayout}>
      <SiteNav />

      <Box asChild px={{ initial: "4", sm: "6", lg: "8" }} py={{ initial: "4", md: "6" }}>
        <main>
          <Flex
            direction="row"
            align="start"
            justify="between"
            mb={{ initial: "5", md: "6" }}
            gap="4"
            wrap="wrap"
          >

            {/* Print-only brand mark in the top-right. On screen the
              `ThemeToggle` lives in `SiteNav`; in print `SiteNav` is hidden
              (`notPrintable`) and this NW logo takes the corner. */}
            <Box className={styles.printable} aria-hidden>
              <NW style={{ height: "3.5rem", width: "auto", color: "var(--gray-4)" }} />
            </Box>
          </Flex>

          {/* Print-only header — same bio + links content the screen shows in
            its left column, repositioned below the experience timeline for
            paginated output. Wrapped in `printFooter` for top-margin /
            page-break behavior; `printable` keeps it hidden on screen. */}
          <Box className={`${styles.printable} ${styles.printFooter}`}>

            <Heading as="h2" size="3" weight="bold" >
              <ScrambleText size="2">About</ScrambleText>
            </Heading>

            <TerminalSeparator mt="4" mb="6" className={styles.noBreakAfter} />


            <ProfileColumn Blurb={Blurb} blurbComponents={blurbComponents} links={links} compact />
          </Box>

          <Flex
            className={styles.cvLayoutRow}
            direction={{ initial: "column", sm: "row" }}
            gap={{ initial: "5", sm: "7", lg: "8" }}
            align="start"
          >
            {/* Left column — bio + contact links. Hidden in print via
              `notPrintable`; a duplicate copy is emitted as a footer below
              the experience section so the printed CV still has the bio + the
              contact rail, just paginated naturally after the timeline. */}
            <Box
              className={`${styles.leftCol} ${styles.notPrintable}`}
              flexShrink="0"
              width={{ initial: "100%", sm: "280px", md: "340px", lg: "400px" }}
              /* On mobile the columns stack, so add breathing room between the last
                 contact link and the Experience header. No effect once side-by-side. */
              mb={{ initial: "6", sm: "0" }}
            >
              <ProfileColumn Blurb={Blurb} blurbComponents={blurbComponents} links={links} />
            </Box>

            {/* Right column — experience. In print the left column above is
              hidden so this stretches to 100% (see CVLayout.module.css
              @media print rules). */}
            <Box className={styles.rightCol} flexGrow="1" style={{ minWidth: 0 }}>
              <Heading as="h2" size="3" weight="bold">
                <ScrambleText size="3">Experience</ScrambleText>
              </Heading>

              <TerminalSeparator mt="4" mb="6" className={styles.noBreakAfter} />

              <Flex direction="column">
                {experience.map((item, idx) => (
                  <Box key={`${item.company}-${item.startYear}`}>
                    {idx > 0 && <TerminalSeparator mt="4" mb="6" className={styles.noBreakAfter} />}
                    <ExperienceBlock item={item} mdxComponents={mdxComponents} />
                  </Box>
                ))}
              </Flex>
            </Box>
          </Flex>

        </main>
      </Box>
    </Box >
  );
}


function ExperienceBlock({
  item,
  mdxComponents,
}: {
  item: ExperienceItem;
  mdxComponents: Record<string, unknown>;
}) {
  const { role, company, companyUrl, startYear, endYear, location, Body } = item;
  return (
    <Box className={styles.experienceBlock}>
      <Flex
        className={styles.roleInner}
        direction={{ initial: "column", lg: "row" }}
        align="start"
        gap={{ initial: "2", lg: "6" }}
      >
        <Box width={{ initial: "100%", lg: "30%" }}>
          <WorkMatter {...{ company, companyUrl, role, startYear, endYear, location }} />
        </Box>

        <Box
          className={styles.experienceList}
          width={{ initial: "100%", lg: "70%" }}
          mt={{ initial: "4", lg: "0" }}
          style={{ minWidth: 0 }}
        >
          <Body components={mdxComponents} />
        </Box>
      </Flex>
    </Box>
  );
}
