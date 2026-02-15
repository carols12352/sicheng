"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { variants } from "@/lib/motion";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";

type Props = {
  className?: string;
  children: React.ReactNode;
};

type RevealSectionProps = Props & {
  tone?: "hero" | "section";
};

export function RevealSection({
  className,
  children,
  tone = "section",
}: RevealSectionProps) {
  const reduceMotion = useAppReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [forceVisible, setForceVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForceVisible(true);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [inView]);

  if (reduceMotion) {
    return <section className={className}>{children}</section>;
  }

  const visible = inView || forceVisible;
  const sectionVariant = tone === "hero" ? variants.hero : variants.section;

  return (
    <motion.section
      ref={ref}
      className={className}
      variants={sectionVariant}
      initial="hidden"
      animate={visible ? "show" : "hidden"}
    >
      {children}
    </motion.section>
  );
}

export function RevealStagger({ className, children }: Props) {
  const reduceMotion = useAppReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [forceVisible, setForceVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForceVisible(true);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [inView]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const visible = inView || forceVisible;

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants.stagger}
      initial="hidden"
      animate={visible ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ className, children }: Props) {
  const reduceMotion = useAppReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={variants.item}>
      {children}
    </motion.div>
  );
}
