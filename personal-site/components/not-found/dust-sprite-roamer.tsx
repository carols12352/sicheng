"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type SegmentKind = "line" | "curve";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function reduceMotionEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    document.documentElement.dataset.motion === "none" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function randomInteriorPoint(): Point {
  return {
    x: 8 + Math.random() * 84,
    y: 12 + Math.random() * 78,
  };
}

function randomEdgePoint(): Point {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: -12, y: 8 + Math.random() * 84 };
  if (side === 1) return { x: 112, y: 8 + Math.random() * 84 };
  if (side === 2) return { x: 8 + Math.random() * 84, y: -14 };
  return { x: 8 + Math.random() * 84, y: 114 };
}

export function DustSpriteRoamer() {
  const [position, setPosition] = useState<Point>({ x: 86, y: 84 });
  const [startled, setStartled] = useState(false);
  const [escaping, setEscaping] = useState(false);
  const [hidden, setHidden] = useState(false);

  const positionRef = useRef<Point>({ x: 86, y: 84 });
  const rafRef = useRef<number | null>(null);
  const roamPauseRef = useRef<number | null>(null);
  const startledTimerRef = useRef<number | null>(null);
  const reenterTimerRef = useRef<number | null>(null);
  const cooldownRef = useRef(0);
  const fleeingRef = useRef(false);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (roamPauseRef.current !== null) {
      window.clearTimeout(roamPauseRef.current);
      roamPauseRef.current = null;
    }
    if (startledTimerRef.current !== null) {
      window.clearTimeout(startledTimerRef.current);
      startledTimerRef.current = null;
    }
    if (reenterTimerRef.current !== null) {
      window.clearTimeout(reenterTimerRef.current);
      reenterTimerRef.current = null;
    }
  }, []);

  const animateSegment = useCallback(
    (target: Point, totalMs: number, kind: SegmentKind, onDone?: () => void) => {
      if (reduceMotionEnabled()) {
        positionRef.current = target;
        setPosition(target);
        onDone?.();
        return;
      }

      stopAnimation();
      const start = positionRef.current;
      const offset = kind === "curve" ? (Math.random() - 0.5) * 24 : 0;
      const control =
        kind === "curve"
          ? {
            x: (start.x + target.x) / 2 + offset,
            y: (start.y + target.y) / 2 - offset * 0.6,
          }
          : null;
      const startedAt = performance.now();

      const frame = (now: number) => {
        const t = clamp((now - startedAt) / totalMs, 0, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        const oneMinus = 1 - eased;

        const next =
          kind === "curve" && control
            ? {
              x:
                oneMinus * oneMinus * start.x +
                2 * oneMinus * eased * control.x +
                eased * eased * target.x,
              y:
                oneMinus * oneMinus * start.y +
                2 * oneMinus * eased * control.y +
                eased * eased * target.y,
            }
            : {
              x: start.x + (target.x - start.x) * eased,
              y: start.y + (target.y - start.y) * eased,
            };

        positionRef.current = next;
        setPosition(next);

        if (t < 1) {
          rafRef.current = window.requestAnimationFrame(frame);
          return;
        }
        rafRef.current = null;
        onDone?.();
      };

      rafRef.current = window.requestAnimationFrame(frame);
    },
    [stopAnimation],
  );

  const startRoaming = useCallback(() => {
    if (reduceMotionEnabled() || fleeingRef.current) {
      return;
    }

    const travel = () => {
      if (fleeingRef.current) {
        return;
      }
      const next = randomInteriorPoint();
      const kind: SegmentKind = Math.random() < 0.46 ? "line" : "curve";
      animateSegment(next, 1700 + Math.random() * 2200, kind, () => {
        roamPauseRef.current = window.setTimeout(travel, 160 + Math.random() * 260);
      });
    };

    travel();
  }, [animateSegment]);

  const fleeFrom = useCallback(
    (clientX: number, clientY: number) => {
      if (reduceMotionEnabled() || fleeingRef.current) {
        return;
      }

      const now = Date.now();
      if (now - cooldownRef.current < 450) {
        return;
      }

      const spriteX = (positionRef.current.x / 100) * window.innerWidth;
      const spriteY = (positionRef.current.y / 100) * window.innerHeight;
      const dx = spriteX - clientX;
      const dy = spriteY - clientY;
      const distance = Math.hypot(dx, dy);
      if (distance > 140) {
        return;
      }

      cooldownRef.current = now;
      fleeingRef.current = true;
      clearTimers();
      stopAnimation();
      setStartled(true);

      const length = distance || 1;
      const nx = dx / length;
      const ny = dy / length;

      startledTimerRef.current = window.setTimeout(() => {
        setStartled(false);
        setEscaping(true);

        const projected = {
          x: clamp(positionRef.current.x + nx * 62, -18, 118),
          y: clamp(positionRef.current.y + ny * 62, -18, 118),
        };
        const edge = randomEdgePoint();
        const fleeTarget =
          Math.abs(projected.x - 50) + Math.abs(projected.y - 50) > 68 ? projected : edge;

        animateSegment(fleeTarget, 320, "line", () => {
          setHidden(true);
          setEscaping(false);

          const reenterFrom = randomEdgePoint();
          positionRef.current = reenterFrom;
          setPosition(reenterFrom);

          reenterTimerRef.current = window.setTimeout(() => {
            setHidden(false);
            animateSegment(randomInteriorPoint(), 1900 + Math.random() * 1100, "curve", () => {
              fleeingRef.current = false;
              startRoaming();
            });
          }, 420);
        });
      }, 120);
    },
    [animateSegment, clearTimers, startRoaming, stopAnimation],
  );

  useEffect(() => {
    startRoaming();

    const onMove = (event: MouseEvent) => fleeFrom(event.clientX, event.clientY);
    const onDown = (event: PointerEvent) => fleeFrom(event.clientX, event.clientY);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      clearTimers();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerdown", onDown);
      stopAnimation();
      fleeingRef.current = false;
    };
  }, [clearTimers, fleeFrom, startRoaming, stopAnimation]);

  return (
    <div className="dust-sprite-roamer-layer" aria-hidden>
      <span
        className={`dust-sprite${startled ? " dust-sprite-startled" : ""}${escaping ? " dust-sprite-escaping" : ""}${hidden ? " dust-sprite-hidden" : ""}`}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
      />
    </div>
  );
}
