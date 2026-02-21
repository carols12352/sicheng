import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getAllPosts, getPostBySlug } from "@/lib/writing";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc2822(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return new Date().toUTCString();
  }
  return new Date(parsed).toUTCString();
}

function stripMdx(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*_\-\[\]\(\)]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  const posts = await getAllPosts();
  const items = await Promise.all(
    posts.map(async (post) => {
      const fullPost = await getPostBySlug(post.slug);
      const fallbackDescription = fullPost ? stripMdx(fullPost.content).slice(0, 240) : "";
      const description = post.summary || fallbackDescription || "New article.";
      const url = `${SITE_URL}/writing/${post.slug}`;
      const pubDate = post.date ? toRfc2822(post.date) : new Date().toUTCString();

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} - Writing</title>
    <link>${SITE_URL}/writing</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-ca</language>
    <managingEditor>${SITE_AUTHOR}</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items.join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

