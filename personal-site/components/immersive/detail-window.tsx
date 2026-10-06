"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Item } from "./items";
import { inRect, windowTexture } from "./textures";
import { useTheme } from "./theme";
import { Spring, Spring3, SPRINGS } from "./spring";
import { pitchOf, useDrag, yawOf } from "./use-drag";

const WIDTH = 0.64;
const OPEN_DISTANCE = 0.78;

function direction(yaw: number, pitch: number, target: THREE.Vector3) {
  return target.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
}

const scratch = { direction: new THREE.Vector3(), target: new THREE.Vector3() };

type DetailWindowProps = {
  item: Item;
  from: THREE.Vector3;
  open: boolean;
  inXR: boolean;
  reduceMotion: boolean;
  onClose: () => void;
  onGone: () => void;
};

/**
 * A free-floating window that grows out of the tile that opened it. It lives in
 * world space, so swiping the ring leaves it where the viewer put it.
 */
export function DetailWindow({ item, from, open, inXR, reduceMotion, onClose, onGone }: DetailWindowProps) {
  const theme = useTheme();
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const bar = useRef<THREE.MeshBasicMaterial>(null);
  const live = useRef({
    placed: false,
    gone: false,
    progress: new Spring(0, SPRINGS.bouncy),
    place: new Spring3(new THREE.Vector3(), { response: 0.2, damping: 1 }),
    center: new THREE.Vector3(),
    yaw: 0,
    pitch: 0,
    distance: OPEN_DISTANCE,
    grabYaw: 0,
    grabPitch: 0,
    grabDistance: OPEN_DISTANCE,
    grabPointer: new THREE.Vector3(),
  });
  const content = useMemo(() => windowTexture(item.window, WIDTH, theme), [item, theme]);
  useEffect(() => () => content.texture.dispose(), [content]);

  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open, onClose]);

  const drag = useDrag({
    onTap(event) {
      if (event.object.name === "WindowFace" && event.uv && inRect(event.uv, content.closeRect)) onClose();
    },
    onDragStart(event) {
      const state = live.current;
      state.grabYaw = state.yaw - yawOf(event.ray.direction);
      state.grabPitch = state.pitch - pitchOf(event.ray.direction);
      state.grabDistance = state.distance;
      const pointer = (event as unknown as { pointerPosition?: THREE.Vector3 }).pointerPosition;
      state.grabPointer.copy(pointer ?? event.ray.origin);
    },
    onDrag(event, start) {
      const state = live.current;
      state.yaw = yawOf(event.ray.direction) + state.grabYaw;
      state.pitch = THREE.MathUtils.clamp(pitchOf(event.ray.direction) + state.grabPitch, -0.7, 0.7);
      const pointer = (event as unknown as { pointerPosition?: THREE.Vector3 }).pointerPosition;
      if (inXR && pointer) {
        const pull = -scratch.direction.copy(pointer).sub(state.grabPointer).dot(start.direction) * 3;
        state.distance = THREE.MathUtils.clamp(state.grabDistance - pull, 0.5, 2.2);
      }
    },
  });

  useFrame((frame, delta) => {
    const node = group.current;
    if (!node) return;
    const state = live.current;
    if (!state.placed) {
      frame.camera.getWorldPosition(state.center);
      frame.camera.getWorldDirection(scratch.direction);
      state.yaw = yawOf(scratch.direction);
      state.pitch = THREE.MathUtils.clamp(pitchOf(scratch.direction) + 0.1, -0.02, 0.3);
      state.placed = true;
      state.place.snap(direction(state.yaw, state.pitch, scratch.target).multiplyScalar(state.distance).add(state.center));
    }

    state.progress.target = open ? 1 : 0;
    state.progress.config = open ? { response: 0.5, damping: 0.78 } : { response: 0.32, damping: 1 };
    const t = Math.max(0, state.progress.step(delta, reduceMotion));
    if (!open && t < 0.01 && !state.gone) {
      state.gone = true;
      onGone();
    }

    direction(state.yaw, state.pitch, state.place.target).multiplyScalar(state.distance).add(state.center);
    const place = state.place.step(delta, reduceMotion);
    const clamped = Math.min(1, t);
    node.position.lerpVectors(from, place, clamped);
    node.scale.setScalar(THREE.MathUtils.lerp(0.08, 1, t));
    node.lookAt(state.center);
    if (material.current) material.current.opacity = Math.min(1, t * 1.6);
    if (bar.current) bar.current.opacity = 0.6 * clamped;
  });

  return (
    <group ref={group} position={from} scale={0.12} {...drag}>
      <mesh name="WindowFace" renderOrder={5}>
        <planeGeometry args={[WIDTH, content.height]} />
        <meshBasicMaterial ref={material} map={content.texture} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -content.height / 2 - 0.028, 0]} renderOrder={5}>
        <planeGeometry args={[0.15, 0.011]} />
        <meshBasicMaterial ref={bar} color={theme.muted} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -content.height / 2 - 0.028, 0]}>
        <planeGeometry args={[0.3, 0.05]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </group>
  );
}
