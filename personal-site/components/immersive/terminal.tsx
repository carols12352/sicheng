"use client";

import { useFrame } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { faceCameraYaw } from "./billboard";
import { CARD_HOTSPOTS } from "./card-object";
import { openLink } from "./scene-state";
import { Spring, SPRINGS } from "./spring";
import { canvasOf, frame, makeTexture, MONO } from "./textures";
import { useTheme, type Theme } from "./theme";
import { useDrag, type DragEvent } from "./use-drag";

const SCREEN_WIDTH = 0.34;
const SCREEN_HEIGHT = 0.2;
const PPM = 2400;
const CHARS_PER_SECOND = 70;

type Line = { text: string; kind: "prompt" | "output" | "link"; href?: string };

const LINKS = ["back-github", "back-linkedin", "back-email"].map((id) => CARD_HOTSPOTS.find((hotspot) => hotspot.id === id)!);

const LINES: Line[] = [
  { text: "$ whoami", kind: "prompt" },
  { text: "Sicheng Ouyang", kind: "output" },
  { text: "Software Engineering @ UWaterloo", kind: "output" },
  { text: "$ links", kind: "prompt" },
  ...LINKS.map((link) => ({ text: link.label, kind: "link" as const, href: link.href })),
];
const TOTAL = LINES.reduce((sum, line) => sum + line.text.length, 0);

const PAD = 0.018 * PPM;
const LINE_HEIGHT = 0.021 * PPM;
const TOP = PAD + 0.004 * PPM;

function drawScreen(context: CanvasRenderingContext2D, revealed: number, hovered: number, theme: Theme) {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
  frame(context, width, height, PPM, theme, 0.95);
  context.font = `500 ${0.0125 * PPM}px ${MONO}`;
  context.textBaseline = "top";
  let left = revealed;
  LINES.forEach((line, index) => {
    if (left <= 0) return;
    const text = line.text.slice(0, left);
    left -= line.text.length;
    const y = TOP + index * LINE_HEIGHT;
    context.fillStyle = line.kind === "prompt" ? theme.muted : line.kind === "link" ? theme.accent : theme.strong;
    context.fillText(text, PAD, y);
    if (line.kind === "link" && hovered === index) context.fillRect(PAD, y + 0.0142 * PPM, context.measureText(text).width, 2);
  });
  if (revealed < TOTAL || Math.floor(performance.now() / 500) % 2 === 0) {
    let index = 0;
    let count = revealed;
    while (index < LINES.length - 1 && count > LINES[index].text.length) {
      count -= LINES[index].text.length;
      index += 1;
    }
    const x = PAD + context.measureText(LINES[index].text.slice(0, count)).width + 4;
    context.fillStyle = theme.accent;
    context.fillRect(x, TOP + index * LINE_HEIGHT, 0.007 * PPM, 0.013 * PPM);
  }
}

