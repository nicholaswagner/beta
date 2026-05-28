import { Box, Flex, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { LinkIcon } from "lucide-react";
import type { ReactNode } from "react";

import { NW } from "~/components/ui/NW";
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
            <ScrambleText size="3" weight="medium">
              {subtitle}
            </ScrambleText>
          </Flex>

          {/* Print-only brand mark in the top-right. On screen the
              `ThemeToggle` lives in `SiteNav`; in print `SiteNav` is hidden
              (`notPrintable`) and this NW logo takes the corner. */}
          <Box className={styles.printable} aria-hidden>
            <NW style={{ height: "3.5rem", width: "auto", color: "var(--gray-11)" }} />
          </Box>
        </Flex>

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
          >
            <ProfileColumn blurb={blurb} links={links} />
          </Box>

          {/* Right column — experience. In print the left column above is
              hidden so this stretches to 100% (see CVShell.module.css
              @media print rules). */}
          <Box className={styles.rightCol} flexGrow="1" style={{ minWidth: 0 }}>
            <Heading as="h2" size="3" weight="bold" color="gray">
              Experience
            </Heading>

            <Separator
              size="4"
              mt="4"
              mb="6"
              className={`${styles.experienceSeparator} ${styles.noBreakAfter}`}
            />

            <Flex direction="column">
              {experience.map((item, idx) => (
                <Box key={`${item.company}-${item.startYear}`}>
                  {idx > 0 && (
                    <Separator
                      size="4"
                      my="6"
                      className={`${styles.experienceSeparator} ${styles.noBreakAfter}`}
                    />
                  )}
                  <ExperienceBlock item={item} mdxComponents={mdxComponents} />
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>

        {/* Print-only footer — same bio + links content the screen shows in
            its left column, repositioned below the experience timeline for
            paginated output. Wrapped in `printFooter` for top-margin /
            page-break behavior; `printable` keeps it hidden on screen. */}
        <Box className={`${styles.printable} ${styles.printFooter}`}>
          <Separator
            size="4"
            mb="4"
            className={`${styles.experienceSeparator} ${styles.noBreakAfter}`}
          />
          <Heading as="h2" size="3" weight="bold" color="gray" mb="3">
            About
          </Heading>
          <ProfileColumn blurb={blurb} links={links} compact />
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Bio paragraph + contact link list. Renders in two places: the screen-only
 * left column and the print-only footer at the bottom of the page. The
 * `compact` flag toggles the dividers between links to a horizontal layout
 * (footer) vs the stacked vertical layout (sidebar).
 */
function ProfileColumn({
  blurb,
  links,
  compact = false,
}: {
  blurb: string;
  links: CVLink[];
  compact?: boolean;
}) {
  return (
    <>
      <Text as="p" size="4" color="gray" style={{ lineHeight: 1.5 }}>
        {blurb}
      </Text>

      {!compact && (
        <Separator
          size="4"
          mt="4"
          mb="6"
          className={`${styles.experienceSeparator} ${styles.noBreakAfter}`}
        />
      )}

      <Flex
        direction={compact ? "row" : "column"}
        gap={compact ? "5" : "0"}
        wrap={compact ? "wrap" : "nowrap"}
        mt={compact ? "4" : "0"}
        asChild
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {links.map((link, idx) => (
            <li key={link.href + link.label}>
              {!compact && idx > 0 && (
                <Separator
                  size="4"
                  my="3"
                  className={`${styles.experienceSeparator} ${styles.noBreakAfter}`}
                />
              )}
              <Link
                color="gray"
                weight="medium"
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
    </>
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
          <Box mb="2">
            <ScrambleText size="3" weight="medium">
              {role}
            </ScrambleText>
          </Box>
          {companyUrl ? (
            <Link
              href={companyUrl}
              target="_blank"
              rel="noreferrer"
              size="3"
              weight="medium"
              color="gray"
            >
              {company}{" "}
              <LinkIcon
                aria-hidden
                style={{
                  height: "0.9em",
                  width: "0.9em",
                  marginLeft: "0.15rem",
                  display: "inline-block",
                  verticalAlign: "-0.1em",
                }}
              />
            </Link>
          ) : (
            <Text size="3" weight="medium">
              {company}
            </Text>
          )}
          <Text as="p" size="3" color="gray" weight="medium" mt="1">
            {startYear}-{endYear}
          </Text>
          <Text as="p" size="3" color="gray">
            {location}
          </Text>
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
