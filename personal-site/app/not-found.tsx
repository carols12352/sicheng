import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">404</h1>
      <p className="mt-3 text-sm text-gray-600">
        Page not found. You can head back home, or play a quick Dino round first.
      </p>

      <div className="mt-6">
        <div>
          <iframe
            src="https://wayou.github.io/t-rex-runner/"
            title="t-rex-runner game"
            className="block h-[24rem] w-full md:h-[30rem]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="mt-6">
        <Link href="/" className="ui-link ui-underline text-sm">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
