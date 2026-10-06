"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { InspectableCard } from "./card-model";
import { DetailWindow } from "./detail-window";
import { findItem } from "./items";
import { Cartridges } from "./cartridges";
import { Globe } from "./globe";
import { Plinth } from "./plinth";
import { Ring } from "./ring";
import { Terminal } from "./terminal";
import { Toys } from "./toys";
import { sceneState } from "./scene-state";
import { pillTexture } from "./textures";
import { ThemeContext, themes, useTheme } from "./theme";
import type { SiteScheme } from "@/hooks/use-site-scheme";
import { useDrag, wrapAngle, yawOf, type DragEvent } from "./use-drag";

const DEG = Math.PI / 180;
export const PREVIEW_FOV = 62;

const skyVertex = `
varying vec3 vWorld;
void main() {
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

const skyFragment = `
uniform vec3 top;
uniform vec3 horizon;
uniform vec3 bottom;
varying vec3 vWorld;
void main() {
  float h = normalize(vWorld).y;
  vec3 color = h > 0.0 ? mix(horizon, top, pow(h, 0.5)) : mix(horizon, bottom, pow(-h, 0.35));
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

const floorVertex = `
varying vec2 vPlane;
void main() {
  vPlane = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const floorFragment = `
uniform vec3 base;
uniform vec3 line;
uniform vec3 haze;
varying vec2 vPlane;
float gridLine(float value) {
  float width = fwidth(value);
  return 1.0 - smoothstep(0.0, width * 1.5, abs(fract(value - 0.5) - 0.5));
}
void main() {
  float radius = length(vPlane);
  float rings = gridLine(radius);
  float fade = exp(-radius * 0.3);
  vec3 color = mix(base, line, rings * fade * 0.8);
  color = mix(color, haze, smoothstep(4.0, 30.0, radius));
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

function Environment() {
  const theme = useTheme();
  const skyUniforms = useMemo(() => ({
    top: { value: new THREE.Color(theme.skyTop) },
    horizon: { value: new THREE.Color(theme.horizon) },
    bottom: { value: new THREE.Color(theme.floor) },
  }), [theme]);
  const floorUniforms = useMemo(() => ({
    base: { value: new THREE.Color(theme.floor) },
    line: { value: new THREE.Color(theme.floorLine) },
    haze: { value: new THREE.Color(theme.horizon) },
  }), [theme]);

  return (
    <group>
      <color attach="background" args={[theme.floor]} />
      <mesh scale={60} raycast={() => null}>
        <sphereGeometry args={[1, 48, 24]} />
        <shaderMaterial key={`sky-${theme.skyTop}`} side={THREE.BackSide} uniforms={skyUniforms} vertexShader={skyVertex} fragmentShader={skyFragment} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <circleGeometry args={[30, 128]} />
        <shaderMaterial key={`floor-${theme.floor}`} uniforms={floorUniforms} vertexShader={floorVertex} fragmentShader={floorFragment} />
      </mesh>
      <hemisphereLight args={["#ffffff", theme.floor, 1.3]} />
      <directionalLight position={[1.5, 4, 2]} intensity={1.6} />
    </group>
  );
}

function ExitButton() {
  const theme = useTheme();
  const session = useXR((state) => state.session);
  const texture = useMemo(() => pillTexture("Exit", 0.16, 0.06, theme), [theme]);
  useEffect(() => () => texture.dispose(), [texture]);
  const drag = useDrag({ onTap: () => void session?.end() });
  if (!session) return null;
  return (
    <mesh position={[0, 0.88, -0.95]} rotation={[-0.6, 0, 0]} {...drag}>
      <planeGeometry args={[0.16, 0.06]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

/** Wheel and two-finger pinch zoom plus camera pitch, for the flat-screen preview only. */
function PreviewCamera({ enabled }: { enabled: boolean }) {
  const element = useThree((state) => state.gl.domElement);
  const targetFov = useRef(PREVIEW_FOV);

  useEffect(() => {
    if (!enabled) return;
    const touches = new Map<number, { x: number; y: number }>();
    let startDistance = 0;
    let startFov = PREVIEW_FOV;
    const clampFov = (value: number) => THREE.MathUtils.clamp(value, 35, 80);
    const spread = () => {
      const [a, b] = [...touches.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      targetFov.current = clampFov(targetFov.current + event.deltaY * 0.03);
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touches.size === 2) {
        sceneState.pinching = true;
        startDistance = spread();
        startFov = targetFov.current;
      }
    };
    const onMove = (event: PointerEvent) => {
      if (!touches.has(event.pointerId)) return;
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touches.size === 2 && startDistance > 0) targetFov.current = clampFov(startFov * (startDistance / spread()));
    };
    const onUp = (event: PointerEvent) => {
      touches.delete(event.pointerId);
      if (touches.size < 2) startDistance = 0;
      if (touches.size === 0) sceneState.pinching = false;
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [element, enabled]);

  useFrame(({ camera }, delta) => {
    if (!enabled || !(camera instanceof THREE.PerspectiveCamera)) return;
    camera.rotation.set(sceneState.pitch, 0, 0, "YXZ");
    const next = camera.fov + (targetFov.current - camera.fov) * Math.min(1, delta * 10);
    if (Math.abs(next - camera.fov) > 0.01) {
      camera.fov = next;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function screenPoint(event: DragEvent) {
  const native = event.nativeEvent as PointerEvent | undefined;
  const target = native?.target;
  if (native && target instanceof HTMLElement) {
    const rect = target.getBoundingClientRect();
    return { x: ((native.clientX - rect.left) / rect.width) * 2 - 1, y: -((native.clientY - rect.top) / rect.height) * 2 + 1 };
  }
  return { x: event.pointer.x, y: event.pointer.y };
}

type DetailState = { id: string; from: THREE.Vector3; open: boolean };

type ImmersiveSceneProps = {
  reduceMotion: boolean;
  scheme: SiteScheme;
};

export function ImmersiveScene({ reduceMotion, scheme }: ImmersiveSceneProps) {
  const session = useXR((state) => state.session);
  const inXR = Boolean(session);
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const ring = useRef<THREE.Group>(null);
  const look = useRef({ dragging: false, pinched: false, startYaw: 0, startPitch: 0, startX: 0, startY: 0, lastYaw: 0, velocity: 0 });

  const closeDetail = useCallback(() => setDetail((current) => (current ? { ...current, open: false } : null)), []);
  const dropDetail = useCallback(() => setDetail((current) => (current && !current.open ? null : current)), []);
  const openDetail = useCallback((id: string, from: THREE.Vector3) => {
    setInspecting(false);
    setDetail((current) => (current?.open && current.id === id ? { ...current, open: false } : { id, from, open: true }));
  }, []);
  const inspectCard = useCallback(() => {
    setDetail((current) => (current ? { ...current, open: false } : null));
    setInspecting(true);
  }, []);
  const putBack = useCallback(() => setInspecting(false), []);
  const detailItem = detail ? findItem(detail.id) : undefined;

  const catcher = useDrag({
    threshold: 0.01,
    onTap: () => {
      setInspecting(false);
      closeDetail();
    },
    onDragStart(event) {
      const state = look.current;
      const point = screenPoint(event);
      state.dragging = true;
      state.pinched = false;
      state.startYaw = sceneState.yaw;
      state.startPitch = sceneState.pitch;
      state.lastYaw = sceneState.yaw;
      state.velocity = 0;
      state.startX = point.x;
      state.startY = point.y;
      sceneState.yawVelocity = 0;
    },
    onDrag(event, start) {
      const state = look.current;
      const scene = sceneState;
      if (scene.pinching) {
        state.pinched = true;
        return;
      }
      if (state.pinched) return;
      if (inXR) {
        scene.yaw = state.startYaw - wrapAngle(yawOf(event.ray.direction) - yawOf(start.direction)) * 1.6;
        return;
      }
      const camera = event.camera as THREE.PerspectiveCamera;
      const verticalFov = (camera.fov ?? PREVIEW_FOV) * DEG;
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * (camera.aspect ?? 1));
      const point = screenPoint(event);
      scene.yaw = state.startYaw - (point.x - state.startX) * (horizontalFov / 2);
      scene.pitch = THREE.MathUtils.clamp(state.startPitch - (point.y - state.startY) * (verticalFov / 2), -0.7, 0.7);
    },
    onDragEnd() {
      const state = look.current;
      state.dragging = false;
      sceneState.yawVelocity = reduceMotion || state.pinched ? 0 : THREE.MathUtils.clamp(state.velocity, -4, 4);
    },
  });

  useFrame((_, delta) => {
    const scene = sceneState;
    const state = look.current;
    scene.entrance = reduceMotion ? 1 : Math.min(1, scene.entrance + delta / 1.8);
    if (state.dragging) {
      const instant = (scene.yaw - state.lastYaw) / Math.max(delta, 1e-3);
      state.velocity = state.velocity * 0.6 + instant * 0.4;
      state.lastYaw = scene.yaw;
    } else if (scene.yawVelocity !== 0) {
      scene.yaw += scene.yawVelocity * delta;
      scene.yawVelocity *= Math.exp(-delta * 3);
      if (Math.abs(scene.yawVelocity) < 0.01) scene.yawVelocity = 0;
    }
    if (ring.current) ring.current.rotation.y = scene.yaw;
  });

  return (
    <ThemeContext.Provider value={themes[scheme]}>
      <Environment />
      <mesh {...catcher}>
        <sphereGeometry args={[9, 32, 16]} />
        <meshBasicMaterial side={THREE.BackSide} colorWrite={false} depthWrite={false} />
      </mesh>
      <group ref={ring}>
        <Ring
          activeId={detail?.open ? detail.id : null}
          dim={Boolean(detail?.open) || inspecting}
          inXR={inXR}
          onOpen={openDetail}
          reduceMotion={reduceMotion}
        />
        <Plinth reduceMotion={reduceMotion}>
          <Terminal position={[-0.26, 0, 0.12]} reduceMotion={reduceMotion} />
          <Cartridges activeId={detail?.open ? detail.id : null} onOpen={openDetail} onEject={closeDetail} reduceMotion={reduceMotion} />
          <Globe position={[0, 0.24, -0.04]} reduceMotion={reduceMotion} />
        </Plinth>
        <Toys reduceMotion={reduceMotion} />
      </group>
      {detail && detailItem ? (
        <DetailWindow
          key={`${detail.id}-${detail.from.x}-${detail.from.z}`}
          item={detailItem}
          from={detail.from}
          open={detail.open}
          inXR={inXR}
          reduceMotion={reduceMotion}
          onClose={closeDetail}
          onGone={dropDetail}
        />
      ) : null}
      <InspectableCard
        inspecting={inspecting}
        onInspect={inspectCard}
        onPutBack={putBack}
        reduceMotion={reduceMotion}
      />
      <ExitButton />
      <PreviewCamera enabled={!inXR} />
    </ThemeContext.Provider>
  );
}
