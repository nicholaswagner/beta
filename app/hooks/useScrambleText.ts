import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useCallback, useRef } from "react";
import type { RefObject } from "react";

// Register once at module scope. `useGSAP` is itself a plugin and must be
// registered before the hook runs. All GSAP plugins are free (public `gsap`
// package) since the Webflow acquisition.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export type ScrambleOptions = {
  /** Scramble character pool. Accepts a literal string of glyphs, or one of the
   *  keywords "upperCase" | "lowerCase" | "upperAndLowerCase". */
  chars?: string;
  /** Total decode duration, in seconds. */
  duration?: number;
  /** Churn speed of unresolved characters (higher = faster re-roll). */
  speed?: number;
  /** Tween ease for the reveal wavefront. */
  ease?: string;
  /** ScrollTrigger `start` for the scroll-into-view replay. */
  scrollStart?: string;
  /** CSS class applied to each split character (per-char background lives here). */
  charsClass?: string;
  /** Lead delay for this instance, in seconds. Omit to get a small random
   *  offset so multiple instances on a page cascade instead of firing in sync. */
  offset?: number;
  /** Fired when the scramble finishes. */
  onDone?: () => void;
};

const DEFAULTS = {
  // Uppercase + digits: the text is rendered uppercase, so this is the visible
  // texture. Mirrors the demo's mixed alphanumeric churn.
  chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789░░░░░░░░░░░░░░░░░░░░░",
  duration: 0.8,
  speed: 1,
  ease: "sine.in",
  scrollStart: "top 85%",
} satisfies Partial<ScrambleOptions>;

const CHAR_PRESETS: Record<string, string> = {
  upperCase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowerCase: "abcdefghijklmnopqrstuvwxyz",
  upperAndLowerCase: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
};

const randomGlyph = (pool: string) => pool[(Math.random() * pool.length) | 0];

/**
 * GSAP-powered scramble-in text. Splits the target into per-character elements
 * (so each glyph can carry its own background), then runs a single coordinated
 * "decode" reveal across them: the head resolves to the real text while the
 * unresolved tail keeps churning random characters, the boundary sweeping
 * left-to-right. Only each span's `textContent` is touched (never the parent's
 * `innerHTML`), so the per-character background blocks survive the animation.
 *
 * The returned `replay()` restarts the timeline; scroll-into-view replays are
 * wired internally via ScrollTrigger. Honors `prefers-reduced-motion` (no
 * scramble — original text is shown) and snaps to final text before printing.
 */
export function useScrambleText<T extends HTMLElement | null>(
  ref: RefObject<T>,
  options: ScrambleOptions = {},
) {
  const opts = { ...DEFAULTS, ...options };

  // One paused timeline, driven by two callers (scroll + theme). Held in a ref
  // so `replay()` can reach it without re-running the GSAP setup.
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Stable per-instance lead delay. Generated once; `gsap.utils.random` gives a
  // small offset so stacked instances don't fire in lockstep.
  const offsetRef = useRef(options.offset ?? gsap.utils.random(0, 0.25));

  // Latch options so the GSAP setup (mount-only) always reads current values
  // without listing them as deps and re-running.
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Gate the whole animation behind reduced-motion. When the user prefers
      // reduced motion this block never runs: `tlRef` stays null, nothing is
      // split, and the original text (already in the DOM) is what's shown.
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const { chars, duration, speed, ease, scrollStart, charsClass, onDone } = optsRef.current;

        const split = SplitText.create(el, {
          type: "words,chars",
          charsClass,
          aria: "auto",
        });

        // SplitText sets `aria-label` on `el` (the full text) and `aria-hidden`
        // on the per-char cells. But `aria-label` is prohibited on a bare
        // generic element (axe `aria-prohibited-attr` / WCAG 4.1.2), so pair it
        // with a role that accepts an author-supplied name. `role="text"`
        // collapses the split cells back into a single flat string for AT.
        // Removed on cleanup; never set under reduced-motion (this block is
        // gated behind it), where the plain text is shown instead.
        el.setAttribute("role", "text");

        // SplitText treats every space as a word delimiter, so the gap between
        // words is left as a bare text node — never its own char cell. Wrap each
        // gap in a matching cell (rendered as a non-breaking space so its width
        // survives when resolved) so spaces churn too and fill the gap during
        // the scramble. SplitText has already set el's aria-label to the full
        // text, and these cells are aria-hidden, so screen readers are fine.
        for (const node of Array.from(el.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE && (node.nodeValue ?? "").trim() === "") {
            const cell = document.createElement("div");
            if (charsClass) cell.className = charsClass;
            cell.setAttribute("aria-hidden", "true");
            cell.style.position = "relative";
            cell.style.display = "inline-block";
            cell.textContent = " ";
            el.replaceChild(cell, node);
          }
        }

        // Capture target glyphs up front so a restart always resolves to the
        // real text, never a leftover frame from an interrupted run. Query in
        // DOM order so the wrapped space cells land in their right positions.
        const cells = charsClass
          ? Array.from(el.querySelectorAll<HTMLElement>(`.${charsClass}`))
          : (split.chars as HTMLElement[]);
        const original = cells.map((c) => c.textContent ?? "");
        const pool = CHAR_PRESETS[chars] ?? chars;
        const count = original.length;

        // Re-roll cadence: higher `speed` churns faster. onUpdate runs ~once per
        // frame, so this throttles how often unresolved glyphs change.
        const churnEvery = Math.max(1, Math.round(2 / speed));

        const setCell = (i: number, value: string) => {
          if (cells[i].textContent !== value) cells[i].textContent = value;
        };
        // Scramble every cell to a random glyph (the churning tail).
        const scrambleAll = () => {
          for (let i = 0; i < count; i++) setCell(i, randomGlyph(pool));
        };
        // Resolve every cell to its real glyph (the finished state).
        const resolveAll = () => {
          for (let i = 0; i < count; i++) setCell(i, original[i]);
        };

        const proxy = { p: 0 };
        let frame = 0;

        const tl = gsap.timeline({ paused: true, onComplete: onDone });
        // Prime the scramble at t=0 so a restart shows churn immediately (no
        // flash of final text during the lead delay), then decode after `offset`.
        tl.call(scrambleAll, [], 0);
        tl.to(
          proxy,
          {
            p: 1, // eased by `ease`, so `proxy.p` is the eased reveal progress
            duration,
            ease,
            onUpdate: () => {
              const revealed = Math.floor(count * proxy.p);
              const roll = frame++ % churnEvery === 0;
              for (let i = 0; i < count; i++) {
                if (i < revealed) {
                  setCell(i, original[i]); // head: resolved
                } else if (roll) {
                  setCell(i, randomGlyph(pool)); // tail: churning
                }
              }
            },
            onComplete: resolveAll, // guarantee exact final text
          },
          offsetRef.current,
        );
        tlRef.current = tl;

        // Replay every time the element scrolls into view, from either direction.
        ScrollTrigger.create({
          trigger: el,
          start: scrollStart,
          onEnter: () => tl.restart(),
          onEnterBack: () => tl.restart(),
        });

        // Snap any in-flight scramble to final text before the print snapshot.
        const onBeforePrint = () => tl.progress(1);
        window.addEventListener("beforeprint", onBeforePrint);

        return () => {
          tlRef.current = null;
          el.removeAttribute("role");
          window.removeEventListener("beforeprint", onBeforePrint);
        };
      });
    },
    { scope: ref },
  );

  // Null-safe, so it's inert under reduced-motion.
  return useCallback(() => {
    tlRef.current?.restart();
  }, []);
}
