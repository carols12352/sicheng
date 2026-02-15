"use client";

import { motion } from "framer-motion";
import { variants } from "@/lib/motion";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";

type SlideInProps = {
  children: React.ReactNode;
  direction?: "left" | "right";
  className?: string;
};

export function SlideIn({ children, direction = "right", className }: SlideInProps) {
  const reduceMotion = useAppReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const preset = direction === "left"
    ? variants.articleHorizontal.fromLeft
    : variants.articleHorizontal.fromRight;

  return (
    <motion.div
      className={className}
      initial={preset.initial}
      animate={preset.animate}
    >
      {children}
    </motion.div>
  );
}
