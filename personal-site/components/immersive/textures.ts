import * as THREE from "three";
import type { Theme } from "./theme";

export const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';
export const MONO = '"SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace';

const PPM = 2000;

export function makeTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return { canvas, context: canvas.getContext("2d") };
}

export function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

export function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = Infinity) {
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
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 1 && context.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
  kept[maxLines - 1] = `${last.trimEnd()}…`;
  return kept;
}

/** Small single-line hint or button. */
export function pillTexture(text: string, widthMeters: number, heightMeters: number, theme: Theme) {
  const { canvas, context } = canvasOf(widthMeters * PPM, heightMeters * PPM);
  if (context) {
    const { width, height } = canvas;
    roundedRect(context, 2, 2, width - 4, height - 4, (height - 4) / 2);
    context.fillStyle = theme.surface;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = theme.lineStrong;
    context.stroke();
    let size = height * 0.4;
    context.font = `500 ${size}px ${FONT}`;
    const available = width - height;
    const measured = context.measureText(text).width;
    if (measured > available) {
      size *= available / measured;
      context.font = `500 ${size}px ${FONT}`;
    }
    context.fillStyle = theme.text;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, width / 2, height / 2);
  }
  return makeTexture(canvas);
}

/** Glass slab with hairline edges and accent corner brackets, shared by panels and windows. */
export function frame(context: CanvasRenderingContext2D, width: number, height: number, ppm: number, theme: Theme, opacity = 0.86) {
  const inset = 2;
  context.globalAlpha = opacity;
  context.fillStyle = theme.surface;
  context.fillRect(inset, inset, width - inset * 2, height - inset * 2);
  context.globalAlpha = 1;
  context.lineWidth = 2;
  context.strokeStyle = theme.line;
  context.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  const arm = 0.026 * ppm;
  const weight = 0.0024 * ppm;
  context.fillStyle = theme.accent;
  for (const [x, y, dx, dy] of [
    [0, 0, 1, 1],
    [width, 0, -1, 1],
    [0, height, 1, -1],
    [width, height, -1, -1],
  ]) {
    context.fillRect(dx > 0 ? x : x - arm, dy > 0 ? y : y - weight, arm, weight);
    context.fillRect(dx > 0 ? x : x - weight, dy > 0 ? y : y - arm, weight, arm);
  }
}

export type PanelRow = { title: string; period: string };

export const PANEL_PAD = 0.036;
export const PANEL_HEADER = 0.1;
export const PANEL_ROW = 0.086;

export function panelHeight(rows: number) {
  return PANEL_PAD * 2 + PANEL_HEADER + rows * PANEL_ROW;
}

/** A section as a list, drawn for a curved slab: header, then one row per item. */
export function panelTexture(title: string, rows: PanelRow[], widthMeters: number, theme: Theme) {
  const ppm = 1600;
  const m = (meters: number) => meters * ppm;
  const { canvas, context } = canvasOf(m(widthMeters), m(panelHeight(rows.length)));
  if (context) {
    const { width, height } = canvas;
    const pad = m(PANEL_PAD) + m(0.012);
    frame(context, width, height, ppm, theme);
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.font = `600 ${m(0.026)}px ${FONT}`;
    context.fillStyle = theme.strong;
    const headerMid = m(PANEL_PAD) + m(PANEL_HEADER) / 2;
    context.fillText(title, pad, headerMid);
    rows.forEach((row, index) => {
      const top = m(PANEL_PAD + PANEL_HEADER + index * PANEL_ROW);
      context.fillStyle = index === 0 ? theme.lineStrong : theme.line;
      context.fillRect(pad, top, width - pad * 2, 2);
      context.font = `500 ${m(0.015)}px ${MONO}`;
      const periodWidth = context.measureText(row.period).width;
      context.textAlign = "right";
      context.fillStyle = theme.muted;
      context.fillText(row.period, width - pad, top + m(PANEL_ROW) / 2);
      context.textAlign = "left";
      context.font = `500 ${m(0.022)}px ${FONT}`;
      context.fillStyle = theme.strong;
      const [line] = wrapLines(context, row.title, width - pad * 2 - periodWidth - m(0.04), 1);
      context.fillText(line ?? "", pad, top + m(PANEL_ROW) / 2);
    });
  }
  const texture = makeTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.offset.x = 1;
  return texture;
}

export type TextLine = {
  text: string;
  /** Font size in meters. */
  size: number;
  color: string;
  weight?: number;
  mono?: boolean;
  maxLines?: number;
  gapBefore?: number;
};

/** Transparent, centred text; returns its height in meters so meshes can be sized to fit. */
export function textBlockTexture(lines: TextLine[], widthMeters: number) {
  const width = Math.round(widthMeters * PPM);
  const measure = canvasOf(1, 1).context;
  const layout: { text: string; font: string; color: string; y: number }[] = [];
  let y = 0;
  for (const line of lines) {
    const size = line.size * PPM;
    const font = `${line.weight ?? 500} ${size}px ${line.mono ? MONO : FONT}`;
    y += (line.gapBefore ?? 0) * PPM;
    if (measure) measure.font = font;
    const wrapped = measure ? wrapLines(measure, line.text, width * 0.96, line.maxLines) : [line.text];
    for (const text of wrapped) {
      layout.push({ text, font, color: line.color, y });
      y += size * 1.25;
    }
  }
  const height = Math.ceil(y + 8);
  const { canvas, context } = canvasOf(width, height);
  if (context) {
    context.textAlign = "center";
    context.textBaseline = "top";
    for (const item of layout) {
      context.font = item.font;
      context.fillStyle = item.color;
      context.fillText(item.text, width / 2, item.y + 4);
    }
  }
  return { texture: makeTexture(canvas), height: height / PPM };
}

