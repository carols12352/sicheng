import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UsdzExportTool } from "@/components/immersive/usdz-export-tool";

export const metadata: Metadata = {
  title: "Export card USDZ",
  robots: { index: false, follow: false },
};

export default function ExportPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UsdzExportTool />;
}
