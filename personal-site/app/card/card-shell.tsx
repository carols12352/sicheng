"use client";

import { useImmersiveSupport } from "@/hooks/use-immersive-support";
import { FlipCard } from "./flip-card";

export function CardShell() {
  return <FlipCard immersive={useImmersiveSupport()} />;
}
