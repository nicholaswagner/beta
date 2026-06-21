import { Flex, IconButton, Link, Separator } from "@radix-ui/themes";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useState } from "react";

import { NW } from "./NW";
import { useTheme } from "../../ThemeContext";
import { BreadCrumbs } from "../BreadCrumbs/BreadCrumbs";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

import styles from "./SiteNav.module.css";


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
      justify="between"
      px={{ initial: "4", sm: "6", lg: "8" }}
      className={styles.siteNav}
    >
      <Flex align="center" gapX={{ initial: "6" }}>
        <Link href="/beta/" target="_self" aria-label="Home">
          <NW
            style={{
              height: "auto",
              width: "3rem",
            }}
            variant="chonky"
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
    </Flex >
  );
};
