"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { Ray } from "three";

export type DragEvent = ThreeEvent<PointerEvent>;

type Capturable = {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
};

type DragHandlers = {
  onTap?: (event: DragEvent) => void;
  onDragStart?: (event: DragEvent, start: Ray) => void;
  onDrag?: (event: DragEvent, start: Ray) => void;
  onDragEnd?: (event: DragEvent) => void;
  /** Angle in radians the pointer ray must turn before a press counts as a drag. */
  threshold?: number;
  disabled?: boolean;
};

type ActiveDrag = {
  pointerId: number;
  start: Ray;
  dragging: boolean;
};

/**
 * Tap versus drag on a 3D object, shared by mouse, touch, controller rays and
 * visionOS transient pointers. Works on ray angles so it behaves the same at any distance.
 */
/** Capture throws for pointers the browser no longer considers active; losing capture is harmless. */
function capture(event: DragEvent, on: boolean) {
  const target = event.target as Capturable;
  try {
    if (on) target.setPointerCapture?.(event.pointerId);
    else target.releasePointerCapture?.(event.pointerId);
  } catch {}
}

export function useDrag({ onTap, onDragStart, onDrag, onDragEnd, threshold = 0.025, disabled = false }: DragHandlers) {
  const active = useRef<ActiveDrag | null>(null);

  function finish(event: DragEvent, cancelled: boolean) {
    const drag = active.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.stopPropagation();
    capture(event, false);
    active.current = null;
    if (drag.dragging) onDragEnd?.(event);
    else if (!cancelled) onTap?.(event);
  }

  return {
    onPointerDown(event: DragEvent) {
      if (disabled || active.current) return;
      event.stopPropagation();
      capture(event, true);
      active.current = { pointerId: event.pointerId, start: event.ray.clone(), dragging: false };
    },
    onPointerMove(event: DragEvent) {
      const drag = active.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.stopPropagation();
      if (!drag.dragging && event.ray.direction.angleTo(drag.start.direction) > threshold) {
        drag.dragging = true;
        onDragStart?.(event, drag.start);
      }
      if (drag.dragging) onDrag?.(event, drag.start);
    },
    onPointerUp(event: DragEvent) {
      finish(event, false);
    },
    onPointerCancel(event: DragEvent) {
      finish(event, true);
    },
  };
}

export function yawOf(direction: { x: number; z: number }) {
  return Math.atan2(direction.x, -direction.z);
}

export function pitchOf(direction: { x: number; y: number; z: number }) {
  return Math.atan2(direction.y, Math.hypot(direction.x, direction.z));
}

export function wrapAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
