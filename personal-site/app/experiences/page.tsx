import type { Metadata } from "next";
import Link from "next/link";
import { ExperiencesTreeTimeline } from "@/components/experiences/experiences-tree-timeline";
import { experienceEntries } from "@/content/experiences";
import { buildPageMetadata } from "@/lib/seo";
import { filterSearchResults, resolveSearchQuery, type SearchPageParams } from "@/lib/search";

export const metadata: Metadata = buildPageMetadata({
  title: "Experience",
  description: "Professional and product experience by Sicheng Ouyang, including software engineering, applied ML, and product operations work.",
  path: "/experiences",
});

type ExperiencesPageProps = {
  searchParams: SearchPageParams;
};

export default async function ExperiencesPage({ searchParams }: ExperiencesPageProps) {
  const query = await resolveSearchQuery(searchParams);
  const visibleExperiences = filterSearchResults(experienceEntries, query, (experience) => [
    experience.role,
    experience.organization,
    experience.summary,
    experience.focus,
    ...experience.highlights,
    ...experience.outcomes,
    ...experience.stack.map((item) => item.name),
  ]);

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Experiences
        </h1>
        <p className="mt-4 max-w-2xl">
          Roles, responsibilities, and results from my recent work.
        </p>
        {query ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <p>
              Search: <span className="font-medium text-gray-700">{query}</span>
            </p>
            <Link href="/experiences" className="ui-link ui-underline">
              Clear search
            </Link>
          </div>
        ) : null}
      </section>

      {visibleExperiences.length === 0 ? (
        <section className="mt-12 ui-item border-t border-gray-200 pt-4">
          <h2 className="text-lg font-semibold text-gray-900">No results</h2>
          <p className="mt-3 text-gray-600">
            No experiences matched <span className="font-medium">{query}</span>.
          </p>
        </section>
      ) : (
        <ExperiencesTreeTimeline experiences={visibleExperiences} searchQuery={query} />
      )}
    </>
  );
}
