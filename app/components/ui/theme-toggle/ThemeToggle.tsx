import { Moon, Sun } from "lucide-react";
import { Switch } from "radix-ui";
import { type Component, forwardRef } from "react";
import { debounce } from "../../../utils/debounce";
import { useTheme } from "../ThemeContext";
import styles from "./styles.module.css";

interface ThemeToggleProps extends Partial<Component<typeof Switch>> {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
	({ checked, onCheckedChange, ...props }, ref) => {
		const { toggleTheme } = useTheme();

		const handleChange = (value: boolean) => {
			if (value !== checked) {
				debounce(toggleTheme, 400)();

				if (!onCheckedChange) return;
				onCheckedChange(value);
			}
		};

		return (
			<Switch.Root
				tabIndex={0}
				defaultChecked={checked}
				checked={checked}
				className={styles.Root}
				onCheckedChange={handleChange}
				ref={ref}
				{...props}
			>
				<Switch.Thumb className={styles.Thumb}>
					{checked ? (
						<Moon strokeWidth={2} size={14} />
					) : (
						<Sun strokeWidth={2} size={14} />
					)}
				</Switch.Thumb>{" "}
			</Switch.Root>
		);
	},
);
