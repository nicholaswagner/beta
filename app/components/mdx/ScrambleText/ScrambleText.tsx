import { Text } from "@radix-ui/themes";
import type { TextProps } from "@radix-ui/themes";
import { useEffect, useRef, type MouseEventHandler } from "react";

import type { ScrambleOptions } from "~/hooks/useScrambleText";
import { useScrambleText } from "~/hooks/useScrambleText";

import styles from "./ScrambleText.module.css";
import { useTheme } from "../../ThemeContext";

// Scramble-specific option keys, so we can split them out of the props before
// they reach Radix `Text` (which should only receive `TextProps`).
const SCRAMBLE_KEYS = [
  "chars",
  "duration",
  "speed",
  "ease",
  "scrollStart",
  "charsClass",
  "offset",
  "onDone",
] as const satisfies readonly (keyof ScrambleOptions)[];

export const ScrambleText = ({
  children,
  className,
  replayOnHover = false,
  onMouseEnter,
  ...props
}: Partial<TextProps> & ScrambleOptions & { replayOnHover?: boolean }) => {
  const ref = useRef<HTMLElement | null>(null);

  // Separate scramble options from Radix Text props.
  const scrambleOptions: ScrambleOptions = {};
  const textProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if ((SCRAMBLE_KEYS as readonly string[]).includes(key)) {
      scrambleOptions[key as keyof ScrambleOptions] = value as never;
    } else {
      textProps[key] = value;
    }
  }

  const replay = useScrambleText(ref, { ...scrambleOptions, charsClass: styles.char });
  const { theme } = useTheme();

  /**
   * Re-play whenever the user toggles light/dark. We depend on the stable
   * `theme: "light" | "dark"` string rather than `themeProps` because
   * `ThemeContext` regenerates `themeProps` with a fresh random accent on
   * every render — depending on it would re-fire on unrelated re-renders.
   *
   * Guarded against the initial mount so it doesn't double-fire with
   * ScrollTrigger's `onEnter` for elements already in view on load.
   */
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    replay();
  }, [theme, replay]);

  // Replay on hover when asked; still forward any caller-supplied handler.
  const handleMouseEnter: MouseEventHandler<HTMLSpanElement> = (event) => {
    if (replayOnHover) replay();
    // Radix `Text` is polymorphic, so its `onMouseEnter` param is an
    // intersection across element types — cast to forward our span event.
    onMouseEnter?.(event as never);
  };

  return (
    <Text
      ref={ref}
      className={className ? `${styles.scramble} ${className}` : styles.scramble}
      onMouseEnter={handleMouseEnter}
      {...(textProps as Partial<TextProps>)}
    >
      {children}
    </Text>
  );
};
