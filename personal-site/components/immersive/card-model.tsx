"use client";

import { useFrame } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CARD_ASPECT, CARD_HOTSPOTS, createCardObject, hotspotAt, hotspotLocalRect, type CardFace } from "./card-object";
import { PLINTH_TOP } from "./plinth";
import { Spring, SPRINGS } from "./spring";
import { pillTexture } from "./textures";
import { useTheme } from "./theme";
import { openLink, sceneState } from "./scene-state";
import { pitchOf, useDrag, wrapAngle, yawOf, type DragEvent } from "./use-drag";

const CARD_WIDTH = 0.26;
const REST = new THREE.Vector3(PLINTH_TOP.x + 0.26, PLINTH_TOP.y + 0.055, PLINTH_TOP.z + 0.14);
const REST_SCALE = 0.55;
const INSPECT_DISTANCE = 0.42;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, 0));
const REST_ANGLE = Math.atan2(REST.x, -REST.z);

const scratch = {
  rest: new THREE.Vector3(),
  restQuaternion: new THREE.Quaternion(),
  yawQuaternion: new THREE.Quaternion(),
  cameraPosition: new THREE.Vector3(),
  forward: new THREE.Vector3(),
  dummy: new THREE.Object3D(),
};

type InspectableCardProps = {
  inspecting: boolean;
  onInspect: () => void;
  onPutBack: () => void;
  reduceMotion: boolean;
};

