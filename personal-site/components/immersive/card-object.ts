import * as THREE from "three";

export const CARD_ASPECT = 1.586;

const palette = {
  metal: "#c5c6c3",
  rim: "#8c95a1",
  name: "#30322f",
  role: "#50544f",
  fine: "#5b6474",
  icon: "#5a6476",
  divider: "#a9b0ba",
  logo: "#111111",
};

const FONT = '"Avenir Next", "Segoe UI", system-ui, sans-serif';
const W = 1024;
const H = Math.round(W / CARD_ASPECT);
const PAD = W * 0.07;

export type CardFace = "front" | "back";

export type CardHotspot = {
  id: string;
  face: CardFace;
  href: string;
  label: string;
  /** Canvas pixels: x, y, width, height, origin at the top-left of the face texture. */
  rect: [number, number, number, number];
};

const FRONT_LOGO = Math.round(W * 0.2);
const BACK_LOGO = Math.round(W * 0.08);
const ROW_TOP = H * 0.32;
const ROW_STEP = W * 0.075;
const ROW_HEIGHT = W * 0.06;

export const CARD_HOTSPOTS: CardHotspot[] = [
  { id: "front-logo", face: "front", href: "/", label: "Website", rect: [W - PAD * 0.86 - FRONT_LOGO, PAD, FRONT_LOGO, FRONT_LOGO] },
  { id: "front-role", face: "front", href: "https://uwaterloo.ca/future-students/programs/software-engineering", label: "Software Engineering @ UWaterloo", rect: [PAD - 12, H - PAD - W * 0.045, W * 0.56, W * 0.06] },
  { id: "back-logo", face: "back", href: "/", label: "Website", rect: [W - PAD - BACK_LOGO, PAD - BACK_LOGO * 0.1, BACK_LOGO, BACK_LOGO] },
  { id: "back-email", face: "back", href: "mailto:sicheng.ouyang@uwaterloo.ca", label: "sicheng.ouyang@uwaterloo.ca", rect: [PAD - 12, ROW_TOP, W * 0.72, ROW_HEIGHT] },
  { id: "back-linkedin", face: "back", href: "https://www.linkedin.com/in/sicheng-ouyang/", label: "linkedin.com/in/sicheng-ouyang", rect: [PAD - 12, ROW_TOP + ROW_STEP, W * 0.72, ROW_HEIGHT] },
  { id: "back-github", face: "back", href: "https://github.com/carols12352", label: "github.com/carols12352", rect: [PAD - 12, ROW_TOP + ROW_STEP * 2, W * 0.72, ROW_HEIGHT] },
];

export function hotspotAt(face: CardFace, uv: { x: number; y: number }) {
  const px = uv.x * W;
  const py = (1 - uv.y) * H;
  return CARD_HOTSPOTS.find(({ face: hotspotFace, rect: [x, y, width, height] }) =>
    hotspotFace === face && px >= x && px <= x + width && py >= y && py <= y + height) ?? null;
}

/** Hotspot centre and size in the face mesh's local space, for placing highlight quads. */
export function hotspotLocalRect(hotspot: CardHotspot, cardWidth: number) {
  const cardHeight = cardWidth / CARD_ASPECT;
  const [x, y, width, height] = hotspot.rect;
  return {
    x: ((x + width / 2) / W - 0.5) * cardWidth,
    y: (0.5 - (y + height / 2) / H) * cardHeight,
    width: (width / W) * cardWidth,
    height: (height / H) * cardHeight,
  };
}

function rect(id: string) {
  const hotspot = CARD_HOTSPOTS.find((item) => item.id === id);
  if (!hotspot) throw new Error(`Unknown card hotspot ${id}`);
  return hotspot.rect;
}

function roundedRectShape(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - radius);
  shape.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(x + radius, y + height);
  shape.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + radius);
  shape.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);
  return shape;
}

function faceGeometry(shape: THREE.Shape, width: number, height: number) {
  const geometry = new THREE.ShapeGeometry(shape, 16);
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < position.count; index += 1) {
    uv.setXY(index, position.getX(index) / width + 0.5, position.getY(index) / height + 0.5);
  }
  uv.needsUpdate = true;
  return geometry;
}

function drawGrain(context: CanvasRenderingContext2D) {
  const gradient = context.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "rgba(255,255,255,0.18)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.08)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, W, H);

  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let index = 0; index < 9000; index += 1) {
    context.fillStyle = random() > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
    context.fillRect(random() * W, random() * H, 1.5, 1.5);
  }
}

function drawLogo(context: CanvasRenderingContext2D, logo: HTMLImageElement, [x, y, size]: [number, number, number, number]) {
  const mask = document.createElement("canvas");
  mask.width = size;
  mask.height = size;
  const maskContext = mask.getContext("2d");
  if (!maskContext) return;
  maskContext.drawImage(logo, 0, 0, size, size);
  maskContext.globalCompositeOperation = "source-in";
  maskContext.fillStyle = palette.logo;
  maskContext.fillRect(0, 0, size, size);
  context.drawImage(mask, x, y);
}

