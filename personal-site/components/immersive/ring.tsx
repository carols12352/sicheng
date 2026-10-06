"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  items,
  ORBIT_RADIUS,
  ORBIT_Y,
  PANEL_ARC,
  PANEL_CENTER,
  PANEL_RADIUS,
  PANEL_Y,
  type Item,
  type TimelineItem,
} from "./items";
import { sceneState } from "./scene-state";
import { PANEL_HEADER, PANEL_PAD, PANEL_ROW, panelHeight, panelTexture, textBlockTexture } from "./textures";
import { Spring, SPRINGS } from "./spring";
import { useTheme } from "./theme";
import { useDrag, type DragEvent } from "./use-drag";

const DIMMED = 0.25;
const DEG = Math.PI / 180;

export type OpenHandler = (id: string, from: THREE.Vector3) => void;

function arcPosition(angle: number, radius: number, y: number): [number, number, number] {
  return [Math.sin(angle) * radius, y, -Math.cos(angle) * radius];
}

/** Entrance progress on the shared clock: the orbit draws first, then everything else follows in order. */
function unfold(order: number) {
  const t = THREE.MathUtils.clamp((sceneState.entrance * 2 - 0.35 - order * 0.05) / 0.6, 0, 1);
  return 1 - Math.pow(1 - t, 3);
}

function setCursor(pointer: boolean) {
  document.body.style.cursor = pointer ? "pointer" : "";
}

function approach(current: number, target: number, delta: number, rate = 6) {
  return current + (target - current) * Math.min(1, delta * rate);
}

