import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 65%, #eef2ff 100%)",
          color: "#0f172a",
          padding: "60px 68px",
          fontFamily: "SF Pro Display, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 1.2,
            color: "#475569",
          }}
        >
          SICHENG.DEV
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700, maxWidth: 1000 }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "#334155", maxWidth: 980 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#64748b",
          }}
        >
          Backend Systems · Practical ML · Product Delivery
        </div>
      </div>
    ),
    size,
  );
}