function drawContactIcon(context: CanvasRenderingContext2D, kind: string, x: number, y: number, size: number) {
  context.save();
  context.strokeStyle = palette.icon;
  context.fillStyle = palette.icon;
  context.lineWidth = size * 0.1;
  context.lineJoin = "round";
  if (kind === "email") {
    context.strokeRect(x, y + size * 0.15, size, size * 0.7);
    context.beginPath();
    context.moveTo(x, y + size * 0.15);
    context.lineTo(x + size / 2, y + size * 0.55);
    context.lineTo(x + size, y + size * 0.15);
    context.stroke();
  } else {
    context.beginPath();
    context.roundRect(x, y, size, size, size * 0.2);
    context.fill();
    context.fillStyle = palette.metal;
    context.font = `700 ${size * 0.62}px ${FONT}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(kind === "linkedin" ? "in" : "gh", x + size / 2, y + size * 0.54);
  }
  context.restore();
}

function paintFront(context: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  context.fillStyle = palette.metal;
  context.fillRect(0, 0, W, H);
  drawGrain(context);
  if (logo) drawLogo(context, logo, rect("front-logo"));
  context.textBaseline = "alphabetic";
  context.textAlign = "left";
  context.fillStyle = palette.name;
  context.font = `600 ${Math.round(W * 0.072)}px ${FONT}`;
  context.fillText("Sicheng Ouyang", PAD, H - PAD - W * 0.06);
  context.fillStyle = palette.role;
  context.font = `500 ${Math.round(W * 0.032)}px ${FONT}`;
  context.fillText("Software Engineering @ UWaterloo  \u2197", PAD, H - PAD);
}

function paintBack(context: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  context.fillStyle = palette.metal;
  context.fillRect(0, 0, W, H);
  drawGrain(context);
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = palette.name;
  context.font = `600 ${Math.round(W * 0.045)}px ${FONT}`;
  context.fillText("Let\u2019s connect.", PAD, PAD);
  if (logo) drawLogo(context, logo, rect("back-logo"));

  const rows = [
    { id: "back-email", icon: "email" },
    { id: "back-linkedin", icon: "linkedin" },
    { id: "back-github", icon: "github" },
  ];
  context.font = `500 ${Math.round(W * 0.034)}px ${FONT}`;
  for (const row of rows) {
    const [x, y, , height] = rect(row.id);
    const hotspot = CARD_HOTSPOTS.find((item) => item.id === row.id);
    const iconSize = height * 0.55;
    drawContactIcon(context, row.icon, x + 12, y + (height - iconSize) / 2, iconSize);
    context.fillStyle = palette.role;
    context.textBaseline = "middle";
    context.fillText(`${hotspot?.label ?? ""}  \u2197`, x + 12 + iconSize + 22, y + height / 2 + 2);
  }

  context.fillStyle = palette.divider;
  context.fillRect(PAD, H - PAD - 76, W - PAD * 2, 2);
  context.fillStyle = palette.fine;
  context.font = `500 ${Math.round(W * 0.028)}px ${FONT}`;
  context.textBaseline = "alphabetic";
  context.fillText("Sicheng Ouyang", PAD, H - PAD);
  context.textAlign = "right";
  context.fillText("Waterloo, Ontario", W - PAD, H - PAD);
  context.textAlign = "left";
}

function faceTexture(paint: (context: CanvasRenderingContext2D, logo: HTMLImageElement | null) => void, logo: Promise<HTMLImageElement | null>) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (!context) return texture;
  paint(context, null);
  void logo.then((image) => {
    if (!image) return;
    paint(context, image);
    texture.needsUpdate = true;
  });
  return texture;
}

function loadLogo() {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = "/favicon-light.png";
  });
}

export type CardObject = {
  group: THREE.Group;
  front: THREE.Mesh;
  back: THREE.Mesh;
  width: number;
  depth: number;
  dispose: () => void;
};

export function createCardObject(width = 0.3): CardObject {
  const height = width / CARD_ASPECT;
  const radius = width * 0.028;
  const depth = width * 0.008;
  const shape = roundedRectShape(width, height, radius);

  const bodyGeometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 16 });
  bodyGeometry.translate(0, 0, -depth / 2);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: palette.rim, metalness: 0.5, roughness: 0.35 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.name = "CardBody";

  const logo = loadLogo();
  const frontTexture = faceTexture(paintFront, logo);
  const backTexture = faceTexture(paintBack, logo);
  const surface = faceGeometry(shape, width, height);
  const frontMaterial = new THREE.MeshStandardMaterial({ map: frontTexture, metalness: 0.3, roughness: 0.42 });
  const backMaterial = new THREE.MeshStandardMaterial({ map: backTexture, metalness: 0.3, roughness: 0.42 });

  const front = new THREE.Mesh(surface, frontMaterial);
  front.name = "CardFront";
  front.position.z = depth / 2 + 0.0002;

  const back = new THREE.Mesh(surface, backMaterial);
  back.name = "CardBack";
  back.rotation.y = Math.PI;
  back.position.z = -depth / 2 - 0.0002;

  const group = new THREE.Group();
  group.name = "SichengCard";
  group.add(body, front, back);

  return {
    group,
    front,
    back,
    width,
    depth,
    dispose: () => {
      bodyGeometry.dispose();
      surface.dispose();
      bodyMaterial.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      frontTexture.dispose();
      backTexture.dispose();
    },
  };
}
