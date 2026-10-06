"use client";

import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { createCardObject } from "./card-object";

type CardModelProps = ThreeElements["group"] & {
  width?: number;
  float?: boolean;
};

export function CardModel({ width = 0.3, float = true, ...props }: CardModelProps) {
  const [card] = useState(() => createCardObject(width));
  const [flipped, setFlipped] = useState(false);
  const spin = useRef<Group>(null);

  useEffect(() => () => card.dispose(), [card]);

  useFrame((state, delta) => {
    const node = spin.current;
    if (!node) return;
    const target = flipped ? Math.PI : 0;
    node.rotation.y += (target - node.rotation.y) * Math.min(1, delta * 6);
    if (float) {
      const time = state.clock.elapsedTime;
      node.position.y = Math.sin(time * 0.9) * 0.012;
      node.rotation.x = Math.sin(time * 0.6) * 0.06;
    } else {
      node.position.y = 0;
      node.rotation.x = 0;
    }
  });

  return (
    <group {...props}>
      <group
        ref={spin}
        onClick={(event) => {
          event.stopPropagation();
          setFlipped((value) => !value);
        }}
      >
        <primitive object={card.group} />
      </group>
    </group>
  );
}
