export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
  "https://sicheng.dev";

export const SITE_NAME = "Sicheng Ouyang";
export const SITE_TITLE = "Sicheng Ouyang | Software Engineering Student";
export const SITE_DESCRIPTION =
  "Software Engineering student at UWaterloo focused on backend systems, practical ML workflows, and product delivery.";
export const SITE_OG_IMAGE = `${SITE_URL}/opengraph-image`;
export const SITE_AUTHOR = "Sicheng Ouyang";
export const SITE_LOCALE = "en_CA";
export const SITE_KEYWORDS = [
  "Sicheng Ouyang",
  "software engineering student",
  "backend systems",
  "full-stack developer",
  "Next.js portfolio",
  "UWaterloo",
  "machine learning projects",
];

const TITLE_MAX_LENGTH = 60;

function normalizeTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateTitle(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  const slice = value.slice(0, maxLength - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const candidate = lastSpace >= Math.floor(maxLength * 0.6) ? slice.slice(0, lastSpace) : slice;
  return `${candidate}…`;
}

type BuildSeoTitleOptions = {
  includeSiteName?: boolean;
  maxLength?: number;
};

export function buildSeoTitle(rawTitle: string, options: BuildSeoTitleOptions = {}): string {
  const includeSiteName = options.includeSiteName ?? true;
  const maxLength = options.maxLength ?? TITLE_MAX_LENGTH;
  const clean = normalizeTitle(rawTitle);
  const base = clean || SITE_NAME;
  const suffix = ` | ${SITE_NAME}`;

  const baseWithBrand = includeSiteName && !base.includes(SITE_NAME) ? `${base}${suffix}` : base;
  let result = baseWithBrand;

  if (result.length > maxLength) {
    result = base.length <= maxLength ? base : truncateTitle(base, maxLength);
  }

  return result;
}
