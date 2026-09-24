"use client";

import { motion, useIsPresent } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";
import { DETAIL_WINDOW_TRANSITION } from "./detail-window-motion";
import styles from "./detail-window.module.css";

type DetailWindowProps = {
  title: string;
  titleId: string;
  layoutId: string;
  children: ReactNode;
  onClose: () => void;
  onMinimizedChange: (minimized: boolean) => void;
};

export function DetailWindow({ title, titleId, layoutId, children, onClose, onMinimizedChange }: DetailWindowProps) {
  const isPresent = useIsPresent();
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useAppReducedMotion();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    if (!mounted) return;
    if (minimized) {
      restoreRef.current?.focus();
      return;
    }
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!openerRef.current) openerRef.current = previousFocus;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => dialogRef.current?.focus({ preventScroll: true }));
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]',
      ) ?? []);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
        event.preventDefault(); first.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      else if (openerRef.current?.isConnected) openerRef.current.focus({ preventScroll: true });
    };
  }, [mounted, minimized, onClose]);

  if (!mounted) return null;

  return createPortal(
    minimized ? (
      <motion.div className={styles.dock} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button ref={restoreRef} className={styles.restore} onClick={() => { setMinimized(false); onMinimizedChange(false); }} aria-label={`Restore ${title}`}>
          <span aria-hidden="true">▣</span><span>{title}</span><span aria-hidden="true">↗</span>
        </button>
        <button className={styles.dockClose} onClick={onClose} aria-label={`Close ${title}`}>×</button>
      </motion.div>
    ) : (
      <motion.div
        layoutRoot
        className={`${styles.stage} ${expanded ? styles.stageExpanded : ""}`}
        initial={false}
        onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      >
        <motion.div
          className={styles.backdrop}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ...DETAIL_WINDOW_TRANSITION, duration: reduceMotion ? 0 : DETAIL_WINDOW_TRANSITION.duration }}
          onClick={onClose}
        />
        <motion.section
          ref={dialogRef}
          layoutId={reduceMotion ? undefined : layoutId}
          className={`${styles.window} ${expanded ? styles.expanded : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={false}
          transition={{ ...DETAIL_WINDOW_TRANSITION, duration: reduceMotion ? 0 : DETAIL_WINDOW_TRANSITION.duration }}
        >
          <motion.div layout={reduceMotion ? false : "position"} className={styles.content} transition={{ ...DETAIL_WINDOW_TRANSITION, duration: reduceMotion ? 0 : DETAIL_WINDOW_TRANSITION.duration }}>
          <div
            className={`${styles.content} ${styles.contentReveal}`}
            data-reduced-motion={reduceMotion}
            data-exiting={!isPresent}
            data-detail-window-content
          >
          <header className={styles.titlebar} onDoubleClick={(event) => {
            if (!(event.target as HTMLElement).closest("button")) setExpanded((value) => !value);
          }}>
            <div className={styles.controls}>
              <button className={styles.close} aria-label="Close window" title="Close" onClick={onClose}><span>×</span></button>
              <button className={styles.minimize} aria-label="Minimize window" title="Minimize" onClick={() => { setMinimized(true); onMinimizedChange(true); }}><span>−</span></button>
              <button className={styles.zoom} aria-label={expanded ? "Restore window size" : "Expand window"} title={expanded ? "Restore" : "Expand"} aria-pressed={expanded} onClick={() => setExpanded((value) => !value)}><span>{expanded ? "↙" : "↗"}</span></button>
            </div>
            <p className={styles.windowTitle}>{title}</p>
            <span className={styles.toolbarSpacer} aria-hidden="true" />
          </header>
          <div className={styles.body}>{children}</div>
          </div>
          </motion.div>
        </motion.section>
      </motion.div>
    ), document.body,
  );
}
