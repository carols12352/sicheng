"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { faceCameraYaw } from "./billboard";
import { items, type Item } from "./items";
import type { OpenHandler } from "./ring";
import { Spring, Spring3, SPRINGS } from "./spring";
import { canvasOf, frame, FONT, makeTexture, MONO, textBlockTexture, wrapLines } from "./textures";
import { useTheme, type Theme } from "./theme";
import { useGrab } from "./use-grab";

const WIDTH = 0.056;
const HEIGHT = 0.078;
const DEPTH = 0.012;
const PPM = 4000;
const RACK_Z = -0.2;
const RACK_TILT = -0.18;
const READER = new THREE.Vector3(0, 0, 0.14);
const READER_SIZE = [0.1, 0.034, 0.05] as const;
const INSERTED = new THREE.Vector3(READER.x, READER_SIZE[1] + HEIGHT / 2 - 0.03, READER.z);
const SNAP_DISTANCE = 0.12;

function slot(index: number) {
  return new THREE.Vector3((index - (items.projects.length - 1) / 2) * 0.072, 0.008 + HEIGHT / 2, RACK_Z);
}

function faceTexture(item: Item, theme: Theme) {
  const { canvas, context } = canvasOf(WIDTH * PPM, HEIGHT * PPM);
  if (context) {
    const { width, height } = canvas;
    const m = (meters: number) => meters * PPM;
    frame(context, width, height, PPM * 0.35, theme, 1);
    context.fillStyle = theme.accent;
    context.fillRect(m(0.006), m(0.006), m(0.012), m(0.0016));
    context.textBaseline = "top";
    context.font = `600 ${m(0.0068)}px ${FONT}`;
    context.fillStyle = theme.strong;
    wrapLines(context, item.title, width - m(0.012), 4).forEach((line, index) => context.fillText(line, m(0.006), m(0.014) + index * m(0.0085)));
    context.font = `500 ${m(0.0044)}px ${MONO}`;
    context.fillStyle = theme.muted;
    context.fillText(item.period.split(" – ")[0], m(0.006), height - m(0.011));
  }
  return makeTexture(canvas);
}

type Mode = "rack" | "held" | "inserted";

type CartridgeState = {
  mode: Mode;
  position: Spring3;
  tilt: Spring;
  lift: Spring;
  hovered: boolean;
  pendingOpen: boolean;
  openedAt: number;
};

function createStates(): CartridgeState[] {
  return items.projects.map((_, index) => ({
    mode: "rack",
    position: new Spring3(slot(index), SPRINGS.bouncy),
    tilt: new Spring(RACK_TILT, SPRINGS.bouncy),
    lift: new Spring(0, SPRINGS.snappy),
    hovered: false,
    pendingOpen: false,
    openedAt: 0,
  }));
}

/** Shared with the frame loop like sceneState; reset whenever the rack mounts. */
const cartridgeStates: CartridgeState[] = createStates();

type CartridgeProps = {
  item: Item;
  index: number;
  activeId: string | null;
  onInsert: (index: number) => void;
  onOpen: OpenHandler;
  onEject: () => void;
  reduceMotion: boolean;
  geometry: THREE.BufferGeometry;
};

