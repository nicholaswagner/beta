import { Box, Flex, IconButton, Link } from "@radix-ui/themes";
import { Hamburger } from "lucide-react";
import { useState } from "react";

import { NW } from "./NW";
import { useTheme } from "./ThemeContext";
import { BreadCrumbs } from "./BreadCrumbs/BreadCrumbs";
import { ThemeToggle } from "./ThemeToggle/ThemeToggle";

interface SiteNavProps {
  onMenuClick?: () => void;
}

export const SiteNav = ({ onMenuClick }: SiteNavProps = {}) => {
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
      px={{ initial: "6", lg: "0" }}
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
      <Flex align="center" justify="start" gapX={{ initial: "6" }}>
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
        <BreadCrumbs />
      </Flex>
      <Flex align="center" gap="3">
        <ThemeToggle checked={isChecked} onCheckedChange={handleChecked} />
        {onMenuClick && (
          <Box display={{ initial: "block", lg: "none" }}>
            <IconButton
              variant="ghost"
              // color="gray"
              radius="full"
              size="3"
              onClick={onMenuClick}
              aria-label="Open sidebar"
            >
              {/* <Menu size={18} /> */}
              <Hamburger />
            </IconButton>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};
