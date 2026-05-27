import { Flex, IconButton, Link, Separator } from "@radix-ui/themes";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleChecked = (value: boolean) => {
    setIsChecked(value);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
    onMenuClick?.();
  };

  function HamburgerButton({ onMenuClick, isSidebarOpen }: { onMenuClick?: () => void; isSidebarOpen: boolean }) {
    if (!onMenuClick) return null;
    return (
      <Flex>
        <IconButton
          variant="ghost"
          radius="full"
          size="3"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          {isSidebarOpen ? <PanelRightOpen /> : <PanelRightClose />}

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
        {onMenuClick && <Separator orientation="vertical" m="2" />}
        {onMenuClick && <HamburgerButton onMenuClick={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />}
      </Flex>
    </Flex>
  );
};
