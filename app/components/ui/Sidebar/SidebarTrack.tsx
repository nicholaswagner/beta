import { useEffect, useRef, type RefObject } from "react";
import { useLocation } from "react-router";

export function SidebarTrack({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const update = () => {
      const active = container.querySelector<HTMLElement>("[aria-current='page']");
      if (!active) {
        track.style.setProperty("--track-top", "0px");
        track.style.setProperty("--track-bottom", "0px");
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const top = activeRect.top - containerRect.top;
      const bottom = top + activeRect.height;
      track.style.setProperty("--track-top", `${top}px`);
      track.style.setProperty("--track-bottom", `${bottom}px`);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(container);
    container.querySelectorAll("*").forEach((el) => ro.observe(el));

    return () => ro.disconnect();
  }, [pathname, containerRef]);

  return <div ref={trackRef} className="sb-track" aria-hidden="true" />;
}
