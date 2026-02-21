"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type SidenoteProps = {
  children: ReactNode;
  label?: string;
};

const DESKTOP_COLLAPSED_HEIGHT_REM = 3.35;

export function Sidenote({ children, label = "Note" }: SidenoteProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const [desktopOverflow, setDesktopOverflow] = useState(false);
  const desktopContentRef = useRef<HTMLSpanElement | null>(null);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const canCollapseDesktop = desktopOverflow;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(min-width: 1100px)").matches) {
      return;
    }

    const node = desktopContentRef.current;
    if (!node) {
      return;
    }

    const updateOverflow = () => {
      const rootFontSize = Number.parseFloat(
        window.getComputedStyle(document.documentElement).fontSize || "16",
      );
      const collapsedMaxHeight = DESKTOP_COLLAPSED_HEIGHT_REM * rootFontSize;
      setDesktopOverflow(node.scrollHeight - collapsedMaxHeight > 1);
    };

    updateOverflow();
    const observer = new ResizeObserver(() => updateOverflow());
    observer.observe(node);
    window.addEventListener("resize", updateOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [children]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleMarkerClick = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1100px)").matches) {
      if (!desktopOverflow) {
        return;
      }
      setDesktopExpanded((value) => !value);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <span className="sidenote-anchor">
        <span className="sidenote-mobile-inline">
          <button
            type="button"
            className="sidenote-trigger"
            onClick={handleMarkerClick}
            aria-haspopup="dialog"
            aria-expanded={open || desktopExpanded}
            aria-label={`Open note: ${label}`}
          />
        </span>

        <span className="sidenote-desktop" role="note" aria-label={label}>
          <span className="sidenote-desktop-label">{label}</span>
          <span
            ref={desktopContentRef}
            className={`sidenote-desktop-content${
              !desktopExpanded && desktopOverflow ? " sidenote-desktop-content-collapsed" : ""
            }`}
          >
            {children}
          </span>
          {canCollapseDesktop ? (
            <button
              type="button"
              className="sidenote-desktop-toggle"
              onClick={() => setDesktopExpanded((value) => !value)}
              aria-expanded={desktopExpanded}
            >
              {desktopExpanded ? "Collapse" : "Expand"}
            </button>
          ) : null}
        </span>

        <button
          type="button"
          className="sidenote-desktop-marker"
          onClick={handleMarkerClick}
          aria-haspopup="dialog"
          aria-expanded={open || desktopExpanded}
          aria-label={`Open note: ${label}`}
        />
      </span>

      {open && isClient
        ? createPortal(
          <div className="sidenote-overlay" onClick={() => setOpen(false)}>
            <aside
              className="sidenote-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sidenote-sheet-head">
                <p id={titleId} className="sidenote-label">{label}</p>
                <button type="button" onClick={() => setOpen(false)} className="sidenote-close" aria-label={`Close note: ${label}`}>
                  Close
                </button>
              </div>
              <div className="sidenote-sheet-content">{children}</div>
            </aside>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}
