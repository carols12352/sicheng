import { experienceEntries } from "@/content/experiences";
import { growthTimeline } from "@/content/growth";
import { projectEntries } from "@/content/projects";
import { EYE_HEIGHT } from "./scene-state";
import type { WindowContent } from "./textures";

const DEG = Math.PI / 180;

export type Section = "timeline" | "projects" | "experience";

export type Item = {
  id: string;
  section: Section;
  title: string;
  period: string;
  window: WindowContent;
  /** Position in the entrance sequence. */
  order: number;
};

export type TimelineItem = Item & {
  /** Ring-local angle in radians, positive to the viewer's right. */
  angle: number;
};

function dashes(period: string) {
  return period.replace(/\s*-\s*/g, " – ").replace(/present/i, "Present");
}

export const ORBIT_RADIUS = 2.35;
export const ORBIT_Y = EYE_HEIGHT + 0.02;
export const PANEL_RADIUS = 2.0;
export const PANEL_ARC = 32 * DEG;
export const PANEL_CENTER = 64 * DEG;
export const PANEL_Y = EYE_HEIGHT - 0.02;
const TIMELINE_STEP = 11 * DEG;

const timeline: TimelineItem[] = growthTimeline.map((entry, index) => ({
  id: `growth-${index}`,
  section: "timeline",
  title: entry.period,
  period: dashes(entry.phase),
  window: { title: entry.period, meta: dashes(entry.phase), body: entry.detail },
  angle: (index - (growthTimeline.length - 1) / 2) * TIMELINE_STEP,
  order: index,
}));

const projects: Item[] = projectEntries.slice(0, 6).map((project, index) => ({
  id: `project-${project.anchor}`,
  section: "projects",
  title: project.name.replace(/\s*\(.*?\)/, ""),
  period: dashes(project.period),
  window: {
    title: project.name,
    meta: dashes(project.period),
    body: project.summary,
    bullets: project.highlights.slice(0, 3),
    chips: project.stack.slice(0, 7).map((item) => item.name),
  },
  order: timeline.length + index,
}));

const experience: Item[] = experienceEntries.slice(0, 6).map((entry, index) => ({
  id: `experience-${entry.anchor}`,
  section: "experience",
  title: entry.organization,
  period: dashes(entry.period),
  window: {
    title: entry.role,
    meta: `${dashes(entry.period)}   ${entry.organization}`,
    body: entry.summary,
    bullets: entry.highlights.slice(0, 3),
    chips: entry.stack.slice(0, 7).map((item) => item.name),
  },
  order: timeline.length + projects.length + index,
}));

export const items = { timeline, projects, experience };
export const allItems: Item[] = [...timeline, ...projects, ...experience];

export function findItem(id: string) {
  return allItems.find((item) => item.id === id);
}
