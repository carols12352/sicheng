import type { ReactNode } from "react";

type IconName = "pin" | "contact" | "mail" | "linkedin" | "github" | "globe" | "file" | "arrow" | "share";
const paths: Record<IconName, ReactNode> = {
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
  contact: <><circle cx="9" cy="7" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2m4-13v6m-3-3h6" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7.5 10v7m0-10v.1M11 17v-7m0 3a3 3 0 0 1 6 0v4" /></>,
  github: <path d="M9 20c-4 1-4-2-5-2m10 4v-4a3.5 3.5 0 0 0-1-2.8c3.4-.4 7-1.7 7-7.2a5.5 5.5 0 0 0-1.5-3.8A5 5 0 0 0 18.4.4S17.1 0 14 2a13.4 13.4 0 0 0-6 0C4.9 0 3.6.4 3.6.4a5 5 0 0 0-.1 3.8A5.5 5.5 0 0 0 2 8c0 5.5 3.6 6.8 7 7.2A3.5 3.5 0 0 0 8 18v4" transform="translate(2 2) scale(.85)" />,
  globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Zm0 0v6h6M8 13h8m-8 4h5" /></>,
  arrow: <path d="m9 5 7 7-7 7" />,
  share: <><path d="M12 15V3m-4 4 4-4 4 4M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" /></>,
};

export function CardIcon({ name }: { name: IconName }) {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
