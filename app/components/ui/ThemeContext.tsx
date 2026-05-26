import { Theme, type ThemeProps } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextInterface {
  theme: ThemeMode;
  themeProps: ThemeProps;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const accentColors = [
  // "amber",
  // "blue",
  "bronze",
  // "brown",
  // "crimson",
  // "cyan",
  // "gold",
  // "grass",
  // "gray",
  // "green",
  // "indigo",
  // "iris",
  // "jade",
  // "lime",
  // "mint",
  // "orange",
  // "pink",
  // "plum",
  // "purple",
  // "red",
  // "ruby",
  // "sky",
  // "teal",
  // "tomato",
  // "violet",
  // "yellow",
] as const;

const ThemeContext = createContext<ThemeContextInterface | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [colorScheme, setColorScheme] = useState<ThemeMode | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    if (stored) {
      setColorScheme(stored);
    } else {
      const colorScheme = systemPrefersDark ? "dark" : "light";
      setColorScheme(colorScheme);
      localStorage.setItem("theme", colorScheme);
    }
  }, []);

  useEffect(() => {
    if (!colorScheme) return;
    localStorage.setItem("theme", colorScheme);
  }, [colorScheme]);

  const setTheme = (mode: ThemeMode) => {
    setColorScheme(mode);
    localStorage.setItem("theme", mode);
  };

  const toggleTheme = () => {
    setTheme(colorScheme === "light" ? "dark" : "light");
  };

  if (!colorScheme) return null;

  const themeProps: ThemeProps = {
    appearance: colorScheme,
    accentColor: "gray",
    // accentColors[Math.floor(Math.random() * accentColors.length - 1)],
    grayColor: "auto",
    panelBackground: "translucent",
    scaling: "95%",
    radius: "medium",
  };

  return (
    <ThemeContext.Provider value={{ theme: colorScheme, themeProps, setTheme, toggleTheme }}>
      <Theme
        appearance={colorScheme}
        // accentColor={
        // accentColors[Math.floor(Math.random() * accentColors.length - 1)]
        // }
        accentColor="gray"
        grayColor="auto"
        panelBackground="translucent"
        scaling="95%"
        radius="medium"
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextInterface => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
