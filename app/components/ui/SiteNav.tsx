import { Flex, IconButton, Link, Separator } from "@radix-ui/themes";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useState } from "react";

import { NW } from "./NW";
import { useTheme } from "./ThemeContext";
import { BreadCrumbs } from "./BreadCrumbs/BreadCrumbs";
import { ThemeToggle } from "./ThemeToggle/ThemeToggle";

interface SiteNavProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}


export const SiteNav = ({ isSidebarOpen, onToggleSidebar }: SiteNavProps = {}) => {
  const { theme } = useTheme();
  const [isChecked, setIsChecked] = useState(theme === "dark");

  const handleChecked = (value: boolean) => {
    setIsChecked(value);
  };

  function HamburgerButton({ onToggle, isOpen }: { onToggle?: () => void; isOpen?: boolean }) {
    if (!onToggle) return null;
    return (
      <Flex>
        <IconButton
          variant="ghost"
          radius="full"
          size="3"
          onClick={onToggle}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <PanelRightOpen /> : <PanelRightClose />}

        </IconButton>
      </Flex>
    );
  }


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
        // backgroundColor: "var(--accent-2)",
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
        <BreadCrumbs />
      </Flex>
      <Flex align="center" gap="3">
        <ThemeToggle checked={isChecked} onCheckedChange={handleChecked} />
        {isSidebarOpen !== undefined && onToggleSidebar && <Separator orientation="vertical" m="2" />}
        {isSidebarOpen !== undefined && onToggleSidebar && <HamburgerButton onToggle={onToggleSidebar} isOpen={isSidebarOpen} />}

      </Flex>
    </Flex>
  );
};