/** The memorable piece: a hairline scale that wraps all the way around the viewer. */
function Orbit({ dim }: { dim: boolean }) {
  const theme = useTheme();
  const ringMaterials = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const tickMaterial = useRef<THREE.LineBasicMaterial>(null);
  const fade = useRef(1);
  const halves = useMemo(
    () =>
      [1, -1].map((side) => {
        const points = Array.from({ length: 121 }, (_, index) => new THREE.Vector3(...arcPosition((side * Math.PI * index) / 120, ORBIT_RADIUS, ORBIT_Y)));
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 240, 0.0014, 6, false);
      }),
    [],
  );
  const ticks = useMemo(() => {
    const positions: number[] = [];
    for (let degree = 0; degree < 360; degree += 2) {
      const height = degree % 90 === 0 ? 0.034 : degree % 10 === 0 ? 0.018 : 0.007;
      const [x, , z] = arcPosition(degree * DEG, ORBIT_RADIUS, 0);
      positions.push(x, ORBIT_Y, z, x, ORBIT_Y + height, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);
  useEffect(() => () => {
    halves.forEach((geometry) => geometry.dispose());
    ticks.dispose();
  }, [halves, ticks]);

  useFrame((_, delta) => {
    const draw = THREE.MathUtils.clamp(sceneState.entrance * 1.6, 0, 1);
    const eased = 1 - Math.pow(1 - draw, 3);
    for (const geometry of halves) {
      const count = geometry.index?.count ?? 0;
      geometry.setDrawRange(0, Math.floor((count * eased) / 6) * 6);
    }
    fade.current = approach(fade.current, dim ? DIMMED : 1, delta);
    for (const material of ringMaterials.current) {
      if (material) material.opacity = fade.current;
    }
    if (tickMaterial.current) tickMaterial.current.opacity = THREE.MathUtils.clamp(sceneState.entrance * 2 - 0.6, 0, 1) * fade.current * 0.6;
  });

  return (
    <group>
      {halves.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshBasicMaterial
            ref={(material) => {
              ringMaterials.current[index] = material;
            }}
            color={theme.muted}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
      <lineSegments geometry={ticks} raycast={() => null}>
        <lineBasicMaterial ref={tickMaterial} color={theme.muted} transparent opacity={0} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

type NodeProps = {
  item: TimelineItem;
  active: boolean;
  dim: boolean;
  onOpen: OpenHandler;
  reduceMotion: boolean;
};

function TimelineNode({ item, active, dim, onOpen, reduceMotion }: NodeProps) {
  const theme = useTheme();
  const anchor = useRef<THREE.Group>(null);
  const dot = useRef<THREE.Mesh>(null);
  const dotMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const dateMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const titleMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const state = useRef({ hovered: false, fade: 1, scale: new Spring(0, SPRINGS.bouncy) });
  const date = useMemo(() => textBlockTexture([{ text: item.period, size: 0.018, color: theme.muted, mono: true }], 0.4), [item, theme]);
  const title = useMemo(() => textBlockTexture([{ text: item.title, size: 0.026, weight: 600, color: theme.strong, maxLines: 2 }], 0.36), [item, theme]);
  useEffect(() => () => {
    date.texture.dispose();
    title.texture.dispose();
  }, [date, title]);
  const colors = useMemo(() => ({ idle: new THREE.Color(theme.strong), lit: new THREE.Color(theme.accent) }), [theme]);
  const tap = useDrag({
    onTap() {
      const from = new THREE.Vector3();
      anchor.current?.getWorldPosition(from);
      onOpen(item.id, from);
    },
  });

  useFrame((_, delta) => {
    const live = state.current;
    const appear = unfold(item.order);
    const lit = active || live.hovered;
    live.fade = approach(live.fade, dim && !active ? DIMMED : 1, delta);
    live.scale.target = appear * (lit ? 1.8 : 1);
    if (dot.current) dot.current.scale.setScalar(Math.max(0.001, live.scale.step(delta, reduceMotion)));
    if (dotMaterial.current) dotMaterial.current.color.copy(lit ? colors.lit : colors.idle);
    if (dateMaterial.current) dateMaterial.current.opacity = appear * live.fade;
    if (titleMaterial.current) titleMaterial.current.opacity = appear * live.fade;
  });

  return (
    <group ref={anchor} position={arcPosition(item.angle, ORBIT_RADIUS - 0.004, ORBIT_Y)} rotation={[0, -item.angle, 0]}>
      <mesh ref={dot} scale={0}>
        <sphereGeometry args={[0.008, 20, 20]} />
        <meshBasicMaterial ref={dotMaterial} color={theme.strong} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.05 + date.height / 2, 0]}>
        <planeGeometry args={[0.4, date.height]} />
        <meshBasicMaterial ref={dateMaterial} map={date.texture} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.03 - title.height / 2, 0]}>
        <planeGeometry args={[0.36, title.height]} />
        <meshBasicMaterial ref={titleMaterial} map={title.texture} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh
        position={[0, -0.01, 0.002]}
        {...tap}
        onPointerOver={() => {
          state.current.hovered = true;
          setCursor(true);
        }}
        onPointerOut={() => {
          state.current.hovered = false;
          setCursor(false);
        }}
      >
        <planeGeometry args={[0.36, 0.2]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

type PanelProps = {
  title: string;
  entries: Item[];
  center: number;
  activeId: string | null;
  dim: boolean;
  onOpen: OpenHandler;
  reduceMotion: boolean;
};

/** One section as a curved glass list wrapped around the viewer; rows are hit-tested by uv. */
function SectionPanel({ title, entries, center, activeId, dim, onOpen, reduceMotion }: PanelProps) {
  const theme = useTheme();
  const height = panelHeight(entries.length);
  const thetaStart = Math.PI - center - PANEL_ARC / 2;
  const inset = (PANEL_PAD + 0.008) / PANEL_RADIUS;
  const panel = useRef<THREE.Mesh>(null);
  const face = useRef<THREE.MeshBasicMaterial>(null);
  const highlight = useRef<THREE.Mesh>(null);
  const highlightMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const live = useRef({ hovered: -1, fade: 1, rowY: new Spring(0, SPRINGS.snappy), glow: new Spring(0, SPRINGS.snappy), placed: false });
  const texture = useMemo(
    () => panelTexture(title, entries.map(({ title: name, period }) => ({ title: name, period })), PANEL_RADIUS * PANEL_ARC, theme),
    [title, entries, theme],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  const activeRow = entries.findIndex((entry) => entry.id === activeId);

  const rowCenter = (row: number) => height / 2 - PANEL_PAD - PANEL_HEADER - (row + 0.5) * PANEL_ROW;
  const rowAt = (event: DragEvent) => {
    if (!event.uv) return -1;
    const row = Math.floor(((1 - event.uv.y) * height - PANEL_PAD - PANEL_HEADER) / PANEL_ROW);
    return row >= 0 && row < entries.length ? row : -1;
  };

  const drag = useDrag({
    onTap(event) {
      const row = rowAt(event);
      if (row < 0 || !panel.current) return;
      const from = panel.current.localToWorld(new THREE.Vector3(...arcPosition(center, PANEL_RADIUS, rowCenter(row))));
      onOpen(entries[row].id, from);
    },
  });

  useFrame((_, delta) => {
    const state = live.current;
    const appear = unfold(entries[0].order);
    state.fade = approach(state.fade, dim && activeRow < 0 ? DIMMED : 1, delta);
    if (panel.current) panel.current.position.y = PANEL_Y - (1 - appear) * 0.05;
    if (face.current) {
      face.current.opacity = appear * state.fade;
      face.current.depthWrite = face.current.opacity > 0.5;
    }
    const row = activeRow >= 0 ? activeRow : state.hovered;
    if (row >= 0) {
      state.rowY.target = rowCenter(row);
      if (!state.placed) state.rowY.value = state.rowY.target;
      state.placed = true;
    }
    state.glow.target = row < 0 ? 0 : activeRow >= 0 ? 0.18 : 0.1;
    if (highlight.current) highlight.current.position.y = state.rowY.step(delta, reduceMotion);
    if (highlightMaterial.current) highlightMaterial.current.opacity = Math.max(0, state.glow.step(delta, reduceMotion)) * appear;
    if (state.glow.value < 0.005 && row < 0) state.placed = false;
  });

  return (
    <mesh
      ref={panel}
      position={[0, PANEL_Y, 0]}
      renderOrder={-1}
      {...drag}
      onPointerMove={(event) => {
        drag.onPointerMove(event);
        const row = rowAt(event);
        if (row !== live.current.hovered) setCursor(row >= 0);
        live.current.hovered = row;
      }}
      onPointerOut={() => {
        live.current.hovered = -1;
        setCursor(false);
      }}
    >
      <cylinderGeometry args={[PANEL_RADIUS, PANEL_RADIUS, height, 64, 1, true, thetaStart, PANEL_ARC]} />
      <meshBasicMaterial ref={face} map={texture} side={THREE.BackSide} transparent opacity={0} toneMapped={false} />
      <mesh ref={highlight} raycast={() => null} renderOrder={1}>
        <cylinderGeometry args={[PANEL_RADIUS - 0.004, PANEL_RADIUS - 0.004, PANEL_ROW * 0.9, 48, 1, true, thetaStart + inset, PANEL_ARC - inset * 2]} />
        <meshBasicMaterial ref={highlightMaterial} color={theme.accent} side={THREE.BackSide} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </mesh>
  );
}

function XRHint({ dim }: { dim: boolean }) {
  const theme = useTheme();
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const block = useMemo(() => textBlockTexture([{ text: "Pinch to open. Pinch and drag a window to move it.", size: 0.02, color: theme.muted }], 1.2), [theme]);
  useEffect(() => () => block.texture.dispose(), [block]);
  useFrame(() => {
    if (material.current) material.current.opacity = dim ? 0 : unfold(items.timeline.length);
  });
  return (
    <mesh position={[0, ORBIT_Y - 0.3, -ORBIT_RADIUS]}>
      <planeGeometry args={[1.2, block.height]} />
      <meshBasicMaterial ref={material} map={block.texture} transparent opacity={0} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

type RingProps = {
  activeId: string | null;
  dim: boolean;
  inXR: boolean;
  onOpen: OpenHandler;
  reduceMotion: boolean;
};

export function Ring({ activeId, dim, inXR, onOpen, reduceMotion }: RingProps) {
  const shared = { activeId, dim, onOpen, reduceMotion };
  return (
    <group>
      <Orbit dim={dim} />
      {items.timeline.map((item) => (
        <TimelineNode key={item.id} item={item} active={activeId === item.id} dim={dim} onOpen={onOpen} reduceMotion={reduceMotion} />
      ))}
      {inXR ? <XRHint dim={dim} /> : null}
      <SectionPanel title="Projects" entries={items.projects} center={-PANEL_CENTER} {...shared} />
      <SectionPanel title="Experience" entries={items.experience} center={PANEL_CENTER} {...shared} />
    </group>
  );
}
