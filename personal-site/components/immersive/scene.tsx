"use client";

import { OrbitControls } from "@react-three/drei";
import { useXR } from "@react-three/xr";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { CardModel } from "./card-model";
import { createPanelTexture, panelStyles } from "./panel-texture";
import { Panels } from "./panels";

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
  vec3 color = h > 0.0 ? mix(horizon, top, pow(h, 0.6)) : mix(horizon, bottom, pow(-h, 0.4));
  gl_FragColor = vec4(color, 1.0);
}
`;

function Environment() {
  const skyUniforms = useMemo(() => ({
    top: { value: new THREE.Color("#cfd8e6") },
    horizon: { value: new THREE.Color("#f3f1ed") },
    bottom: { value: new THREE.Color("#d5d9df") },
  }), []);
  const rings = [1.2, 2.4, 3.6, 6, 9];

  return (
    <group>
      <mesh scale={60}>
        <sphereGeometry args={[1, 48, 24]} />
        <shaderMaterial side={THREE.BackSide} uniforms={skyUniforms} vertexShader={skyVertex} fragmentShader={skyFragment} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[30, 96]} />
        <meshStandardMaterial color="#e1e4e9" roughness={0.95} />
      </mesh>
      {rings.map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <ringGeometry args={[radius - 0.004, radius + 0.004, 160]} />
          <meshBasicMaterial color="#b8bfc8" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      ))}
      <hemisphereLight args={["#ffffff", "#b8bfc8", 1.4]} />
      <directionalLight position={[1.5, 4, 2]} intensity={1.6} />
    </group>
  );
}

function ExitButton() {
  const session = useXR((state) => state.session);
  const { texture } = useMemo(() => createPanelTexture({ title: "Exit immersive" }, 0.4, 0.11, { ...panelStyles.light, titleScale: 0.85, align: "center" }), []);
  useEffect(() => () => texture.dispose(), [texture]);
  if (!session) return null;
  return (
    <mesh
      position={[0, 0.95, -1.1]}
      rotation={[-0.55, 0, 0]}
      onClick={(event) => {
        event.stopPropagation();
        void session.end();
      }}
    >
      <planeGeometry args={[0.4, 0.11]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function PreviewControls() {
  const session = useXR((state) => state.session);
  if (session) return null;
  return <OrbitControls target={[0, 1.45, -0.01]} enableZoom={false} enablePan={false} rotateSpeed={-0.35} />;
}

export function ImmersiveScene({ reduceMotion }: { reduceMotion: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <Environment />
      <Panels selected={selected} onSelect={setSelected} reduceMotion={reduceMotion} />
      <CardModel position={[0, 1.2, -0.8]} rotation={[-0.35, 0, 0]} float={!reduceMotion} />
      <ExitButton />
      <PreviewControls />
    </>
  );
}