export function InspectableCard({ inspecting, onInspect, onPutBack, reduceMotion }: InspectableCardProps) {
  const theme = useTheme();
  const session = useXR((state) => state.session);
  const [card] = useState(() => createCardObject(CARD_WIDTH));
  const [hovered, setHovered] = useState<string | null>(null);
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const hint = useRef<THREE.MeshBasicMaterial>(null);
  const motion = useRef({
    progress: new Spring(0, { response: 0.6, damping: 0.8 }),
    hover: new Spring(0, SPRINGS.snappy),
    yaw: new Spring(0, SPRINGS.snappy),
    pitch: new Spring(0, SPRINGS.snappy),
    hovering: false,
    wasInspecting: false,
    inspectPosition: new THREE.Vector3(),
    inspectQuaternion: new THREE.Quaternion(),
    targetYaw: 0,
    targetPitch: 0,
    dragYaw: 0,
    dragPitch: 0,
  });
  const hintTexture = useMemo(() => pillTexture("Drag to rotate, tap a link to open", 0.28, 0.04, theme), [theme]);

  useEffect(() => () => card.dispose(), [card]);
  useEffect(() => () => hintTexture.dispose(), [hintTexture]);

  function faceOf(event: DragEvent): CardFace | null {
    if (event.object === card.front) return "front";
    if (event.object === card.back) return "back";
    return null;
  }

  const drag = useDrag({
    onTap(event) {
      if (!inspecting) {
        onInspect();
        return;
      }
      const face = faceOf(event);
      const hotspot = face && event.uv ? hotspotAt(face, event.uv) : null;
      if (hotspot) {
        void openLink(hotspot.href, session);
        return;
      }
      motion.current.targetYaw += Math.PI;
    },
    onDragStart() {
      motion.current.dragYaw = motion.current.targetYaw;
      motion.current.dragPitch = motion.current.targetPitch;
    },
    onDrag(event, start) {
      if (!inspecting) return;
      const state = motion.current;
      state.targetYaw = state.dragYaw + wrapAngle(yawOf(event.ray.direction) - yawOf(start.direction)) * 5;
      state.targetPitch = THREE.MathUtils.clamp(state.dragPitch - (pitchOf(event.ray.direction) - pitchOf(start.direction)) * 4, -0.9, 0.9);
    },
    onDragEnd() {
      const state = motion.current;
      state.targetYaw = Math.round(state.targetYaw / Math.PI) * Math.PI;
      state.targetPitch = 0;
    },
  });

  useFrame((frame, delta) => {
    const node = root.current;
    const spinNode = spin.current;
    if (!node || !spinNode) return;
    const state = motion.current;
    const entrance = sceneState.entrance;

    if (inspecting && !state.wasInspecting) {
      const camera = frame.camera;
      camera.getWorldPosition(scratch.cameraPosition);
      scratch.forward.set(0, -0.08, -1).applyQuaternion(camera.getWorldQuaternion(scratch.yawQuaternion)).normalize();
      state.inspectPosition.copy(scratch.cameraPosition).addScaledVector(scratch.forward, INSPECT_DISTANCE);
      scratch.dummy.position.copy(state.inspectPosition);
      scratch.dummy.lookAt(scratch.cameraPosition);
      state.inspectQuaternion.copy(scratch.dummy.quaternion);
    }
    if (!inspecting && state.wasInspecting) {
      state.targetYaw = Math.round(state.targetYaw / (Math.PI * 2)) * Math.PI * 2;
      state.targetPitch = 0;
    }
    state.wasInspecting = inspecting;

    state.progress.target = inspecting ? 1 : 0;
    state.hover.target = state.hovering && !inspecting ? 1 : 0;
    const t = state.progress.step(delta, reduceMotion);
    const clamped = THREE.MathUtils.clamp(t, 0, 1);
    const hover = state.hover.step(delta, reduceMotion);

    const yaw = sceneState.yaw;
    const bob = reduceMotion ? 0 : Math.sin(frame.clock.elapsedTime * 1.3) * 0.01;
    scratch.rest.copy(REST).applyAxisAngle(Y_AXIS, yaw);
    scratch.rest.y += bob + hover * 0.02;
    scratch.yawQuaternion.setFromAxisAngle(Y_AXIS, yaw - REST_ANGLE);
    scratch.restQuaternion.copy(scratch.yawQuaternion).multiply(TILT);

    node.position.lerpVectors(scratch.rest, state.inspectPosition, t);
    node.position.y += Math.sin(Math.PI * clamped) * 0.06;
    node.quaternion.slerpQuaternions(scratch.restQuaternion, state.inspectQuaternion, clamped);
    node.scale.setScalar(THREE.MathUtils.lerp(REST_SCALE * (1 + hover * 0.06), 1, clamped) * entrance);

    state.yaw.target = state.targetYaw;
    state.pitch.target = state.targetPitch;
    spinNode.rotation.set(state.pitch.step(delta, reduceMotion), state.yaw.step(delta, reduceMotion), 0);

    if (hint.current) hint.current.opacity = clamped;
  });

  const hoveredHotspot = inspecting ? CARD_HOTSPOTS.find((item) => item.id === hovered) : undefined;
  const highlight = hoveredHotspot ? hotspotLocalRect(hoveredHotspot, CARD_WIDTH) : null;
  const faceZ = card.depth / 2 + 0.001;

  return (
    <>
      <group ref={root}>
        <group
          ref={spin}
          {...drag}
          onPointerMove={(event) => {
            drag.onPointerMove(event);
            if (!inspecting) return;
            const face = faceOf(event);
            const hotspot = face && event.uv ? hotspotAt(face, event.uv) : null;
            setHovered(hotspot?.id ?? null);
          }}
          onPointerOver={() => {
            motion.current.hovering = true;
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            motion.current.hovering = false;
            document.body.style.cursor = "";
            setHovered(null);
          }}
        >
          <primitive object={card.group} />
          {highlight && hoveredHotspot ? (
            <mesh
              position={hoveredHotspot.face === "front" ? [highlight.x, highlight.y, faceZ] : [-highlight.x, highlight.y, -faceZ]}
              rotation={[0, hoveredHotspot.face === "front" ? 0 : Math.PI, 0]}
              raycast={() => null}
            >
              <planeGeometry args={[highlight.width, highlight.height]} />
              <meshBasicMaterial color={theme.accent} transparent opacity={0.2} toneMapped={false} depthWrite={false} />
            </mesh>
          ) : null}
        </group>
        <mesh position={[0, -CARD_WIDTH / CARD_ASPECT / 2 - 0.035, 0.01]} raycast={() => null}>
          <planeGeometry args={[0.28, 0.04]} />
          <meshBasicMaterial ref={hint} map={hintTexture} transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
      <PutBackOnEscape active={inspecting} onPutBack={onPutBack} />
    </>
  );
}

function PutBackOnEscape({ active, onPutBack }: { active: boolean; onPutBack: () => void }) {
  useEffect(() => {
    if (!active) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") onPutBack();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [active, onPutBack]);
  return null;
}
