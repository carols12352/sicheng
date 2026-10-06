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
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = Math.round(TEXTURE_WIDTH / CARD_ASPECT);

const contacts = [
  "sicheng.ouyang@uwaterloo.ca",
  "linkedin.com/in/sicheng-ouyang",
  "github.com/carols12352",
];

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
  const gradient = context.createLinearGradient(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  gradient.addColorStop(0, "rgba(255,255,255,0.18)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.08)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let index = 0; index < 9000; index += 1) {
    context.fillStyle = random() > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
    context.fillRect(random() * TEXTURE_WIDTH, random() * TEXTURE_HEIGHT, 1.5, 1.5);
  }
}

function drawLogo(context: CanvasRenderingContext2D, logo: HTMLImageElement, x: number, y: number, size: number) {
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

function paintFront(context: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  const pad = TEXTURE_WIDTH * 0.07;
  context.fillStyle = palette.metal;
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  drawGrain(context);
  if (logo) {
    const size = Math.round(TEXTURE_WIDTH * 0.2);
    drawLogo(context, logo, TEXTURE_WIDTH - pad * 0.86 - size, pad, size);
  }
  context.textBaseline = "alphabetic";
  context.fillStyle = palette.name;
  context.font = `600 ${Math.round(TEXTURE_WIDTH * 0.072)}px ${FONT}`;
  context.fillText("Sicheng Ouyang", pad, TEXTURE_HEIGHT - pad - TEXTURE_WIDTH * 0.06);
  context.fillStyle = palette.role;
  context.font = `500 ${Math.round(TEXTURE_WIDTH * 0.032)}px ${FONT}`;
  context.fillText("Software Engineering @ UWaterloo", pad, TEXTURE_HEIGHT - pad);
}

function paintBack(context: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  const pad = TEXTURE_WIDTH * 0.07;
  context.fillStyle = palette.metal;
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  drawGrain(context);
  context.textBaseline = "top";
  context.fillStyle = palette.name;
  context.font = `600 ${Math.round(TEXTURE_WIDTH * 0.045)}px ${FONT}`;
  context.fillText("Let\u2019s connect.", pad, pad);
  if (logo) {
    const size = Math.round(TEXTURE_WIDTH * 0.08);
    drawLogo(context, logo, TEXTURE_WIDTH - pad - size, pad - size * 0.1, size);
  }

  context.font = `500 ${Math.round(TEXTURE_WIDTH * 0.034)}px ${FONT}`;
  contacts.forEach((label, index) => {
    const y = TEXTURE_HEIGHT * 0.36 + index * TEXTURE_WIDTH * 0.07;
    context.fillStyle = palette.icon;
    context.beginPath();
    context.arc(pad + 10, y + 16, 9, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = palette.role;
    context.fillText(label, pad + 40, y);
  });

  context.fillStyle = palette.divider;
  context.fillRect(pad, TEXTURE_HEIGHT - pad - 76, TEXTURE_WIDTH - pad * 2, 2);
  context.fillStyle = palette.fine;
  context.font = `500 ${Math.round(TEXTURE_WIDTH * 0.028)}px ${FONT}`;
  context.textBaseline = "alphabetic";
  context.fillText("Sicheng Ouyang", pad, TEXTURE_HEIGHT - pad);
  context.textAlign = "right";
  context.fillText("Waterloo, Ontario", TEXTURE_WIDTH - pad, TEXTURE_HEIGHT - pad);
  context.textAlign = "left";
}

function faceTexture(paint: (context: CanvasRenderingContext2D, logo: HTMLImageElement | null) => void, logo: Promise<HTMLImageElement | null>) {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (!context) return { texture, ready: Promise.resolve() };
  paint(context, null);
  const ready = logo.then((image) => {
    if (!image) return;
    paint(context, image);
    texture.needsUpdate = true;
  });
  return { texture, ready };
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
  ready: Promise<void>;
  dispose: () => void;
};

export function createCardObject(width = 0.3): CardObject {
  const height = width / CARD_ASPECT;
  const radius = width * 0.028;
  const depth = width * 0.008;
  const shape = roundedRectShape(width, height, radius);

  const bodyGeometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 16 });
  bodyGeometry.translate(0, 0, -depth / 2);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: palette.rim, metalness: 0.35, roughness: 0.4 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.name = "CardBody";

  const logo = loadLogo();
  const front = faceTexture(paintFront, logo);
  const back = faceTexture(paintBack, logo);
  const surface = faceGeometry(shape, width, height);
  const frontMaterial = new THREE.MeshStandardMaterial({ map: front.texture, metalness: 0.25, roughness: 0.45 });
  const backMaterial = new THREE.MeshStandardMaterial({ map: back.texture, metalness: 0.25, roughness: 0.45 });

  const frontFace = new THREE.Mesh(surface, frontMaterial);
  frontFace.name = "CardFront";
  frontFace.position.z = depth / 2 + 0.0002;

  const backFace = new THREE.Mesh(surface, backMaterial);
  backFace.name = "CardBack";
  backFace.rotation.y = Math.PI;
  backFace.position.z = -depth / 2 - 0.0002;

  const group = new THREE.Group();
  group.name = "SichengCard";
  group.add(body, frontFace, backFace);

  return {
    group,
    ready: Promise.all([front.ready, back.ready]).then(() => undefined),
    dispose: () => {
      bodyGeometry.dispose();
      surface.dispose();
      bodyMaterial.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      front.texture.dispose();
      back.texture.dispose();
    },
  };
}
