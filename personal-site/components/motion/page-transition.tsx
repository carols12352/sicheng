"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { variants } from "@/lib/motion";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";

type PageTransitionProps = {
  children: React.ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useAppReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div key={pathname} variants={variants.page} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}
