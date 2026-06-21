import { useGSAP } from "@gsap/react";
import { Box } from "@radix-ui/themes";
import type { BoxProps } from "@radix-ui/themes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "../../ThemeContext";
import styles from "./TerminalSeparator.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Hard ceiling on glyph cells — a real rule needs a few hundred at most; this
 *  is purely a guard so a bad measurement can't fill the line with absurd work. */
const MAX_GLYPHS = 1024;

/** Decode timing. `power2.out` eases the wavefront to a gentle stop at the right
 *  edge, which reads more deliberate than a linear sweep. */
const DECODE_DURATION = 0.9;
const DECODE_EASE = "power2.out";

/** Scramble texture at the decode wavefront. Same pool as the site's scramble
 *  text so the separator reads as the same effect; it resolves to `char` behind
 *  the wavefront. `CHURN_ZONE` is how many cells churn at the leading edge; the
 *  glyphs re-roll every `CHURN_EVERY` ticks so it isn't a frantic per-frame flic. */
const SCRAMBLE_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789░░░░☓▵⌧";
const CHURN_ZONE = 16;
const CHURN_EVERY = 2;
const randomGlyph = () => SCRAMBLE_POOL[(Math.random() * SCRAMBLE_POOL.length) | 0];

/** Stagger step between separators that fire in the same frame, in seconds, and
 *  a ceiling so a large batch can't push the last one too far out. */
const STAGGER_STEP = 0.12;
const STAGGER_MAX = 0.8;

// Shared across all instances: hands out 0, STEP, 2*STEP… to triggers that fire
// within the same frame (the on-load batch), then resets on the next frame. The
// result is a top-to-bottom cascade on load, while a lone separator scrolled
// into view later still gets delay 0 and plays immediately.
let staggerSlot = 0;
let staggerFlushQueued = false;
function nextStaggerDelay() {
  const delay = Math.min(staggerSlot * STAGGER_STEP, STAGGER_MAX);
  staggerSlot += 1;
  if (!staggerFlushQueued) {
    staggerFlushQueued = true;
    requestAnimationFrame(() => {
      staggerSlot = 0;
      staggerFlushQueued = false;
    });
  }
  return delay;
}

interface TerminalSeparatorProps extends Omit<BoxProps, "children"> {
  /** Glyph the rule resolves to. Defaults to the box-drawing dash "─" (gapless);
   *  pass an ASCII glyph like "=" or "-" for a more literal terminal look. */
  char?: string;
}

/**
 * A drop-in alternative to Radix `<Separator>` that draws a horizontal rule the
 * way a terminal would: glyphs scramble in a left→right wavefront and resolve to
 * the rule character behind it. Layout/margin props (`my`, `mt`, `mb`,
 * `className`, …) forward to the wrapping `<Box>`, so it spaces like the
 * separator it replaces.
 *
 * The glyph count is measured to fill the wrapper's width (a hidden probe sizes
 * one glyph against the same `--font-mono` font) and recomputed on resize. The
 * line is positioned absolutely so the (over-filled, `nowrap`) glyph run can't
 * feed its width back into the layout — see the CSS for why that matters.
 *
 * Plays once, the first time it's scrolled into view (staggered against sibling
 * separators in the same frame); later triggers — re-entering view, a resize, a
 * theme re-render — jump to the finished line. Snaps to the finished line before
 * printing. Purely decorative (`aria-hidden`).
 */
