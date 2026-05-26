import { Text } from "@radix-ui/themes";
import type { TextProps } from "@radix-ui/themes";
import { Children, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
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
	// `inline-block` is what lets `min-width` apply at all on an otherwise
	// inline `<Text>`. `vertical-align: baseline` keeps it on the line with
	// neighboring text instead of getting bumped by inline-block default.
	display: "inline-block",
	verticalAlign: "baseline",
	// `min-width` is computed below from the rest length of `children`. We
	// set it via `--scramble-width` so the calc is in one place.
	minWidth:
		"calc(var(--scramble-width-ch, 0) * 1ch + (var(--scramble-width-ch, 0) - 1) * 0.1em)",
};

/**
 * Stringify ReactNode children to count rest-state characters. The hook
 * captures `el.textContent` at trigger time, so this mirrors what it sees.
 * If the children include non-text nodes we fall back to 0 (no min-width) —
 * the animation can shift in that case, but it's the long-tail.
 */
function childrenToText(node: ReactNode): string {
	let out = "";
	Children.forEach(node, (child) => {
		if (typeof child === "string" || typeof child === "number") {
			out += String(child);
		}
	});
	return out;
}

export const ScrambleText = ({
	children,
	style,
	...props
}: Partial<TextProps> & Partial<ScrambleOptions>) => {
	const ref = useRef<HTMLElement | null>(null);
	const trigger = useScrambleText(ref, {
		...defaults,
		...props,
	});

	const restLen = childrenToText(children).length;

	const { themeProps } = useTheme();

	useEffect(() => {
		if (!ref.current || themeProps) return;
		trigger();
	}, [themeProps]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					trigger();
				}
			},
			{ threshold: 0.25 },
		);
		if (ref.current) {
			observer.observe(ref.current);
		}
		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, [trigger]);

	return (
		<Text
			ref={ref}
			style={
				{
					...scrambleStyle,
					"--scramble-width-ch": restLen || 0,
					...style,
				} as CSSProperties
			}
			{...props}
		>
			{children}
		</Text>
	);
};
