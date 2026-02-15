export const MOTION = {
  duration: {
    micro: 0.18,
    hero: 1.35,
    section: 1.1,
    page: 0.6,
    stagger: 0.12,
  },
  easeOut: [0.16, 1, 0.3, 1] as const,
  y: {
    page: 2,
    hero: 4,
    section: 3,
    hover: -1,
  },
};

export const variants = {
  page: {
    initial: { opacity: 0, y: MOTION.y.page },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION.duration.page,
        ease: MOTION.easeOut,
      },
    },
  },
  hero: {
    hidden: { opacity: 0, y: MOTION.y.hero },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION.duration.hero,
        delay: 0.08,
        ease: MOTION.easeOut,
      },
    },
  },
  section: {
    hidden: { opacity: 0, y: MOTION.y.section },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION.duration.section,
        ease: MOTION.easeOut,
      },
    },
  },
  articleHorizontal: {
    fromRight: {
      initial: { opacity: 0, x: 6 },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration: MOTION.duration.page,
          ease: MOTION.easeOut,
        },
      },
    },
    fromLeft: {
      initial: { opacity: 0, x: -6 },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration: MOTION.duration.page,
          ease: MOTION.easeOut,
        },
      },
    },
  },
  stagger: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: MOTION.duration.stagger,
        delayChildren: 0.04,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: MOTION.y.section },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: MOTION.easeOut,
      },
    },
  },
};
