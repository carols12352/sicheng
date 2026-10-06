"use client";

import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useDrag, type DragEvent } from "./use-drag";

type GrabHandlers = {
  /** The object being grabbed; positions are reported in its parent's space. */
  target: RefObject<THREE.Object3D | null>;
  onTap?: (event: DragEvent) => void;
  onGrab?: () => void;
  onMove: (position: THREE.Vector3) => void;
  onRelease?: (velocity: THREE.Vector3) => void;
  disabled?: boolean;
};

type Sample = { time: number; position: THREE.Vector3 };

const scratch = new THREE.Vector3();

/**
 * Pick an object up along the pointer ray and keep it at the distance it was grabbed from,
 * so it works the same with a mouse, a controller or a pinch. Release reports a throw velocity.
 */
export function useGrab({ target, onTap, onGrab, onMove, onRelease, disabled }: GrabHandlers) {
  const live = useRef({ distance: 1, samples: [] as Sample[] });

  function report(event: DragEvent) {
    const object = target.current;
    if (!object?.parent) return;
    const world = scratch.copy(event.ray.direction).multiplyScalar(live.current.distance).add(event.ray.origin);
    const local = object.parent.worldToLocal(world.clone());
    const samples = live.current.samples;
    samples.push({ time: performance.now(), position: local.clone() });
    if (samples.length > 8) samples.shift();
    onMove(local);
  }

  return useDrag({
    disabled,
    threshold: 0.012,
    onTap,
    onDragStart(event) {
      const object = target.current;
      if (!object) return;
      live.current.distance = object.getWorldPosition(scratch).distanceTo(event.ray.origin);
      live.current.samples = [];
      onGrab?.();
      report(event);
    },
    onDrag: report,
    onDragEnd() {
      const samples = live.current.samples;
      const now = performance.now();
      const recent = samples.filter((sample) => now - sample.time < 120);
      const velocity = new THREE.Vector3();
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const seconds = Math.max((last.time - first.time) / 1000, 1 / 120);
        velocity.subVectors(last.position, first.position).divideScalar(seconds);
      }
      onRelease?.(velocity.clampLength(0, 6));
    },
  });
}
