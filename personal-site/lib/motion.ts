export const MOTION = {
  duration: {
    micro: 0.18,
    hero: 1.3,
    section: 0.85,
    page: 2,
    stagger: 0.16,
  },
  easeOut: [0.16, 1, 0.3, 1] as const,
  y: {
    page: 3,
    hero: 4,
    section: 4,
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
        delay: 0.18,
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
      initial: { opacity: 0, x: 14 },
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
      initial: { opacity: 0, x: -14 },
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
        duration: 0.82,
        ease: MOTION.easeOut,
      },
    },
  },
};
