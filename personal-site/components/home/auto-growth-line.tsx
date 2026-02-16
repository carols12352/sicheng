"use client";

import { useEffect, useRef } from "react";

type GrowthItem = {
  phase: string;
  period: string;
  detail: string;
};

type AutoGrowthLineProps = {
  items: GrowthItem[];
};

export function AutoGrowthLine({ items }: AutoGrowthLineProps) {
  if (items.length === 0) {
    return null;
  }

  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const offsetRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const DURATION_SECONDS = 12;

  const handlePointerEnter = () => {
    pausedRef.current = true;
  };

  const handlePointerLeave = () => {
    pausedRef.current = false;
    lastTsRef.current = null;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const step = (timestamp: number) => {
      const node = trackRef.current;
      if (!node) {
        return;
      }

      const distance = node.scrollHeight / 2;
      if (!distance) {
        rafIdRef.current = window.requestAnimationFrame(step);
        return;
      }

      const lastTs = lastTsRef.current ?? timestamp;
      const deltaSeconds = (timestamp - lastTs) / 1000;
      lastTsRef.current = timestamp;

      if (!pausedRef.current) {
        const speed = distance / DURATION_SECONDS;
        offsetRef.current = (offsetRef.current + speed * deltaSeconds) % distance;
        node.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
      }

      rafIdRef.current = window.requestAnimationFrame(step);
    };

    rafIdRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const renderList = (duplicate = false) => (
    <ol className="growth-line" aria-hidden={duplicate}>
      {items.map((item, index) => (
        <li
          key={`${item.phase}-${item.period}-${index}-${duplicate ? "dup" : "base"}`}
          className="growth-item"
        >
          <p className="growth-phase">{item.phase}</p>
          <h2 className="mt-1 text-sm font-semibold text-gray-900">{item.period}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">{item.detail}</p>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="growth-line-scroll mt-4" onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
      <div
        ref={trackRef}
        className="growth-line-track"
      >
        {renderList(false)}
        {renderList(true)}
      </div>
    </div>
  );
}
