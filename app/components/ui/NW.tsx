import type { CSSProperties, SVGProps } from "react";

type variantPropType = { variant?: "medium" | "heavy" | "chonky" };

export const NW = ({
	style,
	className,
	variant = "chonky",
	...rest
}: SVGProps<SVGSVGElement> & variantPropType) => {
	const mergedStyles = {
		transformOrigin: "top left",
		...style,
	} as CSSProperties;

	const chonky = (
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M3.94372 12.4361L0 6H2.60291L5.17318 10.3145L7.67339 6H9.85629L12.0666 9.71029L14.277 6H16.7466L13.2529 11.7017L15.6933 15.7981L21.5303 6H24L16.647 18H14.6064L12 13.7464L9.39363 18H7.353L5.14589 14.398L3.03832 18H0.719503L3.94372 12.4361ZM8.43992 15.7981L6.36482 12.3148L8.68892 8.34278L10.8146 11.8119L8.43992 15.7981Z"
			fill="currentColor"
		/>
	);

	const heavy = (
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M3.94208 12.9839 0 6h2.22738l2.759 5.0276L7.67018 6h2.01156l2.38676 4.3492L14.4552 6h2.0904l-3.4802 6.1658 2.7302 4.9753L21.9096 6H24l-7.3378 13h-1.87L12 14.0532 9.20783 19h-1.87l-2.38578-4.2267L2.67387 19H.730644l3.211436-6.0161Zm4.3992 4.561-2.57482-4.692 2.82286-5.23731 2.63708 4.67191-2.88512 5.2574Z"
			clipRule="evenodd"
		/>
	);

	const medium = (
		<>
			<path
				fill="currentColor"
				d="M14.9886 19 7.66679 6h1.83045l6.40656 11.7L22.3104 6H24l-7.3218 13h-1.6896Z"
			/>
			<path
				fill="currentColor"
				d="M7.32179 19 0 6h1.83045l6.40656 11.7L14.6436 6h1.6896L9.01143 19H7.32179Z"
			/>
			<path fill="currentColor" d="M7.66679 6h1.61344L2.28864 19H.742419" />
		</>
	);

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={className}
			fill="currentColor"
			height="24px"
			style={mergedStyles}
			viewBox="0 0 24 24"
			width="24px"
			{...rest}
		>
			<title>NW</title>
			{variant === "chonky" ? chonky : variant === "heavy" ? heavy : medium}
		</svg>
	);
};
