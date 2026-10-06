export const EYE_HEIGHT = 1.45;

/** Mutable per-frame state shared through a ref so gestures never trigger React renders. */
export type SceneState = {
  /** Rotation of the content ring around the viewer, in radians. */
  yaw: number;
  yawVelocity: number;
  /** Preview-only camera pitch; the headset controls its own camera in XR. */
  pitch: number;
  pinching: boolean;
  /** 0 to 1 entrance progress, shared so every element unfolds on the same clock. */
  entrance: number;
};

export function createSceneState(): SceneState {
  return { yaw: 0, yawVelocity: 0, pitch: -0.16, pinching: false, entrance: 0 };
}

/** Only one immersive scene is mounted at a time, so frames and gestures share this object directly. */
export const sceneState: SceneState = createSceneState();

export function resetSceneState() {
  Object.assign(sceneState, createSceneState());
}

export async function openLink(href: string, session: XRSession | null | undefined) {
  if (href.startsWith("/")) {
    await session?.end().catch(() => {});
    window.location.assign(href);
    return;
  }
  if (href.startsWith("mailto:")) {
    window.location.href = href;
    await session?.end().catch(() => {});
    return;
  }
  // Open before ending the session: the tab must open while the tap still counts as a user gesture.
  window.open(href, "_blank", "noopener,noreferrer");
  await session?.end().catch(() => {});
}
