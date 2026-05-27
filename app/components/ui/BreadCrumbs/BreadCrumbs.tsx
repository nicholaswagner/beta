import { Em, Link as RLink } from "@radix-ui/themes";
import { ChevronRight } from "lucide-react";
import { Fragment, type ComponentProps } from "react";
import { Link as RouterLink, useLocation } from "react-router";

import styles from "./breadcrumbs.module.css";

const CrumbPage = ({ label }: { label: string }) => {
	return (
		<RLink
			size="1"
			weight="bold"
			color="gray"
			aria-disabled="true"
			aria-current="page"
			tabIndex={0}
			style={{ color: "var(--gray-11)", userSelect: "none" }}
		>
			<Em>{label}</Em>
		</RLink>
	);
};

const CrumbSeparator = ({ className, ...props }: ComponentProps<"li">) => {
	return (
		<li
			data-slot="breadcrumb-separator"
			role="presentation"
			aria-hidden="true"
			className={className}
			style={{ color: "var(--gray-10)" }}
			{...props}
		>
			<ChevronRight style={{ scale: 0.5 }} />
		</li>
	);
};

export const BreadCrumbs = () => {
	const { pathname } = useLocation();
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) return null;

	return (
		<nav
			aria-label="breadcrumbs"
			data-slot="breadcrumbs"
			className={styles.breadcrumbs}
		>
			<ol data-slot="breadcrumb-list">
				{segments.map((segment, i) => {
					const to = "/" + segments.slice(0, i + 1).join("/");
					const isLast = i === segments.length - 1;
					return (
						<Fragment key={to}>
							{i > 0 && <CrumbSeparator />}
							<li data-slot={isLast ? "breadcrumb-page" : "breadcrumb-item"}>
								{isLast ? (
									<CrumbPage label={segment} />
								) : (
									<RLink asChild size="1" weight="bold" className="rootlink">
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
