export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
  "https://sicheng.vercel.app";

export const SITE_NAME = "Sicheng Ouyang";
export const SITE_TITLE = "Sicheng Ouyang | Software Engineering Student";
export const SITE_DESCRIPTION =
  "Software Engineering student at UWaterloo focused on backend systems, practical ML workflows, and product delivery.";
export const SITE_OG_IMAGE = `${SITE_URL}/image.png`;
export const SITE_AUTHOR = "Sicheng Ouyang";
export const SITE_KEYWORDS = [
  "Sicheng Ouyang",
  "software engineering student",
  "backend systems",
  "full-stack developer",
  "Next.js portfolio",
  "UWaterloo",
  "machine learning projects",
];
