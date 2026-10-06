import type { Metadata } from "next";
import Link from "next/link";
import { ImmersiveLoader } from "@/components/immersive/immersive-loader";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Immersive",
  description: "Step inside Sicheng Ouyang’s portfolio in VR: projects, experience, and a growth line arranged around you in WebXR on Apple Vision Pro, Meta Quest, and other headsets.",
  path: "/immersive",
});

export default function ImmersivePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-14">
      <h1 className="section-title">Immersive</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
        My portfolio as a space. In a VR headset, enter to stand inside it: the growth line in front of you, projects on the left, experience on the right, and my card within reach. Everywhere else, drag the preview to look around.
      </p>
      <p className="mt-2 max-w-2xl text-xs leading-5 text-gray-500">
        Works in any WebXR browser: Safari on Apple Vision Pro, Meta Quest Browser, Pico, Android XR, or desktop Chrome with a PC VR headset.
      </p>
      <div className="mt-8">
        <ImmersiveLoader />
      </div>
      <p className="mt-6 text-xs text-gray-500">
        Prefer the flat version? See <Link href="/projects" className="ui-link ui-underline">projects</Link>,{" "}
        <Link href="/experiences" className="ui-link ui-underline">experience</Link>, or <Link href="/card" className="ui-link ui-underline">my card</Link>.
      </p>
    </div>
  );
}
