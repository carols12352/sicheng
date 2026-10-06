"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { experienceEntries } from "@/content/experiences";
import { growthTimeline } from "@/content/growth";
import { projectEntries } from "@/content/projects";
import { createPanelTexture, panelStyles, type PanelContent, type PanelStyle } from "./panel-texture";

const EYE_HEIGHT = 1.45;
const GROWTH_RADIUS = 2.2;
const SIDE_RADIUS = 2.1;
const DEG = Math.PI / 180;

type Placement = {
  angle: number;
  radius: number;
  y: number;
};

type PanelSpec = Placement & {
  id: string;
  width: number;
  height: number;
  detailHeight: number;
  summary: PanelContent;
  detail: PanelContent;
};

function arcTransform({ angle, radius, y }: Placement) {
  const radians = angle * DEG;
  return {
    position: [Math.sin(radians) * radius, y, -Math.cos(radians) * radius] as [number, number, number],
    rotationY: -radians,
  };
}

function growthPanels(): PanelSpec[] {
  const step = 14;
  const start = -((growthTimeline.length - 1) * step) / 2;
  return growthTimeline.map((entry, index) => ({
    id: `growth-${index}`,
    angle: start + index * step,
    radius: GROWTH_RADIUS,
    y: EYE_HEIGHT,
    width: 0.5,
    height: 0.34,
    detailHeight: 0.62,
    summary: { eyebrow: entry.phase, title: entry.period },
    detail: { eyebrow: entry.phase, title: entry.period, body: entry.detail },
  }));
}

function sidePanels(side: "left" | "right"): PanelSpec[] {
  const sign = side === "left" ? -1 : 1;
  const columns = [60, 84];
  const rows = [EYE_HEIGHT + 0.3, EYE_HEIGHT - 0.28];
  const entries = side === "left"
    ? projectEntries.slice(0, 4).map((project) => ({
        id: `project-${project.anchor}`,
        summary: { eyebrow: project.period, title: project.name, body: project.summary },
        detail: {
          eyebrow: project.period,
          title: project.name,
          subtitle: project.stack.slice(0, 4).map((item) => item.name).join(" · "),
          bullets: project.highlights.slice(0, 3),
        },
      }))
    : experienceEntries.slice(0, 4).map((entry) => ({
        id: `experience-${entry.anchor}`,
        summary: { eyebrow: entry.period, title: entry.role, subtitle: entry.organization, body: entry.summary },
        detail: {
          eyebrow: entry.period,
          title: entry.role,
          subtitle: entry.organization,
          body: entry.highlights.length ? undefined : entry.summary,
          bullets: entry.highlights.slice(0, 3),
        },
      }));

  return entries.map((entry, index) => ({
    ...entry,
    angle: sign * columns[index % 2],
    radius: SIDE_RADIUS,
    y: rows[Math.floor(index / 2)],
    width: 0.66,
    height: 0.5,
    detailHeight: 1.2,
  }));
}

const growth = growthPanels();
const allPanels = [...growth, ...sidePanels("left"), ...sidePanels("right")];

type PanelProps = PanelSpec & {
  style?: PanelStyle;
  selected: boolean;
  onSelect: (id: string) => void;
  reduceMotion: boolean;
};

function Panel({ id, width, height, detailHeight, summary, detail, style = panelStyles.light, selected, onSelect, reduceMotion, ...placement }: PanelProps) {
  const { position, rotationY } = arcTransform(placement);
  const lift = useRef<THREE.Group>(null);
  const front = useMemo(() => createPanelTexture(summary, width, height, style), [summary, width, height, style]);
  const expanded = useMemo(() => createPanelTexture(detail, width, detailHeight, style, height), [detail, width, detailHeight, height, style]);
  const face = selected ? expanded : front;

  useEffect(() => () => {
    front.texture.dispose();
    expanded.texture.dispose();
  }, [front, expanded]);

  useFrame((_, delta) => {
    const node = lift.current;
    if (!node) return;
    const targetZ = selected ? 0.45 : 0;
    const targetScale = selected ? 1.12 : 1;
    const blend = reduceMotion ? 1 : Math.min(1, delta * 8);
    node.position.z += (targetZ - node.position.z) * blend;
    node.scale.setScalar(node.scale.x + (targetScale - node.scale.x) * blend);
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={lift}>
        <mesh
          renderOrder={selected ? 2 : 1}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(id);
          }}
        >
          <planeGeometry key={selected ? "detail" : "summary"} args={[width, face.height]} />
          <meshBasicMaterial map={face.texture} transparent toneMapped={false} depthWrite={!selected} />
        </mesh>
      </group>
    </group>
  );
}

function Label({ text, placement, width = 0.9 }: { text: string; placement: Placement; width?: number }) {
  const { position, rotationY } = arcTransform(placement);
  const { texture } = useMemo(() => createPanelTexture({ title: text }, width, 0.13, { ...panelStyles.hero, titleScale: 0.9 }), [text, width]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={[width, 0.13]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function Hero() {
  const { position } = arcTransform({ angle: 0, radius: 2.5, y: EYE_HEIGHT + 0.7 });
  const { texture } = useMemo(() => createPanelTexture({
    eyebrow: "Software Engineering @ UWaterloo",
    title: "Sicheng Ouyang",
    body: "Pinch a panel to open it. Pinch the card to flip it.",
  }, 1.8, 0.5, { ...panelStyles.hero, titleScale: 1.7 }), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position}>
      <planeGeometry args={[1.8, 0.5]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function GrowthRail({ panels }: { panels: PanelSpec[] }) {
  const geometry = useMemo(() => {
    const first = panels[0].angle - 6;
    const last = panels[panels.length - 1].angle + 6;
    const points = Array.from({ length: 48 }, (_, index) => {
      const angle = (first + ((last - first) * index) / 47) * DEG;
      return new THREE.Vector3(Math.sin(angle) * GROWTH_RADIUS, EYE_HEIGHT - 0.24, -Math.cos(angle) * GROWTH_RADIUS);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, 0.003, 6, false);
  }, [panels]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#8c95a1" toneMapped={false} />
      </mesh>
      {panels.map((panel) => {
        const { position } = arcTransform({ ...panel, y: EYE_HEIGHT - 0.24 });
        return (
          <mesh key={panel.id} position={position}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshBasicMaterial color="#526eaa" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

type PanelsProps = {
  selected: string | null;
  onSelect: (id: string | null) => void;
  reduceMotion: boolean;
};

export function Panels({ selected, onSelect, reduceMotion }: PanelsProps) {
  const toggle = (id: string) => onSelect(selected === id ? null : id);

  return (
    <group>
      <Hero />
      <Label text="Growth line" placement={{ angle: 0, radius: GROWTH_RADIUS, y: EYE_HEIGHT + 0.28 }} width={0.6} />
      <Label text="Projects" placement={{ angle: -72, radius: SIDE_RADIUS, y: EYE_HEIGHT + 0.68 }} width={0.6} />
      <Label text="Experience" placement={{ angle: 72, radius: SIDE_RADIUS, y: EYE_HEIGHT + 0.68 }} width={0.6} />
      <GrowthRail panels={growth} />
      {allPanels.map((panel) => (
        <Panel key={panel.id} {...panel} selected={selected === panel.id} onSelect={toggle} reduceMotion={reduceMotion} />
      ))}
    </group>
  );
}
