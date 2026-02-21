"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";

type ZoomableImageProps = React.ComponentPropsWithoutRef<"img">;

export function ZoomableImage({ alt = "", className, ...props }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useAppReducedMotion();
  const layoutId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onScroll = () => setOpen(false);

    document.body.style.overflow = "hidden";
    const previousFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      previousFocused?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-8 block w-full cursor-zoom-in"
      >
        <motion.div
          layoutId={reduceMotion ? undefined : layoutId}
          className={`mx-auto overflow-hidden rounded-md border border-gray-200 ${className ?? ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="w-full" alt={alt} {...props} />
        </motion.div>
      </button>

      <AnimatePresence initial={!reduceMotion}>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
           
           
           
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              ref={dialogRef}
              layoutId={reduceMotion ? undefined : layoutId}
              className="relative max-h-[88vh] max-w-[92vw] overflow-hidden rounded-md shadow-2xl"
             
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-3 top-3 rounded border border-white/60 bg-black/55 px-2 py-1 text-xs text-white"
                onClick={() => setOpen(false)}
               
              >
                Close
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="max-h-[88vh] w-auto max-w-[92vw]" alt={alt} {...props} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
