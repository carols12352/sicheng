export const DETAIL_WINDOW_DURATION = 0.3;
export const DETAIL_WINDOW_TRANSITION = {
  type: "tween" as const,
  duration: DETAIL_WINDOW_DURATION,
  ease: [0.22, 1, 0.36, 1] as const,
};
