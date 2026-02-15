"use client";

import { useReducedMotion } from "framer-motion";

export function useAppReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}
