import { Box, Flex, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { useMemo, type ReactNode } from "react";

import { ScrambleText } from "~/components/ui/ScrambleText";
import { SiteNav } from "~/components/ui/SiteNav";

import styles from "./CVShell.module.css";

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

interface CVShellProps {
  name: string;
  subtitle: string;
  blurb: string;
  links: CVLink[];
  experience: ExperienceItem[];
  /** MDX components map to pass to each role's compiled body. */
  mdxComponents: Record<string, unknown>;
}

export function CVShell({ name, subtitle, blurb, links, experience, mdxComponents }: CVShellProps) {
  /**
   * Strip the inline `<Text size="3" listStyleType: disc>` wrapping from
   * the global `ul`/`li`/`p` mappings so the `.experienceList` module CSS
   * (smaller font, gray "·" markers) can apply. Memoized so `<Body>` doesn't
   * remount per render — same rule as `mdxComponents` itself.
   */
  const cvMdx = useMemo<Record<string, unknown>>(
    () => ({
      ...mdxComponents,
      ul: (p: Record<string, unknown>) => <ul {...p} />,
      ol: (p: Record<string, unknown>) => <ol {...p} />,
      li: (p: Record<string, unknown>) => <li {...p} />,
      p: (p: Record<string, unknown>) => <p {...p} />,
    }),
    [mdxComponents],
  );

  return (
    <Box className={styles.cvShell}>
      <Box className={styles.notPrintable}>
        <SiteNav />
      </Box>

      <Box px={{ initial: "4", sm: "6", lg: "8" }} py={{ initial: "4", md: "6" }}>
        <Flex
          direction="row"
          align="start"
          justify="between"
          mb={{ initial: "5", md: "6" }}
          gap="4"
          wrap="wrap"
        >
          <Flex direction="column" gap="1">
            <Heading as="h1" size={{ initial: "6", sm: "7" }} weight="bold">
              {name}
            </Heading>
            <ScrambleText size="3" weight="bold">
              {subtitle}
            </ScrambleText>
          </Flex>
        </Flex>

        <Flex
          direction={{ initial: "column", sm: "row" }}
          gap={{ initial: "5", sm: "7", lg: "8" }}
          align="start"
        >
          {/* Left column — bio + contact links */}
          <Box
            flexShrink="0"
            width={{ initial: "100%", sm: "280px", md: "340px", lg: "400px" }}
          >
            <Text as="p" size="4" color="gray" style={{ lineHeight: 1.5 }}>
              {blurb}
            </Text>

            <Separator size="4" mt="4" mb="6" className={styles.experienceSeparator} />

            <Flex direction="column" asChild>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {links.map((link, idx) => (
                  <li key={link.href + link.label}>
                    {idx > 0 && (
                      <Separator size="4" my="3" className={styles.experienceSeparator} />
                    )}
                    <Link
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                      size="2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Flex>
          </Box>

          {/* Right column — experience */}
          <Box flexGrow="1" style={{ minWidth: 0 }}>
            <Heading as="h2" size="3" weight="bold" color="gray">
              Experience
            </Heading>

            <Separator size="4" mt="4" mb="6" className={styles.experienceSeparator} />

            <Flex direction="column">
              {experience.map((item, idx) => (
                <Box key={`${item.company}-${item.startYear}`}>
                  {idx > 0 && (
                    <Separator size="4" my="6" className={styles.experienceSeparator} />
                  )}
                  <ExperienceBlock item={item} mdxComponents={cvMdx} />
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>

        {/* Print-only footer slot — empty for now, wired for later. */}
        <Box className={styles.printable} mt="6">
          <Text size="1" color="gray">
            nicholaswagner.dev/beta/cv
          </Text>
        </Box>
      </Box>
    </Box>
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
        direction={{ initial: "column", lg: "row" }}
        align="start"
        gap={{ initial: "2", lg: "6" }}
      >
        <Box flexShrink="0" width={{ initial: "auto", lg: "200px" }}>
          <ScrambleText size="3" weight="bold">
            {role}
          </ScrambleText>
          <Box mt="2">
            {companyUrl ? (
              <Link href={companyUrl} target="_blank" rel="noreferrer" size="2">
                {company}
              </Link>
            ) : (
              <Text size="2">{company}</Text>
            )}
          </Box>
          <Text as="p" size="2" color="gray" mt="1">
            {startYear}-{endYear}
          </Text>
          <Text as="p" size="2" color="gray">
            {location}
          </Text>
        </Box>

        <Box flexGrow="1" className={styles.experienceList} style={{ minWidth: 0 }}>
          <Body components={mdxComponents} />
        </Box>
      </Flex>
    </Box>
  );
}