export type WindowContent = {
  title: string;
  meta: string;
  body?: string;
  bullets?: string[];
  chips?: string[];
};

export type UvRect = { u0: number; u1: number; v0: number; v1: number };

const WINDOW_PPM = 1600;

function layoutWindow(context: CanvasRenderingContext2D, content: WindowContent, width: number, height: number, theme: Theme, draw: boolean) {
  const m = (meters: number) => meters * WINDOW_PPM;
  const pad = m(0.048);
  const closeRadius = m(0.018);
  const closeX = width - pad - closeRadius + m(0.008);
  const closeY = pad + closeRadius - m(0.008);

  if (draw) {
    frame(context, width, height, WINDOW_PPM, theme, 0.97);
    const arm = closeRadius * 0.42;
    context.beginPath();
    context.moveTo(closeX - arm, closeY - arm);
    context.lineTo(closeX + arm, closeY + arm);
    context.moveTo(closeX + arm, closeY - arm);
    context.lineTo(closeX - arm, closeY + arm);
    context.lineWidth = m(0.0022);
    context.lineCap = "round";
    context.strokeStyle = theme.muted;
    context.stroke();
  }

  context.textAlign = "left";
  context.textBaseline = "top";
  let y = pad;
  context.font = `500 ${m(0.016)}px ${MONO}`;
  if (draw) {
    context.fillStyle = theme.muted;
    context.fillText(content.meta, pad, y);
  }
  y += m(0.034);

  const titleSize = m(0.03);
  context.font = `600 ${titleSize}px ${FONT}`;
  for (const line of wrapLines(context, content.title, width - pad * 2 - closeRadius * 2, 2)) {
    if (draw) {
      context.fillStyle = theme.strong;
      context.fillText(line, pad, y);
    }
    y += titleSize * 1.22;
  }
  y += m(0.018);

  const textWidth = width - pad * 2;
  const bodySize = m(0.0195);
  context.font = `400 ${bodySize}px ${FONT}`;
  if (content.body) {
    for (const line of wrapLines(context, content.body, textWidth)) {
      if (draw) {
        context.fillStyle = theme.text;
        context.fillText(line, pad, y);
      }
      y += bodySize * 1.6;
    }
    y += m(0.01);
  }

  for (const bullet of content.bullets ?? []) {
    if (draw) {
      context.fillStyle = theme.muted;
      context.fillRect(pad, y + bodySize * 0.62, m(0.008), m(0.0018));
    }
    for (const line of wrapLines(context, bullet, textWidth - m(0.024))) {
      if (draw) {
        context.fillStyle = theme.text;
        context.fillText(line, pad + m(0.024), y);
      }
      y += bodySize * 1.6;
    }
    y += m(0.006);
  }

  if (content.chips?.length) {
    y += m(0.014);
    const chipSize = m(0.0145);
    const chipHeight = m(0.03);
    const chipPad = m(0.012);
    const gap = m(0.008);
    context.font = `500 ${chipSize}px ${MONO}`;
    context.textBaseline = "middle";
    let x = pad;
    for (const chip of content.chips) {
      const chipWidth = context.measureText(chip).width + chipPad * 2;
      if (x + chipWidth > width - pad) {
        x = pad;
        y += chipHeight + gap;
      }
      if (draw) {
        roundedRect(context, x, y, chipWidth, chipHeight, m(0.006));
        context.lineWidth = 2;
        context.strokeStyle = theme.lineStrong;
        context.stroke();
        context.fillStyle = theme.muted;
        context.fillText(chip, x + chipPad, y + chipHeight / 2);
      }
      x += chipWidth + gap;
    }
    y += chipHeight;
  }

  return { height: y + pad, close: { x: closeX, y: closeY, radius: closeRadius } };
}

/** The detail window. Its height fits the content; the close mark's hit area comes back as a uv rect. */
export function windowTexture(content: WindowContent, widthMeters: number, theme: Theme) {
  const width = Math.round(widthMeters * WINDOW_PPM);
  const measure = canvasOf(width, 1).context;
  const measured = measure ? layoutWindow(measure, content, width, 1, theme, false) : null;
  const height = Math.round(Math.min(measured?.height ?? width * 0.6, width * 1.6));
  const { canvas, context } = canvasOf(width, height);
  const drawn = context ? layoutWindow(context, content, width, height, theme, true) : null;
  const close = drawn?.close ?? { x: width - 60, y: 60, radius: 30 };
  const hit = close.radius * 2;
  const closeRect: UvRect = {
    u0: (close.x - hit) / width,
    u1: (close.x + hit) / width,
    v0: 1 - (close.y + hit) / height,
    v1: 1 - (close.y - hit) / height,
  };
  return { texture: makeTexture(canvas), height: height / WINDOW_PPM, closeRect };
}

export function inRect(uv: { x: number; y: number }, rect: UvRect) {
  return uv.x >= rect.u0 && uv.x <= rect.u1 && uv.y >= rect.v0 && uv.y <= rect.v1;
}

/** Soft radial falloff, used for the plinth's under-light and contact shadows. */
export function radialTexture(color: string, strength = 1) {
  const size = 256;
  const { canvas, context } = canvasOf(size, size);
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "transparent");
    context.globalAlpha = strength;
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return makeTexture(canvas);
}
