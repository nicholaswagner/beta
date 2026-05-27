import { Flex, IconButton } from "@radix-ui/themes";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";

import styles from "./sidebar.module.css";

interface SidebarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ariaLabel: string;
  children: ReactNode;
}

export function SidebarDrawer({ open, onOpenChange, ariaLabel, children }: SidebarDrawerProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (open) onOpenChange(false);
    // Intentionally omit onOpenChange from deps — we only react to pathname.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <>
      <div
        className={styles.sbDrawerBackdrop}
        data-open={open}
        onClick={() => onOpenChange(false)}
      />
      <aside
        className={styles.sbDrawer}
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <Flex justify="end" p="2">
          <IconButton
            variant="ghost"
            color="gray"
            size="2"
            onClick={() => onOpenChange(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </IconButton>
        </Flex>
        {children}
      </aside>
    </>
  );
}
