"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { sceneState } from "./scene-state";
import { radialTexture } from "./textures";
import { useTheme } from "./theme";

/** Centre of the plinth's top surface, in the ring's space. */
export const PLINTH_TOP = new THREE.Vector3(0, 0.98, -0.95);
export const PLINTH_RADIUS = 0.44;
const THICKNESS = 0.018;

/** A floating disc at standing-desk height that holds the objects you can pick up. */
export function Plinth({ children, reduceMotion }: { children: ReactNode; reduceMotion: boolean }) {
  const theme = useTheme();
  const group = useRef<THREE.Group>(null);
  const glow = useMemo(() => radialTexture(theme.accent, theme.scheme === "dark" ? 0.35 : 0.22), [theme]);
  const shadow = useMemo(() => radialTexture(theme.scheme === "dark" ? "#000000" : "#6b7280", theme.scheme === "dark" ? 0.6 : 0.25), [theme]);
  useEffect(() => () => {
    glow.dispose();
    shadow.dispose();
  }, [glow, shadow]);

  useFrame(() => {
    if (!group.current) return;
    const t = 1 - Math.pow(1 - THREE.MathUtils.clamp(sceneState.entrance * 1.6 - 0.2, 0, 1), 3);
    group.current.position.y = PLINTH_TOP.y - (reduceMotion ? 0 : (1 - t) * 0.12);
    group.current.scale.setScalar(0.001 + t * 0.999);
  });

  return (
    <>
      <mesh position={[PLINTH_TOP.x, 0.002, PLINTH_TOP.z]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[PLINTH_RADIUS * 2.6, PLINTH_RADIUS * 2.6]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={group} position={[PLINTH_TOP.x, PLINTH_TOP.y, PLINTH_TOP.z]}>
        <mesh position={[0, -THICKNESS / 2, 0]} raycast={() => null}>
          <cylinderGeometry args={[PLINTH_RADIUS, PLINTH_RADIUS * 0.96, THICKNESS, 96]} />
          <meshStandardMaterial color={theme.plinth} roughness={0.35} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.0004, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <ringGeometry args={[PLINTH_RADIUS - 0.004, PLINTH_RADIUS, 128]} />
          <meshBasicMaterial color={theme.accent} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.0004, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <ringGeometry args={[PLINTH_RADIUS * 0.82, PLINTH_RADIUS * 0.82 + 0.0016, 128]} />
          <meshBasicMaterial color={theme.line} toneMapped={false} />
        </mesh>
        <mesh position={[0, -THICKNESS - 0.004, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
          <planeGeometry args={[PLINTH_RADIUS * 2.4, PLINTH_RADIUS * 2.4]} />
          <meshBasicMaterial map={glow} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
        {children}
      </group>
    </>
  );
}
