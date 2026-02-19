import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";
import { getPostBySlug } from "@/lib/writing";

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function WritingOpengraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.meta.title ?? "Writing";
  const summary = post?.meta.summary || "Technical writing by Sicheng Ouyang.";
  const tags = post?.meta.tags?.slice(0, 3) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 62%, #eff6ff 100%)",
          color: "#0f172a",
          padding: "56px 64px",
          fontFamily: "SF Pro Display, Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, letterSpacing: 1.4, color: "#475569" }}>SICHENG.DEV / WRITING</div>
          <div style={{ fontSize: 20, color: "#64748b" }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 62, lineHeight: 1.08, fontWeight: 700, maxWidth: 1040 }}>{title}</div>
          <div style={{ fontSize: 27, lineHeight: 1.35, color: "#334155", maxWidth: 1020 }}>{summary}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(tags.length ? tags : ["LLM", "Systems", "Engineering"]).map((tag) => (
            <div
              key={tag}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 19,
                color: "#475569",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

