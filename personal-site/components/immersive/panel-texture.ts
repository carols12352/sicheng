import * as THREE from "three";

export const PIXELS_PER_METER = 2000;

const FONT = '"Avenir Next", "SF Pro Text", "Segoe UI", system-ui, sans-serif';

export type PanelContent = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  footer?: string;
};

export type PanelStyle = {
  background: string;
  border: string;
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  titleScale?: number;
  align?: "left" | "center";
};

export const panelStyles = {
  light: {
    background: "rgba(250, 251, 253, 0.94)",
    border: "rgba(36, 43, 55, 0.12)",
    eyebrow: "#6a7280",
    title: "#1f2633",
    body: "#4b5361",
    accent: "#526eaa",
  },
  hero: {
    background: "rgba(0, 0, 0, 0)",
    border: "rgba(0, 0, 0, 0)",
    eyebrow: "#4d586e",
    title: "#1a2030",
    body: "#3d4555",
    accent: "#526eaa",
    titleScale: 2.4,
    align: "center",
  },
} satisfies Record<string, PanelStyle>;

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function layoutContent(context: CanvasRenderingContext2D, content: PanelContent, width: number, height: number, style: PanelStyle, draw: boolean) {
  const unit = PIXELS_PER_METER * 0.016;
  const pad = unit * 2.4;
  const maxWidth = width - pad * 2;
  const x = style.align === "center" ? width / 2 : pad;
  const text = (value: string, left: number, top: number) => {
    if (draw) context.fillText(value, left, top);
  };

  if (draw) {
    roundedRect(context, 2, 2, width - 4, height - 4, unit * 2.2);
    context.fillStyle = style.background;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = style.border;
    context.stroke();
  }

  let y = pad;
  context.textAlign = style.align === "center" ? "center" : "left";
  context.textBaseline = "top";

  if (content.eyebrow) {
    context.fillStyle = style.eyebrow;
    context.font = `500 ${unit * 1.25}px ${FONT}`;
    text(content.eyebrow.toUpperCase(), x, y);
    y += unit * 2;
  }

  const titleSize = unit * 2.1 * (style.titleScale ?? 1);
  context.fillStyle = style.title;
  context.font = `600 ${titleSize}px ${FONT}`;
  for (const line of wrapLines(context, content.title, maxWidth)) {
    text(line, x, y);
    y += titleSize * 1.18;
  }

  if (content.subtitle) {
    y += unit * 0.3;
    context.fillStyle = style.accent;
    context.font = `500 ${unit * 1.35}px ${FONT}`;
    for (const line of wrapLines(context, content.subtitle, maxWidth)) {
      text(line, x, y);
      y += unit * 1.9;
    }
  }

  const bodySize = unit * 1.5;
  context.font = `400 ${bodySize}px ${FONT}`;
  context.fillStyle = style.body;
  const bottomLimit = height - pad - (content.footer ? unit * 2.4 : 0);

  if (content.body) {
    y += unit * 0.6;
    for (const line of wrapLines(context, content.body, maxWidth)) {
      if (y + bodySize > bottomLimit) break;
      text(line, x, y);
      y += bodySize * 1.45;
    }
  }

  context.textAlign = "left";
  for (const bullet of content.bullets ?? []) {
    y += unit * 0.6;
    if (y + bodySize > bottomLimit) break;
    if (draw) {
      context.fillStyle = style.accent;
      context.beginPath();
      context.arc(pad + unit * 0.45, y + bodySize * 0.55, unit * 0.32, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = style.body;
    }
    for (const line of wrapLines(context, bullet, maxWidth - unit * 2)) {
      if (y + bodySize > bottomLimit) break;
      text(line, pad + unit * 2, y);
      y += bodySize * 1.45;
    }
  }

  if (content.footer) {
    y += unit * 2.4;
    context.fillStyle = style.eyebrow;
    context.font = `500 ${unit * 1.1}px ${FONT}`;
    context.textBaseline = "bottom";
    text(content.footer, pad, height - pad);
  }

  return y + pad;
}

export type PanelTexture = {
  texture: THREE.CanvasTexture;
  height: number;
};

/** With `minHeight`, `heightMeters` becomes a maximum and the panel shrinks to fit its content. */
export function createPanelTexture(content: PanelContent, widthMeters: number, heightMeters: number, style: PanelStyle, minHeight?: number): PanelTexture {
  const width = Math.round(widthMeters * PIXELS_PER_METER);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  let height = Math.round(heightMeters * PIXELS_PER_METER);
  if (context && minHeight !== undefined) {
    const measured = layoutContent(context, content, width, height, style, false);
    height = Math.round(Math.min(height, Math.max(minHeight * PIXELS_PER_METER, measured)));
  }
  canvas.width = width;
  canvas.height = height;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (context) layoutContent(context, content, width, height, style, true);
  texture.needsUpdate = true;
  return { texture, height: height / PIXELS_PER_METER };
}