function Cartridge({ item, index, activeId, onInsert, onOpen, onEject, reduceMotion, geometry }: CartridgeProps) {
  const theme = useTheme();
  const group = useRef<THREE.Group>(null);
  const label = useRef<THREE.Mesh>(null);
  const labelMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => faceTexture(item, theme), [item, theme]);
  const tooltip = useMemo(() => textBlockTexture([{ text: item.title, size: 0.014, weight: 600, color: theme.strong, maxLines: 2 }], 0.24), [item, theme]);
  useEffect(() => () => {
    texture.dispose();
    tooltip.texture.dispose();
  }, [texture, tooltip]);

  const grab = useGrab({
    target: group,
    onTap() {
      if (cartridgeStates[index].mode === "inserted") onEject();
      else onInsert(index);
    },
    onGrab() {
      cartridgeStates[index].mode = "held";
      cartridgeStates[index].pendingOpen = false;
      cartridgeStates[index].position.config = SPRINGS.follow;
    },
    onMove(position) {
      cartridgeStates[index].position.target.copy(position);
    },
    onRelease() {
      cartridgeStates[index].position.config = SPRINGS.bouncy;
      if (cartridgeStates[index].position.value.distanceTo(INSERTED) < SNAP_DISTANCE) onInsert(index);
      else {
        cartridgeStates[index].mode = "rack";
        cartridgeStates[index].position.target.copy(slot(index));
      }
    },
  });

  useFrame((frameState, delta) => {
    const node = group.current;
    if (!node) return;
    if (cartridgeStates[index].mode === "inserted" && !cartridgeStates[index].pendingOpen && activeId !== item.id && performance.now() - cartridgeStates[index].openedAt > 400) {
      cartridgeStates[index].mode = "rack";
      cartridgeStates[index].position.config = SPRINGS.bouncy;
      cartridgeStates[index].position.target.copy(slot(index));
    }
    cartridgeStates[index].tilt.target = cartridgeStates[index].mode === "rack" ? RACK_TILT : 0;
    cartridgeStates[index].lift.target = cartridgeStates[index].hovered && cartridgeStates[index].mode === "rack" ? 1 : 0;
    const position = cartridgeStates[index].position.step(delta, reduceMotion);
    const lift = cartridgeStates[index].lift.step(delta, reduceMotion);
    node.position.copy(position);
    node.position.y += lift * 0.018;
    node.rotation.x = cartridgeStates[index].tilt.step(delta, reduceMotion);

    if (cartridgeStates[index].pendingOpen && position.distanceTo(INSERTED) < 0.008) {
      cartridgeStates[index].pendingOpen = false;
      cartridgeStates[index].openedAt = performance.now();
      onOpen(item.id, node.getWorldPosition(new THREE.Vector3()));
    }

    if (label.current && labelMaterial.current) {
      labelMaterial.current.opacity = lift;
      label.current.visible = lift > 0.01;
      faceCameraYaw(label.current, frameState.camera);
    }
  });

  return (
    <>
      <group
        ref={group}
        {...grab}
        onPointerOver={() => {
          cartridgeStates[index].hovered = true;
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          cartridgeStates[index].hovered = false;
          document.body.style.cursor = "";
        }}
      >
        <mesh geometry={geometry}>
          <meshStandardMaterial color={theme.object} roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, DEPTH / 2 + 0.0004]} raycast={() => null}>
          <planeGeometry args={[WIDTH - 0.004, HEIGHT - 0.004]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={label} position={[slot(index).x, HEIGHT + 0.06, RACK_Z]} visible={false} raycast={() => null}>
        <planeGeometry args={[0.24, tooltip.height]} />
        <meshBasicMaterial ref={labelMaterial} map={tooltip.texture} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  );
}

type CartridgesProps = {
  activeId: string | null;
  onOpen: OpenHandler;
  onEject: () => void;
  reduceMotion: boolean;
};

/** One cartridge per project; slot one into the reader, by tapping or by carrying it there, to open it. */
export function Cartridges({ activeId, onOpen, onEject, reduceMotion }: CartridgesProps) {
  const theme = useTheme();
  const light = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef(new Spring(0, SPRINGS.smooth));
  const geometry = useMemo(
    () => ({
      cartridge: new RoundedBoxGeometry(WIDTH, HEIGHT, DEPTH, 3, 0.003),
      reader: new RoundedBoxGeometry(...READER_SIZE, 4, 0.008),
      rack: new RoundedBoxGeometry(0.46, 0.008, 0.04, 3, 0.003),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometry).forEach((item) => item.dispose()), [geometry]);
  useEffect(() => {
    cartridgeStates.splice(0, cartridgeStates.length, ...createStates());
  }, []);

  const insert = (index: number) => {
    cartridgeStates.forEach((state, other) => {
      if (other !== index && state.mode === "inserted") {
        state.mode = "rack";
        state.position.target.copy(slot(other));
      }
    });
    const state = cartridgeStates[index];
    state.mode = "inserted";
    state.pendingOpen = true;
    state.position.config = SPRINGS.bouncy;
    state.position.target.copy(INSERTED);
  };

  useFrame((_, delta) => {
    glow.current.target = cartridgeStates.some((state) => state.mode === "inserted" && !state.pendingOpen) ? 1 : 0;
    const value = glow.current.step(delta, reduceMotion);
    if (light.current) light.current.opacity = 0.25 + value * 0.75;
  });

  return (
    <group>
      <mesh geometry={geometry.rack} position={[0, 0.004, RACK_Z]} raycast={() => null}>
        <meshStandardMaterial color={theme.object} roughness={0.6} />
      </mesh>
      <group position={[READER.x, READER_SIZE[1] / 2, READER.z]}>
        <mesh geometry={geometry.reader} raycast={() => null}>
          <meshStandardMaterial color={theme.object} roughness={0.4} />
        </mesh>
        <mesh position={[0, READER_SIZE[1] / 2 + 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <planeGeometry args={[WIDTH + 0.008, DEPTH + 0.004]} />
          <meshBasicMaterial color={theme.scheme === "dark" ? "#000000" : theme.lineStrong} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.004, READER_SIZE[2] / 2 + 0.0005]} raycast={() => null}>
          <planeGeometry args={[0.06, 0.0025]} />
          <meshBasicMaterial ref={light} color={theme.accent} transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>
      {items.projects.map((item, index) => (
        <Cartridge
          key={item.id}
          item={item}
          index={index}
          activeId={activeId}
          onInsert={insert}
          onOpen={onOpen}
          onEject={onEject}
          reduceMotion={reduceMotion}
          geometry={geometry.cartridge}
        />
      ))}
    </group>
  );
}
