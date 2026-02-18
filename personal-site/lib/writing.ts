import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "writing");

type Frontmatter = {
  title?: unknown;
  date?: unknown;
  summary?: unknown;
  tags?: unknown;
};

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingTime: string;
};

export type Post = {
  meta: PostMeta;
  content: string;
};

function normalizeDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function estimateReadingTime(content: string): string {
  const words = content
    .replace(/```[\s\S]*?```/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

function toPostMeta(slug: string, frontmatter: Frontmatter, content: string): PostMeta {
  const title =
    typeof frontmatter.title === "string" && frontmatter.title.trim()
      ? frontmatter.title.trim()
      : slug;

  const summary =
    typeof frontmatter.summary === "string" ? frontmatter.summary.trim() : "";

  return {
    slug,
    title,
    date: normalizeDate(frontmatter.date),
    summary,
    tags: normalizeTags(frontmatter.tags),
    readingTime: estimateReadingTime(content),
  };
}

function sortByDateDesc(a: PostMeta, b: PostMeta): number {
  const left = a.date ? Date.parse(a.date) : Number.NEGATIVE_INFINITY;
  const right = b.date ? Date.parse(b.date) : Number.NEGATIVE_INFINITY;

  if (Number.isNaN(left) || Number.isNaN(right)) {
    return b.date.localeCompare(a.date);
  }

  return right - left;
}

async function getContentFiles(): Promise<string[]> {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name))
    .map((entry) => entry.name);
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await getContentFiles();

  const posts = await Promise.all(
    files.map(async (fileName) => {
      const slug = fileName.replace(/\.(md|mdx)$/i, "");
      const filePath = path.join(CONTENT_DIR, fileName);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);

      return toPostMeta(slug, data as Frontmatter, content);
    }),
  );

  return posts.sort(sortByDateDesc);
}

export async function getAllPostsWithContent(): Promise<Post[]> {
  const files = await getContentFiles();

  const posts = await Promise.all(
    files.map(async (fileName) => {
      const slug = fileName.replace(/\.(md|mdx)$/i, "");
      const filePath = path.join(CONTENT_DIR, fileName);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);

      return {
        meta: toPostMeta(slug, data as Frontmatter, content),
        content,
      };
    }),
  );

  return posts.sort((a, b) => sortByDateDesc(a.meta, b.meta));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const extensions = ["mdx", "md"];

  for (const ext of extensions) {
    const filePath = path.join(CONTENT_DIR, `${slug}.${ext}`);

    try {
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);

      return {
        meta: toPostMeta(slug, data as Frontmatter, content),
        content,
      };
    } catch {
      // Try next extension.
    }
  }

  return null;
}