/** A single keycap; press it and a small screen types out who I am and where to find me. */
export function Terminal({ position, reduceMotion }: { position: [number, number, number]; reduceMotion: boolean }) {
  const theme = useTheme();
  const session = useXR((state) => state.session);
  const [open, setOpen] = useState(false);
  const cap = useRef<THREE.Mesh>(null);
  const screen = useRef<THREE.Group>(null);
  const screenMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const live = useRef({
    press: new Spring(0, SPRINGS.bouncy),
    hover: new Spring(0, SPRINGS.snappy),
    reveal: new Spring(0, SPRINGS.bouncy),
    typed: 0,
    drawn: -1,
    hovered: -1,
    blink: -1,
    hovering: false,
  });
  const geometry = useMemo(
    () => ({ cap: new RoundedBoxGeometry(0.07, 0.03, 0.07, 4, 0.01), base: new RoundedBoxGeometry(0.1, 0.012, 0.1, 4, 0.005) }),
    [],
  );
  const [canvas] = useState(() => canvasOf(SCREEN_WIDTH * PPM, SCREEN_HEIGHT * PPM));
  const texture = useMemo(() => makeTexture(canvas.canvas), [canvas]);
  const glyph = useMemo(() => {
    const { canvas: glyphCanvas, context } = canvasOf(256, 256);
    if (context) {
      context.font = `600 110px ${MONO}`;
      context.fillStyle = theme.accent;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(">_", 128, 132);
    }
    return makeTexture(glyphCanvas);
  }, [theme]);
  useEffect(() => () => {
    geometry.cap.dispose();
    geometry.base.dispose();
    texture.dispose();
    glyph.dispose();
  }, [geometry, texture, glyph]);
  useEffect(() => {
    live.current.drawn = -1;
  }, [theme]);

  const press = useDrag({
    onTap() {
      const state = live.current;
      state.press.velocity = -0.9;
      setOpen((current) => {
        if (!current) state.typed = 0;
        return !current;
      });
    },
  });

  const lineAt = (event: DragEvent) => {
    if (!event.uv) return -1;
    const index = Math.floor(((1 - event.uv.y) * SCREEN_HEIGHT * PPM - TOP) / LINE_HEIGHT);
    return LINES[index]?.kind === "link" ? index : -1;
  };
  const screenTap = useDrag({
    onTap(event) {
      const index = lineAt(event);
      const href = LINES[index]?.href;
      if (href) void openLink(href, session);
    },
  });

  useFrame((frameState, delta) => {
    const state = live.current;
    state.press.target = 0;
    state.hover.target = state.hovering ? 1 : 0;
    state.reveal.target = open ? 1 : 0;
    const pressed = state.press.step(delta, reduceMotion);
    const hover = state.hover.step(delta, reduceMotion);
    const reveal = state.reveal.step(delta, reduceMotion);
    if (cap.current) cap.current.position.y = 0.012 + 0.015 + Math.max(-0.012, Math.min(0, pressed) * 0.15) + hover * 0.004;

    if (open) state.typed = reduceMotion ? TOTAL : Math.min(TOTAL, state.typed + delta * CHARS_PER_SECOND);
    const revealed = Math.floor(state.typed);
    const blink = Math.floor(performance.now() / 500) % 2;
    if (canvas.context && reveal > 0.01 && (revealed !== state.drawn || blink !== state.blink)) {
      drawScreen(canvas.context, revealed, state.hovered, theme);
      if (screenMaterial.current?.map) screenMaterial.current.map.needsUpdate = true;
      state.drawn = revealed;
      state.blink = blink;
    }

    const node = screen.current;
    if (node) {
      node.visible = reveal > 0.01;
      node.scale.setScalar(Math.max(0.001, reveal));
      node.position.y = 0.06 + reveal * 0.1;
      faceCameraYaw(node, frameState.camera);
    }
  });

  return (
    <group position={position}>
      <mesh geometry={geometry.base} position={[0, 0.006, 0]} raycast={() => null}>
        <meshStandardMaterial color={theme.plinth} roughness={0.6} />
      </mesh>
      <mesh
        ref={cap}
        geometry={geometry.cap}
        position={[0, 0.027, 0]}
        {...press}
        onPointerOver={() => {
          live.current.hovering = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          live.current.hovering = false;
          document.body.style.cursor = "";
        }}
      >
        <meshStandardMaterial color={theme.object} roughness={0.45} />
        <mesh position={[0, 0.0152, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <planeGeometry args={[0.05, 0.05]} />
          <meshBasicMaterial map={glyph} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </mesh>
      <group ref={screen} visible={false}>
        <mesh
          {...screenTap}
          onPointerMove={(event) => {
            screenTap.onPointerMove(event);
            const index = lineAt(event);
            if (index !== live.current.hovered) {
              live.current.hovered = index;
              live.current.drawn = -1;
              document.body.style.cursor = index >= 0 ? "pointer" : "";
            }
          }}
          onPointerOut={() => {
            live.current.hovered = -1;
            live.current.drawn = -1;
            document.body.style.cursor = "";
          }}
          position={[0, SCREEN_HEIGHT / 2, 0]}
        >
          <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
          <meshBasicMaterial ref={screenMaterial} map={texture} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
