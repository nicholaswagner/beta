import { Text } from "@radix-ui/themes";
import type { TextProps } from "@radix-ui/themes";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import type { ScrambleOptions } from "~/hooks/useScrambleText";
import { useScrambleText } from "~/hooks/useScrambleText";

import { useTheme } from "./ThemeContext";

const defaults: ScrambleOptions = {
  autoPlay: true,
  delay: 0,
  duration: 600,
  easing: "easeInOut",
  mode: "word",
};

/**
 * Visual treatment matches the live `/labs/cv` demo:
 *   - monospace + uppercase + 0.1em letter-spacing
 *   - 1ch/.1em repeating-linear-gradient stripe in `--accent-3` behind glyphs
 *   - `display: inline` so the box flows + wraps with its container; monospace
 *     guarantees each character cell stays a constant width, so the scramble
 *     animation doesn't shift sibling layout
 */
const scrambleStyle: CSSProperties = {
  color: "var(--gray-12)",
  fontFamily: "monospace",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  background: `repeating-linear-gradient(
    to right,
    var(--accent-3) 0,
    var(--accent-3) 1ch,
    transparent 1ch,
    transparent calc(1ch + 0.1em)
  )`,
};

export const ScrambleText = ({
  children,
  style,
  ...props
}: Partial<TextProps> & Partial<ScrambleOptions>) => {
  const ref = useRef<HTMLElement | null>(null);
  const trigger = useScrambleText(ref, { ...defaults, ...props });
  const { theme } = useTheme();

  /**
   * Re-play whenever the user toggles light/dark. We depend on the stable
   * `theme: "light" | "dark"` string rather than `themeProps` because
   * `ThemeContext` regenerates `themeProps` with a fresh random accent on
   * every render — depending on it would make the scramble re-fire on every
   * unrelated parent re-render.
   */
  useEffect(() => {
    trigger();
  }, [theme, trigger]);

  /**
   * Re-play every time the element scrolls into view (≥ 25% visible).
   * The observer's callback runs once per entry transition, so this won't
   * restart while the user is sitting on the element.
   */
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) trigger();
      },
      { threshold: 0.25 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [trigger]);

  return (
    <Text ref={ref} style={{ ...scrambleStyle, ...style }} {...props}>
      {children}
    </Text>
  );
};
