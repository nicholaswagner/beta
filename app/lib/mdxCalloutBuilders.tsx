import { Callout, Text } from "@radix-ui/themes";

import {
  Bomb,
  CheckIcon,
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  LayoutList,
  Quote,
  SquareCheck,
  SquarePen,
  TriangleAlert,
} from "lucide-react";

type CalloutType =
  | "note"
  | "info"
  | "tip"
  | "important"
  | "danger"
  | "error"
  | "warning"
  | "success"
  | "abstract"
  | "summary"
  | "tldr"
  | "quote"
  | "cite"
  | "bulletpoint"
  | "bullet"
  | "todo"
  | "check"
  | "checklist"
  | "done"
  | "fail"
  | "missing"
  | "example"
  | "exercise"
  | "hint"
  | "faq"
  | "keyideas";

function mapCalloutColor(type?: string): React.ComponentProps<typeof Callout.Root>["color"] {
  switch (type?.toLowerCase()) {
    // Warning / error tones
    case "warn":
    case "warning":
    case "missing":
      return "orange";

    case "danger":
    case "fail":
    case "failure":
    case "error":
      return "red";

    // Success / tip tones
    case "success":
    case "tip":
    case "hint":
    case "important":
      return "green";

    // Bullet / list tones
    case "bulletpoint":
    case "bullet":
    case "todo":
    case "check":
    case "checklist":
    case "done":
    case "example":
    case "exercise":
    case "faq":
    case "info":
      return "gray";

    // Quote / abstract tones
    case "quote":
    case "abstract":
    case "summary":
    case "keyideas":
    case "note":

    // Default / neutral
    default:
      return "plum";
  }
}

function mapCalloutIcon(type?: string): React.ReactNode {
  switch (type?.toLowerCase()) {
    case "warn":
    case "warning":
    case "missing":
      return <CircleAlert />;

    case "danger":
    case "fail":
    case "failure":
    case "error":
      return <CircleX />;

    case "success":
      return <CircleCheck />;

    case "todo":
    case "check":
    case "checklist":
    case "done":
      return <LayoutList />;

    case "edit":
    case "info":
      return <Info />;

    case "tip":
    case "hint":
    case "important":
      return <Info />;

    case "quote":
    default:
      return <Quote />;
  }
}

// Builds a standard callout for non-MDX content.
function buildCallout({ type, children }: { type?: string; children?: React.ReactNode }) {
  return (
    <Callout.Root color={mapCalloutColor(type)} my="3">
      <Callout.Icon>{mapCalloutIcon(type)}</Callout.Icon>
      <Callout.Text>{children}</Callout.Text>
    </Callout.Root>
  );
}

// Shims the `<ObsidianCallout />` component emitted by the remark
// plugin (which transforms `> [!type] Title` syntax into a tree of
// ObsidianCallout / ObsidianCalloutTitle / ObsidianCalloutBody nodes).
// We avoid importing `fumadocs-obsidian/ui` to prevent pulling in
// unrelated styling — instead we use Radix Themes primitives directly.
function buildObsidianCallout({ type, children }: { type?: string; children?: React.ReactNode }) {
  return (
    <Callout.Root color={mapCalloutColor(type)} my="3">
      <Callout.Icon>{mapCalloutIcon(type)}</Callout.Icon>
      {children}
    </Callout.Root>
  );
}

function buildObsidianCalloutTitle({ children }: { children?: React.ReactNode }) {
  return (
    <Text size="3" weight="bold" as="div">
      {children}
    </Text>
  );
}

function buildObsidianCalloutBody({ children }: { children?: React.ReactNode }) {
  // Render nothing when the source has no body to avoid an empty
  // text node taking up vertical space.
  if (!children) return null;
  return <Callout.Text mt="1">{children}</Callout.Text>;
}

export { buildCallout, buildObsidianCallout, buildObsidianCalloutTitle, buildObsidianCalloutBody };
