"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PLINTH_RADIUS, PLINTH_TOP } from "./plinth";
import { Spring, Spring3, SPRINGS } from "./spring";
import { useTheme } from "./theme";
import { useGrab } from "./use-grab";

const GRAVITY = 9.8;
const BOUNDS = 1.7;
const RESTITUTION = 0.5;

type Shape = "icosahedron" | "box" | "octahedron";

type Body = {
  shape: Shape;
  radius: number;
  start: THREE.Vector3;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  quaternion: THREE.Quaternion;
  held: boolean;
  follow: Spring3;
  hover: Spring;
  hovered: boolean;
};

function createBodies(): Body[] {
  const make = (shape: Shape, radius: number, x: number, z: number): Body => {
    const start = new THREE.Vector3(PLINTH_TOP.x + x, PLINTH_TOP.y + radius, PLINTH_TOP.z + z);
    return {
      shape,
      radius,
      start,
      position: start.clone(),
      velocity: new THREE.Vector3(),
      spin: new THREE.Vector3(),
      quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random(), Math.random(), 0)),
      held: false,
      follow: new Spring3(start, SPRINGS.follow),
      hover: new Spring(0, SPRINGS.snappy),
      hovered: false,
    };
  };
  return [make("icosahedron", 0.034, -0.36, -0.04), make("box", 0.03, 0.37, -0.03), make("octahedron", 0.032, -0.13, 0.31)];
}

/** Shared with the frame loop like sceneState; reset whenever the toys mount. */
const bodies: Body[] = createBodies();

/** Objects on the plinth, as spheres in plinth-top space, so toys knock against them instead of passing through. */
const OBSTACLES = [
  { x: -0.26, y: 0.03, z: 0.12, r: 0.05 },
  { x: 0, y: 0.02, z: 0.14, r: 0.05 },
  { x: 0.26, y: 0.05, z: 0.14, r: 0.07 },
  { x: 0, y: 0.24, z: -0.04, r: 0.085 },
  ...[-0.18, -0.06, 0.06, 0.18].map((x) => ({ x, y: 0.045, z: -0.2, r: 0.045 })),
].map(({ x, y, z, r }) => ({ center: new THREE.Vector3(PLINTH_TOP.x + x, PLINTH_TOP.y + y, PLINTH_TOP.z + z), radius: r }));

const scratch = { normal: new THREE.Vector3(), axis: new THREE.Vector3(), delta: new THREE.Quaternion(), up: new THREE.Vector3(0, 1, 0) };

function integrate(body: Body, dt: number) {
  body.velocity.y -= GRAVITY * dt;
  body.position.addScaledVector(body.velocity, dt);

  const plinthDistance = Math.hypot(body.position.x - PLINTH_TOP.x, body.position.z - PLINTH_TOP.z);
  const overPlinth = plinthDistance < PLINTH_RADIUS && body.position.y > PLINTH_TOP.y - 0.03;
  if (!overPlinth && plinthDistance < PLINTH_RADIUS + body.radius && body.position.y < PLINTH_TOP.y && body.position.y > PLINTH_TOP.y - 0.05) {
    scratch.normal.set(body.position.x - PLINTH_TOP.x, 0, body.position.z - PLINTH_TOP.z).normalize();
    body.position.x = PLINTH_TOP.x + scratch.normal.x * (PLINTH_RADIUS + body.radius);
    body.position.z = PLINTH_TOP.z + scratch.normal.z * (PLINTH_RADIUS + body.radius);
    const into = body.velocity.dot(scratch.normal);
    if (into < 0) body.velocity.addScaledVector(scratch.normal, -into * (1 + RESTITUTION));
  }

  const ground = (overPlinth ? PLINTH_TOP.y : 0) + body.radius;
  if (body.position.y < ground) {
    body.position.y = ground;
    if (body.velocity.y < 0) body.velocity.y = Math.abs(body.velocity.y) < 0.4 ? 0 : -body.velocity.y * RESTITUTION;
    const friction = Math.exp(-dt * 2.4);
    body.velocity.x *= friction;
    body.velocity.z *= friction;
    scratch.axis.crossVectors(scratch.up, body.velocity).divideScalar(body.radius);
    body.spin.lerp(scratch.axis, Math.min(1, dt * 12));
  } else {
    body.spin.multiplyScalar(Math.exp(-dt * 0.3));
  }

  for (const obstacle of OBSTACLES) {
    scratch.normal.subVectors(body.position, obstacle.center);
    const distance = scratch.normal.length();
    const overlap = obstacle.radius + body.radius - distance;
    if (overlap <= 0 || distance < 1e-6) continue;
    scratch.normal.divideScalar(distance);
    body.position.addScaledVector(scratch.normal, overlap);
    const into = body.velocity.dot(scratch.normal);
    if (into < 0) body.velocity.addScaledVector(scratch.normal, -into * (1 + RESTITUTION));
  }

  const horizontal = Math.hypot(body.position.x, body.position.z);
  if (horizontal > BOUNDS) {
    scratch.normal.set(body.position.x, 0, body.position.z).divideScalar(horizontal);
    body.position.x = scratch.normal.x * BOUNDS;
    body.position.z = scratch.normal.z * BOUNDS;
    const out = body.velocity.dot(scratch.normal);
    if (out > 0) body.velocity.addScaledVector(scratch.normal, -out * (1 + RESTITUTION));
  }
  if (horizontal < 0.25) {
    scratch.normal.set(body.position.x, 0, body.position.z).normalize();
    body.position.x = scratch.normal.x * 0.25;
    body.position.z = scratch.normal.z * 0.25;
  }

  const speed = body.spin.length();
  if (speed > 1e-4) {
    scratch.delta.setFromAxisAngle(scratch.axis.copy(body.spin).divideScalar(speed), speed * dt);
    body.quaternion.premultiply(scratch.delta);
  }
}

