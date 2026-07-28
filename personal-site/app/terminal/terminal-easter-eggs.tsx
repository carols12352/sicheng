"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import styles from "./terminal.module.css";

export type EasterEggVariant = "kernel" | "matrix" | "rickroll";

type TerminalEasterEggProps = {
  variant: EasterEggVariant | null;
  onClose: () => void;
};

const GLYPHS = "01/$#;[]{}<>*+";

export default function TerminalEasterEgg({ variant, onClose }: TerminalEasterEggProps) {
  useEffect(() => {
    if (!variant) return;
    const close = () => onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [variant, onClose]);

  return (
    <AnimatePresence>
      {variant ? (
        <motion.div
          className={styles.easterEgg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {variant === "kernel" ? (
            <motion.div
              className={styles.kernelPanic}
              initial={{ filter: "blur(3px)", scale: 1.01 }}
              animate={{ filter: "blur(0px)", scale: 1 }}
            >
              <p>[ 0.000000] Kernel panic — destructive root operation blocked</p>
              <p>[ 0.000042] policy_guard: protected filesystem target &quot;/&quot;</p>
              <p>[ 0.000404] recovery: read-only snapshot mounted; rollback complete</p>
              <pre>{`TARGET   /
ACTION   rm -rf
RESULT   denied by policy_guard`}</pre>
              <span>Press any key to restart the shell</span>
            </motion.div>
          ) : variant === "rickroll" ? (
            <motion.div
              className={styles.rickroll}
              initial={{ rotate: -2, scale: 0.86 }}
              animate={{ rotate: [0, 1.5, -1.5, 0], scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.rickPortrait} aria-hidden="true">
                <span>♪</span><span>♫</span><strong>ಠ‿ಠ</strong><span>♫</span><span>♪</span>
              </div>
              <p>definitely-not-a-rickroll.url</p>
              <h2>Trust issues unlocked.</h2>
              <small>Never gonna give you up.</small>
              <button type="button" onClick={onClose}>I should have known</button>
            </motion.div>
          ) : (
            <div className={styles.matrixRain} aria-hidden="true">
              {Array.from({ length: 42 }, (_, index) => (
                <motion.span
                  key={index}
                  style={{ left: `${(index * 37) % 100}%` }}
                  initial={{ y: "-20vh", opacity: 0 }}
                  animate={{ y: "115vh", opacity: [0, 0.85, 0] }}
                  transition={{ duration: 2.2 + (index % 7) * 0.23, delay: (index % 11) * 0.08, repeat: Infinity, ease: "linear" }}
                >
                  {GLYPHS[index % GLYPHS.length]}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
