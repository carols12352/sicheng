import Link from "next/link";
import { DustSpriteRoamer } from "@/components/not-found/dust-sprite-roamer";

export default function NotFound() {
  return (
    <section className="notfound-minimal">
      <div className="notfound-minimal-copy">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">404 | Not Found</h1>
        <p className="mt-3 text-sm text-gray-600">
          Wow how did you get here? This is the land of the dust sprites. You can stay here and play with the dust sprites, or you can click the link below to return to the world of the living.
        </p>
      </div>

      <div className="notfound-minimal-foot">
        <Link href="/" className="ui-link ui-underline text-sm">
          Back to Home
        </Link>
      </div>

      <DustSpriteRoamer />
    </section>
  );
}
