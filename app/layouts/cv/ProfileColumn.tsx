import { Flex, Link } from "@radix-ui/themes";

import { ScrambleText } from "~/components/mdx/ScrambleText/ScrambleText";
import { TerminalSeparator } from "~/components/ui/TerminalSeparator/TerminalSeparator";

import type { CVLink, ExperienceItem } from './CVLayout';

import styles from "./CVLayout.module.css";

/**
 * Bio paragraph + contact link list. Renders in two places: the screen-only
 * left column and the print-only footer at the bottom of the page. The
 * `compact` flag toggles the dividers between links to a horizontal layout
 * (footer) vs the stacked vertical layout (sidebar).
 */
export function ProfileColumn({
  Blurb,
  blurbComponents,
  links,
  compact = false,
}: {
  Blurb: ExperienceItem["Body"];
  blurbComponents: Record<string, unknown>;
  links: CVLink[];
  compact?: boolean;
}) {
  return (
    <>
      {/* The bio is compiled MDX from vault/cv/index.md — it can use inline
          components like `<ScrambleText>`. Its typography is stamped onto the
          `p`/`ScrambleText` entries in `blurbComponents`. */}
      <Flex mb="6" direction="column">
        <Blurb components={blurbComponents} />
      </Flex>

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
                <TerminalSeparator my="3" className={styles.noBreakAfter} />
              )}
              <Link
                className={styles.scrambleLink}
                weight="light"
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                size="2"
              >
                <ScrambleText replayOnHover>
                  {link.label}
                </ScrambleText>
              </Link>
            </li>
          ))}
        </ul>
      </Flex>
    </>
  );
}