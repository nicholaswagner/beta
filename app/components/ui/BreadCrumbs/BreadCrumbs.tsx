import { Link as RLink } from "@radix-ui/themes";
import { ChevronRight } from "lucide-react";
import { Fragment, type ComponentProps } from "react";
import { Link as RouterLink, useLocation } from "react-router";

import styles from "./breadcrumbs.module.css";

// The trailing crumb: styled like a link for visual consistency, but it's the
// current page so it's non-navigable. aria-current="page" announces it as such,
// and aria-disabled removes it from the interaction model.
const CrumbPage = ({ label }: { label: string }) => {
	return (
		<RLink
			size="1"
			weight="bold"
			aria-disabled="true"
			aria-current="page"
			tabIndex={0}
			style={{ userSelect: "none" }}
		>
			{label}
		</RLink>
	);
};

// Decorative chevron between crumbs. role/aria-hidden keep it out of the
// accessibility tree so screen readers don't announce it as content.
const CrumbSeparator = ({ className, ...props }: ComponentProps<"li">) => {
	return (
		<li
			data-slot="breadcrumb-separator"
			role="presentation"
			aria-hidden="true"
			className={className || styles.separator}
			{...props}
		>
			<ChevronRight style={{ scale: 0.5 }} />
		</li>
	);
};

// Derives a breadcrumb trail from the current URL path, one crumb per segment.
export const BreadCrumbs = () => {
	const { pathname } = useLocation();
	// Split the path into segments; filter(Boolean) drops the empty strings
	// produced by leading/trailing/double slashes (e.g. "/foo/" -> ["foo"]).
	const segments = pathname.split("/").filter(Boolean);
	// Nothing to show at the root ("/").
	// if (segments.length === 0) return null;
	if (segments.length < 2) return null;

	return (
		<nav
			aria-label="breadcrumbs"
			data-slot="breadcrumbs"
			className={styles.breadcrumbs}
		>
			<ol data-slot="breadcrumb-list">
				{segments.map((segment, i) => {
					// Cumulative path up to and including this segment — the crumb's href.
					const to = "/" + segments.slice(0, i + 1).join("/");
					const isLast = i === segments.length - 1;
					return (
						<Fragment key={to}>
							{/* Separator precedes every crumb except the first. */}
							{i > 0 && <CrumbSeparator />}
							<li data-slot={isLast ? "breadcrumb-page" : "breadcrumb-item"}>
								{/* Last segment is the current page (non-link); the rest navigate. */}
								{isLast ? (
									<CrumbPage label={segment} />
								) : (
									<RLink asChild size="1" className="rootlink">
										<RouterLink to={to}>{segment}</RouterLink>
									</RLink>
								)}
							</li>
						</Fragment>
					);
				})}
			</ol>
		</nav>
	);
};
