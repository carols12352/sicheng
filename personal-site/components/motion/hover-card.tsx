"use client";

import { motion } from "framer-motion";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";

type HoverCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function HoverCard({ children, className }: HoverCardProps) {
  const reduceMotion = useAppReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{
        y: -6,
        scale: 1.01,
        boxShadow: "0 14px 32px -20px rgba(15, 23, 42, 0.45)",
      }}
      whileTap={{ scale: 0.995 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 26,
        mass: 0.35,
      }}
    >
      {children}
    </motion.div>
  );
}