export function TerminalSeparator({ char = "─", className, ...boxProps }: TerminalSeparatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const { theme } = useTheme();
  // The decode plays once on first reveal; this latch (a ref, so it survives the
  // resize-driven useGSAP rebuild) makes later scroll re-entries and resizes jump
  // to the finished line instead of replaying. See `play()` below.
  const hasPlayedRef = useRef(false);
  // Set by the GSAP setup to force a fresh decode regardless of the latch — used
  // to replay on theme toggle.
  const replayRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // Probe the rendered width of a single glyph in the wrapper's own font,
      // then fill the line. Round up (+1): overflow is clipped, but an
      // under-estimate would leave a visible gap at the line's end. Capped so a
      // pathological measurement can never fill the line with absurd work.
      const probe = document.createElement("span");
      probe.style.visibility = "hidden";
      probe.style.position = "absolute";
      probe.style.whiteSpace = "pre";
      probe.textContent = char;
      el.appendChild(probe);
      const charWidth = probe.getBoundingClientRect().width;
      el.removeChild(probe);
      if (charWidth <= 0) return;

      const next = Math.min(Math.floor(el.clientWidth / charWidth) + 1, MAX_GLYPHS);
      setCount((prev) => (prev === next ? prev : next));
    };

    // Defer the measure/setState out of the ResizeObserver callback via rAF: it
    // avoids the "ResizeObserver loop" warning and coalesces bursts of resize
    // notifications into one measurement per frame.
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [char]);

  useGSAP(
    () => {
      const el = ref.current;
      const line = lineRef.current;
      if (!el || !line || count === 0) return;

      const mm = gsap.matchMedia();

      // Reduced motion: skip the decode — show the finished line.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        line.textContent = char.repeat(count);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const state = { p: 0 };
        let frame = 0;
        let churn = Array.from({ length: CHURN_ZONE }, randomGlyph);

        // Pre-decode state: empty line. Applied immediately on every (re)trigger
        // so the line never flashes its old finished state during the stagger
        // lead-in.
        const resetHidden = () => {
          state.p = 0;
          line.textContent = "";
        };

        const tl = gsap.timeline({ paused: true });
        // The line grows left→right: glyphs scramble across a `CHURN_ZONE`-wide
        // wavefront and resolve to `char` once the wavefront has passed.
        tl.to(state, {
          p: 1,
          duration: DECODE_DURATION,
          ease: DECODE_EASE,
          onUpdate: () => {
            const p = state.p;
            if (frame++ % CHURN_EVERY === 0) {
              churn = Array.from({ length: CHURN_ZONE }, randomGlyph);
            }
            if (p >= 1) {
              line.textContent = char.repeat(count);
            } else {
              const edge = Math.min(Math.round(p * count), count);
              const resolved = Math.max(0, edge - CHURN_ZONE);
              line.textContent = char.repeat(resolved) + churn.slice(0, edge - resolved).join("");
            }
          },
        });

        // Start a fresh decode from empty, staggered against siblings firing in
        // the same frame.
        const startDecode = () => {
          resetHidden();
          tl.delay(nextStaggerDelay());
          tl.restart(true);
        };
        // Expose it so the theme-toggle effect can force a replay.
        replayRef.current = startDecode;

        // Scroll trigger: play once on first reveal; later re-entries and resize
        // rebuilds land on the finished line without re-animating.
        const play = () => {
          if (hasPlayedRef.current) {
            tl.progress(1);
            return;
          }
          hasPlayedRef.current = true;
          startDecode();
        };

        // Initial state for this (re)build: finished if it has already played
        // (e.g. after a resize), otherwise empty and waiting for the trigger.
        if (hasPlayedRef.current) tl.progress(1);
        else resetHidden();

        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          onEnter: play,
          onEnterBack: play,
        });

        // Snap to the finished line before the print snapshot.
        const onBeforePrint = () => tl.progress(1);
        window.addEventListener("beforeprint", onBeforePrint);
        return () => window.removeEventListener("beforeprint", onBeforePrint);
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [count], revertOnUpdate: true },
  );

  // Replay the decode on theme toggle. Guarded against the initial mount so it
  // doesn't double-fire with the scroll trigger's first reveal.
  const themeMountedRef = useRef(false);
  useEffect(() => {
    if (!themeMountedRef.current) {
      themeMountedRef.current = true;
      return;
    }
    replayRef.current?.();
  }, [theme]);

  return (
    <Box
      ref={ref}
      aria-hidden
      className={className ? `${styles.rule} ${className}` : styles.rule}
      {...boxProps}
    >
      {count > 0 && (
        <span ref={lineRef} className={styles.line}>
          {char.repeat(count)}
        </span>
      )}
    </Box>
  );
}
