import { Box, Link, Text } from "@radix-ui/themes";
import { LinkIcon } from "lucide-react";
import styles from "./CVLayout.module.css";
import { ScrambleText } from "~/components/mdx/ScrambleText/ScrambleText";
import type { ExperienceItem } from "~/layouts/cv/CVLayout";



export function WorkMatter({ company, companyUrl, role, startYear, endYear, location }: Omit<ExperienceItem, "Body">) {
  return (
    <Box>
      {companyUrl ? (
        <Link
          className={styles.scrambleLink}
          href={companyUrl}
          target="_blank"
          rel="noreferrer"
          size="2"
          weight="bold"
        >
          <ScrambleText replayOnHover offset={0.1} >
            {company}
          </ScrambleText>{" "}
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
        <Text className={styles.scrambleHover} size="2" >
          <ScrambleText replayOnHover offset={0.1}>
            {company}
          </ScrambleText>
        </Text>
      )}

      <Box className={styles.scrambleHover}>
        <ScrambleText
          size="1"
          replayOnHover
          offset={0}
        >
          {role}
        </ScrambleText>
      </Box>

      <Text as="p" className={styles.scrambleHover} size="1" >
        <ScrambleText replayOnHover offset={0.2}>
          {`${startYear}-${endYear}`}
        </ScrambleText>
      </Text>

      <Text as="p" className={styles.scrambleHover} size="1">
        <ScrambleText replayOnHover offset={0.3}>
          {location}
        </ScrambleText>
      </Text>
    </Box>
  );
}