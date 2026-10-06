"use client";

import { useImmersiveSupport, useModelElementSupport } from "@/hooks/use-immersive-support";
import { FlipCard } from "./flip-card";
import styles from "./card.module.css";

export function SpatialCard() {
  const modelSupported = useModelElementSupport();
  const immersive = useImmersiveSupport();

  const spatial = modelSupported ? (
    <>
      <model className={styles.spatialModel} stagemode="orbit" aria-label="Sicheng Ouyang’s business card in 3D. Pinch and drag to rotate.">
        <source src="/models/card.usdz" type="model/vnd.usdz+zip" />
      </model>
      <p className={styles.instructions}>Pinch and drag to turn the card</p>
    </>
  ) : undefined;

  return <FlipCard immersive={immersive} spatial={spatial} />;
}
