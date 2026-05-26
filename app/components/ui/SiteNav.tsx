import { Flex, Link } from "@radix-ui/themes";
import { useState } from "react";

// import profileImage from "../../../assets/pixelized_profile.png";
import { NW } from "./NW";
import { useTheme } from "./ThemeContext";
// import { BreadCrumbs } from "../breadcrumbs/BreadCrumbs";
import { ThemeToggle } from "./ThemeToggle/ThemeToggle";

export const SiteNav = () => {
  const { theme } = useTheme();
  const [isChecked, setIsChecked] = useState(theme === "dark");
  const handleChecked = (value: boolean) => {
    setIsChecked(value);
  };

  return (
    <Flex
      direction="row"
      justify="between"
      align="center"
      mt={{ initial: "2" }}
      py={{ initial: "1" }}
      px={{ initial: "6" }}
      style={{
        transition: "var(--transition-stuff)",
        backgroundColor: "var(--color-background)",
        height: "4rem",
        width: "100%",
        // position: "sticky",
        // left: 0,
        // top: 0,
        // zIndex: 5,
      }}
    >
      <Flex align="center" gapX={{ initial: "6" }}>
        <Link href="/beta/" target="_self">
          <NW
            style={{
              color: "var(--accent-11)",
              height: "auto",
              width: "3rem",
            }}
            className="nwLink"
          />
        </Link>
        {/* <BreadCrumbs /> */}
      </Flex>
      <ThemeToggle checked={isChecked} onCheckedChange={handleChecked} />
    </Flex>
  );
};
