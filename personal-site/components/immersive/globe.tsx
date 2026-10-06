"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { faceCameraYaw } from "./billboard";
import { Spring, SPRINGS } from "./spring";
import { textBlockTexture } from "./textures";
import { useTheme } from "./theme";
import { pitchOf, useDrag, wrapAngle, yawOf } from "./use-drag";

const RADIUS = 0.075;
const DEG = Math.PI / 180;
const IDLE_SPIN = 0.22;

const PLACES = [
  { lat: 43.47, lon: -80.54, name: "Waterloo, Canada", detail: "UWaterloo, WATcloud, Mui Scientific" },
  { lat: 30.59, lon: 114.31, name: "Wuhan, China", detail: "Wuhan University of Technology" },
  { lat: 22.54, lon: 114.06, name: "Shenzhen, China", detail: "Tencent Music" },
];

function toVector(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

function gridGeometry() {
  const positions: number[] = [];
  const push = (a: THREE.Vector3, b: THREE.Vector3) => positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = 0; lon < 360; lon += 6) push(toVector(lat, lon, RADIUS), toVector(lat, lon + 6, RADIUS));
  }
  for (let lon = 0; lon < 360; lon += 30) {
    for (let lat = -90; lat < 90; lat += 6) push(toVector(lat, lon, RADIUS), toVector(lat + 6, lon, RADIUS));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function Pin({ place, selected, onSelect }: { place: (typeof PLACES)[number]; selected: boolean; onSelect: () => void }) {
  const theme = useTheme();
  const label = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const show = useRef(new Spring(0, SPRINGS.snappy));
  const position = useMemo(() => toVector(place.lat, place.lon, RADIUS), [place]);
  const tip = useMemo(() => toVector(place.lat, place.lon, RADIUS * 1.12), [place]);
  const block = useMemo(
    () =>
      textBlockTexture(
        [
          { text: place.name, size: 0.011, weight: 600, color: theme.strong },
          { text: place.detail, size: 0.0085, color: theme.muted },
        ],
        0.22,
      ),
    [place, theme],
  );
  useEffect(() => () => block.texture.dispose(), [block]);
  const tap = useDrag({ onTap: onSelect });

  useFrame((frameState, delta) => {
    show.current.target = selected ? 1 : 0;
    const value = show.current.step(delta);
    if (material.current) material.current.opacity = value;
    if (label.current) {
      label.current.visible = value > 0.01;
      label.current.scale.setScalar(0.85 + value * 0.15);
      faceCameraYaw(label.current, frameState.camera);
    }
  });

  return (
    <group>
      <mesh position={tip}>
        <sphereGeometry args={[0.0035, 12, 12]} />
        <meshBasicMaterial color={theme.accent} toneMapped={false} />
      </mesh>
      <mesh position={position.clone().lerp(tip, 0.5)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize())} raycast={() => null}>
        <cylinderGeometry args={[0.0007, 0.0007, RADIUS * 0.12, 6]} />
        <meshBasicMaterial color={theme.accent} toneMapped={false} />
      </mesh>
      <mesh
        position={tip}
        {...tap}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <mesh ref={label} position={tip.clone().multiplyScalar(1.25).add(new THREE.Vector3(0, 0.03, 0))} visible={false} raycast={() => null} renderOrder={4}>
        <planeGeometry args={[0.22, block.height]} />
        <meshBasicMaterial ref={material} map={block.texture} transparent opacity={0} toneMapped={false} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** A holographic grid globe; drag to spin it, tap a pin to see what happened there. */
export function Globe({ position, reduceMotion }: { position: [number, number, number]; reduceMotion: boolean }) {
  const theme = useTheme();
  const spin = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const live = useRef({ yaw: -1.9, pitch: 0.35, velocity: IDLE_SPIN, dragging: false, startYaw: 0, startPitch: 0, lastYaw: 0, lastTime: 0 });
  const grid = useMemo(() => gridGeometry(), []);
  useEffect(() => () => grid.dispose(), [grid]);

  const drag = useDrag({
    threshold: 0.006,
    onTap: () => setSelected(null),
    onDragStart() {
      const state = live.current;
      state.dragging = true;
      state.startYaw = state.yaw;
      state.startPitch = state.pitch;
      state.lastYaw = state.yaw;
      state.lastTime = performance.now();
    },
    onDrag(event, start) {
      const state = live.current;
      state.yaw = state.startYaw + wrapAngle(yawOf(event.ray.direction) - yawOf(start.direction)) * 9;
      state.pitch = THREE.MathUtils.clamp(state.startPitch - (pitchOf(event.ray.direction) - pitchOf(start.direction)) * 9, -0.6, 0.9);
      const now = performance.now();
      const seconds = Math.max((now - state.lastTime) / 1000, 1 / 240);
      state.velocity = state.velocity * 0.5 + ((state.yaw - state.lastYaw) / seconds) * 0.5;
      state.lastYaw = state.yaw;
      state.lastTime = now;
    },
    onDragEnd() {
      const state = live.current;
      state.dragging = false;
      state.velocity = THREE.MathUtils.clamp(state.velocity, -12, 12);
    },
  });

  useFrame((_, delta) => {
    const state = live.current;
    if (!state.dragging) {
      const idle = reduceMotion ? 0 : IDLE_SPIN;
      state.velocity = idle + (state.velocity - idle) * Math.exp(-delta * 1.6);
      state.yaw += state.velocity * delta;
    }
    if (spin.current) spin.current.rotation.set(state.pitch, state.yaw, 0, "XYZ");
    if (orbit.current && !reduceMotion) orbit.current.rotation.y += delta * 0.6;
  });

  return (
    <group position={position}>
      <mesh position={[0, -0.13, 0]} raycast={() => null}>
        <cylinderGeometry args={[RADIUS * 0.7, 0.025, 0.1, 48, 1, true]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={theme.scheme === "dark" ? 0.07 : 0.1} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={spin}>
        <mesh {...drag} onPointerOver={() => (document.body.style.cursor = "grab")} onPointerOut={() => (document.body.style.cursor = "")}>
          <sphereGeometry args={[RADIUS * 0.985, 48, 32]} />
          <meshBasicMaterial color={theme.surface} transparent opacity={0.7} toneMapped={false} />
        </mesh>
        <lineSegments geometry={grid} raycast={() => null}>
          <lineBasicMaterial color={theme.accent} transparent opacity={0.7} toneMapped={false} />
        </lineSegments>
        {PLACES.map((place, index) => (
          <Pin key={place.name} place={place} selected={selected === index} onSelect={() => setSelected((current) => (current === index ? null : index))} />
        ))}
      </group>
      <group rotation={[0.42, 0, 0.18]}>
        <group ref={orbit}>
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
            <torusGeometry args={[RADIUS * 1.45, 0.0006, 6, 160]} />
            <meshBasicMaterial color={theme.muted} transparent opacity={0.6} toneMapped={false} />
          </mesh>
          <mesh position={[RADIUS * 1.45, 0, 0]} raycast={() => null}>
            <sphereGeometry args={[0.004, 12, 12]} />
            <meshBasicMaterial color={theme.accent} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