function collide(a: Body, b: Body) {
  scratch.normal.subVectors(b.position, a.position);
  const distance = scratch.normal.length();
  const overlap = a.radius + b.radius - distance;
  if (overlap <= 0 || distance < 1e-6) return;
  scratch.normal.divideScalar(distance);
  if (!a.held) a.position.addScaledVector(scratch.normal, -overlap / (b.held ? 1 : 2));
  if (!b.held) b.position.addScaledVector(scratch.normal, overlap / (a.held ? 1 : 2));
  const approach = a.velocity.dot(scratch.normal) - b.velocity.dot(scratch.normal);
  if (approach <= 0) return;
  const impulse = approach * (1 + RESTITUTION) * 0.5;
  if (!a.held) a.velocity.addScaledVector(scratch.normal, -impulse);
  if (!b.held) b.velocity.addScaledVector(scratch.normal, impulse);
}

function Toy({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const theme = useTheme();
  const mesh = useRef<THREE.Mesh>(null);
  const body = bodies[index];
  const geometry = useMemo(() => {
    if (body.shape === "box") return new THREE.BoxGeometry(body.radius * 1.3, body.radius * 1.3, body.radius * 1.3);
    if (body.shape === "octahedron") return new THREE.OctahedronGeometry(body.radius);
    return new THREE.IcosahedronGeometry(body.radius, 0);
  }, [body]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const color = body.shape === "icosahedron" ? theme.accent : body.shape === "box" ? theme.strong : theme.muted;

  const grab = useGrab({
    target: mesh,
    onGrab() {
      const self = bodies[index];
      self.held = true;
      self.follow.snap(self.position);
      self.spin.set(0, 0, 0);
    },
    onMove(position) {
      bodies[index].follow.target.copy(position);
    },
    onRelease(velocity) {
      const self = bodies[index];
      self.held = false;
      self.velocity.copy(velocity);
      self.spin.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(velocity.length() * 12);
    },
  });

  useFrame((_, delta) => {
    const self = bodies[index];
    self.hover.target = self.hovered || self.held ? 1 : 0;
    const hover = self.hover.step(delta, reduceMotion);
    if (!mesh.current) return;
    mesh.current.position.copy(self.position);
    mesh.current.quaternion.copy(self.quaternion);
    mesh.current.scale.setScalar(1 + hover * 0.12);
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      {...grab}
      onPointerOver={() => {
        bodies[index].hovered = true;
        document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        bodies[index].hovered = false;
        document.body.style.cursor = "";
      }}
    >
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} flatShading />
    </mesh>
  );
}

/** A few shapes on the floor to pick up and throw; they bounce off the floor, the plinth and each other. */
export function Toys({ reduceMotion }: { reduceMotion: boolean }) {
  useEffect(() => {
    bodies.splice(0, bodies.length, ...createBodies());
  }, []);

  useFrame((_, delta) => {
    let remaining = Math.min(delta, 0.05);
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 240);
      for (const body of bodies) {
        if (body.held) {
          const previous = body.position.clone();
          body.position.copy(body.follow.step(dt));
          body.velocity.subVectors(body.position, previous).divideScalar(dt);
        } else {
          integrate(body, dt);
        }
      }
      for (let a = 0; a < bodies.length; a += 1) {
        for (let b = a + 1; b < bodies.length; b += 1) collide(bodies[a], bodies[b]);
      }
      remaining -= dt;
    }
  });

  return (
    <group>
      {bodies.map((body, index) => (
        <Toy key={body.shape} index={index} reduceMotion={reduceMotion} />
      ))}
    </group>
  );
}
