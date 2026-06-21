import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CircleDashed, Lightbulb, LightbulbOff, Moon, Power, PowerOff, Sun } from "lucide-react";
import { Switch } from "radix-ui";
import { type Component, forwardRef, useEffect, useRef } from "react";

import { debounce } from "~/utils/debounce";

import { useTheme } from "../../ThemeContext";
import styles from "./ThemeToggle.module.css";

gsap.registerPlugin(useGSAP);

interface ThemeToggleProps extends Partial<Component<typeof Switch>> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ checked, onCheckedChange, ...props }, ref) => {
    const { toggleTheme } = useTheme();

    const thumbRef = useRef<HTMLSpanElement>(null);
    const sunRef = useRef<SVGSVGElement>(null);
    const moonRef = useRef<SVGSVGElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const hasMounted = useRef(false);

    // contextSafe-wrapped hover handlers, assigned inside useGSAP so their
    // tweens live in the hook's context (cleaned up on unmount).
    const onHoverRef = useRef<() => void>(undefined);
    const onLeaveRef = useRef<() => void>(undefined);

    const handleChange = (value: boolean) => {
      if (value !== checked) {
        debounce(toggleTheme, 400)();

        if (!onCheckedChange) return;
        onCheckedChange(value);
      }
    };

    // Build one paused timeline: unchecked (sun, thumb left) → checked (moon,
    // thumb right). The thumb slides with an overshoot while the icons spin +
    // scale-swap. Driven by play()/reverse() on the `checked` prop below.
    useGSAP((_context, contextSafe) => {
      const thumb = thumbRef.current;
      const sun = sunRef.current;
      const moon = moonRef.current;
      if (!thumb || !sun || !moon) return;

      // Base (unchecked) state. GSAP owns the thumb transform and icon
      gsap.set(thumb, { x: 0 });
      gsap.set(sun, { rotate: 0, scale: 1, autoAlpha: 1, ease: "power3.out" });
      gsap.set(moon, { rotate: 0, scale: 1, autoAlpha: 0, ease: "power3.out" });

      const tl = gsap
        .timeline({ paused: true })
        .to(thumb, { x: 24, duration: 0.45, ease: "power3.out" }, 0)
        .to(sun, { rotate: 0, scale: 1, autoAlpha: 0, duration: 0.25, ease: "power3.out" }, 0)
        .to(moon, { rotate: 0, scale: 1, autoAlpha: 1, duration: 0.35, ease: "power3.out" }, 0.12);

      // Reflect the initial state without animating on mount.
      tl.progress(checked ? 1 : 0);
      tlRef.current = tl;

      // Hover: a little elastic pop on the thumb's scale — a free property the
      // toggle timeline doesn't touch (it owns `x`; the icons own their scale).
      // contextSafe ensures these tweens are reverted with the hook's context.
      onHoverRef.current = contextSafe?.(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        // gsap.to(thumb, { scale: 1, duration: 0.5, ease: "back.out(2)" });
      });
      onLeaveRef.current = contextSafe?.(() => {
        // gsap.to(thumb, { scale: 1, duration: 0.3, ease: "back.out(2)" });
      });
    });

    // Play forward when checked, reverse when unchecked. Under reduced motion,
    // jump straight to the target state.
    useEffect(() => {
      const tl = tlRef.current;
      if (!tl) return;
      if (!hasMounted.current) {
        hasMounted.current = true;
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tl.progress(checked ? 1 : 0);
        return;
      }
      if (checked) tl.play();
      else tl.reverse();
    }, [checked]);

    return (
      <Switch.Root
        tabIndex={0}
        defaultChecked={checked}
        checked={checked}
        className={styles.Root}
        aria-label="Toggle dark mode"
        onCheckedChange={handleChange}
        onPointerEnter={() => onHoverRef.current?.()}
        onPointerLeave={() => onLeaveRef.current?.()}
        ref={ref}
        {...props}
      >
        <Switch.Thumb className={styles.Thumb} ref={thumbRef}>
          <span className={styles.iconStack}>
            <LightbulbOff ref={sunRef} className={styles.icon} strokeWidth={2} size={16} />
            <Lightbulb ref={moonRef} className={styles.icon} strokeWidth={2} size={16} />
          </span>
        </Switch.Thumb>
      </Switch.Root>
    );
  },
);
