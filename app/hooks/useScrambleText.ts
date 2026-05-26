import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

type EasingName =
  | "linear"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInOut"
  | "easeOutCubic"
  | "easeOutExpo";

type ScrambleMode = "char" | "word";

export type ScrambleOptions = {
  autoPlay?: boolean;
  chars?: string;
  delay?: number;
  duration?: number;
  easing?: EasingName | ((t: number) => number);
  mode?: ScrambleMode;
  onDone?: () => void;
  shuffle?: boolean;
};

export function useScrambleText<T extends HTMLElement | null>(
  ref: RefObject<T>,
  options: ScrambleOptions = {},
) {
  const delayTimeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const originalTextRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const trigger = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    if (originalTextRef.current == null) {
      originalTextRef.current = el.textContent || "";
    }

    const originalText = originalTextRef.current;
    const {
      chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789R",
      delay = 0,
      duration = 2000,
      easing = "easeOutCubic",
      mode = "char",
      onDone,
      shuffle = false,
    } = options;

    const ease =
      typeof easing === "function" ? easing : EASING_PRESETS[easing] || EASING_PRESETS.linear;

    const originalUnits =
      mode === "word" ? (originalText.match(/\S+|\s+/g) ?? []) : Array.from(originalText);

    const joiner = "";

    const length = originalUnits.length;
    const indices = Array.from({ length }, (_, i) => i);

    if (shuffle) {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }

    const scrambled = originalUnits.map((unit) =>
      shouldPreserve(unit, mode) ? unit : scrambleUnit(unit.length, chars, mode),
    );

    el.textContent = scrambled.join(joiner);

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);
      const resolvedCount = Math.floor(length * ease(t));

      for (let i = 0; i < length; i++) {
        const targetIndex = shuffle ? indices[i] : i;
        const original = originalUnits[targetIndex];

        scrambled[targetIndex] =
          i < resolvedCount
            ? original
            : shouldPreserve(original, mode)
              ? original
              : scrambleUnit(original.length, chars, mode);
      }

      if (ref.current) {
        ref.current.textContent = scrambled.join(joiner);
      }

      if (t < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        if (ref.current) ref.current.textContent = originalText;
        if (onDone) onDone();
      }
    };

    delayTimeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      frameRef.current = requestAnimationFrame(animate);
    }, delay);
  }, [ref, options]);

  useEffect(() => {
    if (options.autoPlay) {
      trigger();
    }

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (delayTimeoutRef.current !== null) clearTimeout(delayTimeoutRef.current);
    };
  }, [trigger, options.autoPlay]);

  return trigger;
}

// Helper to check if a unit should be preserved (whitespace)
function shouldPreserve(unit: string, mode: ScrambleMode): boolean {
  if (mode === "word") {
    return /\s+/.test(unit); // entire whitespace chunk
  }
  return /^\s$/.test(unit); // single whitespace char
}

function scrambleUnit(length: number, chars: string, mode: ScrambleMode): string {
  return Array.from({ length })
    .map(() => randomChar(chars))
    .join(mode === "word" ? "" : "");
}

function randomChar(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)];
}

const EASING_PRESETS: Record<string, (t: number) => number> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInOut: (t) => (t < 0.5 ? 0.5 * (2 * t) ** 3 : 0.5 * ((2 * (t - 1)) ** 3 + 2)),
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
};
