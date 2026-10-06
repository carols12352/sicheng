import * as THREE from "three";

/**
 * visionOS-style spring parameters: `response` is roughly the settle time in seconds,
 * `damping` is the damping fraction (1 = no overshoot, lower = more bounce).
 */
export type SpringConfig = { response: number; damping: number };

export const SPRINGS = {
  /** Panels, windows, anything that should glide without bouncing. */
  smooth: { response: 0.5, damping: 1 },
  /** Hover lift and highlights. */
  snappy: { response: 0.28, damping: 0.86 },
  /** Objects that land, open or get pressed. */
  bouncy: { response: 0.45, damping: 0.68 },
  /** Following a pointer while dragging. */
  follow: { response: 0.12, damping: 1 },
} satisfies Record<string, SpringConfig>;

const MAX_STEP = 1 / 120;

function coefficients({ response, damping }: SpringConfig) {
  const omega = (2 * Math.PI) / Math.max(response, 1e-3);
  return { stiffness: omega * omega, friction: 2 * damping * omega };
}

/** A scalar spring that keeps its velocity when the target changes mid-flight. */
export class Spring {
  value: number;
  velocity = 0;
  target: number;

  constructor(value: number, public config: SpringConfig = SPRINGS.smooth) {
    this.value = value;
    this.target = value;
  }

  step(delta: number, instant = false) {
    if (instant) {
      this.value = this.target;
      this.velocity = 0;
      return this.value;
    }
    const { stiffness, friction } = coefficients(this.config);
    let remaining = Math.min(delta, 0.1);
    while (remaining > 0) {
      const dt = Math.min(remaining, MAX_STEP);
      this.velocity += (stiffness * (this.target - this.value) - friction * this.velocity) * dt;
      this.value += this.velocity * dt;
      remaining -= dt;
    }
    return this.value;
  }

  get settled() {
    return Math.abs(this.target - this.value) < 1e-4 && Math.abs(this.velocity) < 1e-4;
  }
}

export class Spring3 {
  value: THREE.Vector3;
  velocity = new THREE.Vector3();
  target: THREE.Vector3;

  constructor(value: THREE.Vector3 = new THREE.Vector3(), public config: SpringConfig = SPRINGS.smooth) {
    this.value = value.clone();
    this.target = value.clone();
  }

  snap(to: THREE.Vector3) {
    this.value.copy(to);
    this.target.copy(to);
    this.velocity.set(0, 0, 0);
  }

  step(delta: number, instant = false) {
    if (instant) {
      this.value.copy(this.target);
      this.velocity.set(0, 0, 0);
      return this.value;
    }
    const { stiffness, friction } = coefficients(this.config);
    let remaining = Math.min(delta, 0.1);
    while (remaining > 0) {
      const dt = Math.min(remaining, MAX_STEP);
      for (const axis of ["x", "y", "z"] as const) {
        this.velocity[axis] += (stiffness * (this.target[axis] - this.value[axis]) - friction * this.velocity[axis]) * dt;
        this.value[axis] += this.velocity[axis] * dt;
      }
      remaining -= dt;
    }
    return this.value;
  }
}
