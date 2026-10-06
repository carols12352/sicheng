import type { Metadata } from "next";
import { ImmersiveLoader } from "@/components/immersive/immersive-loader";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Immersive",
  description: "Step inside Sicheng Ouyang’s portfolio in VR: projects, experience, and a growth line arranged around you in WebXR on Apple Vision Pro, Meta Quest, and other headsets.",
  path: "/immersive",
});

export default function ImmersivePage() {
  return (
    <main className="fixed inset-0 bg-[var(--bg)]">
      <h1 className="sr-only">Sicheng Ouyang — immersive portfolio</h1>
      <ImmersiveLoader />
    </main>
  );
}
