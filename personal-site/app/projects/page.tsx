import type { Metadata } from "next";
import Link from "next/link";
import { ProjectsTreeTimeline } from "@/components/projects/projects-tree-timeline";
import { projectEntries } from "@/content/projects";
import { buildPageMetadata } from "@/lib/seo";
import { filterSearchResults, resolveSearchQuery, type SearchPageParams } from "@/lib/search";

export const metadata: Metadata = buildPageMetadata({
  title: "Projects and Engineering Case Studies",
  description: "Selected software projects by Sicheng Ouyang, including backend architecture, full-stack applications, and practical ML tooling.",
  path: "/projects",
});

type ProjectsPageProps = {
  searchParams: SearchPageParams;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const query = await resolveSearchQuery(searchParams);
  const visibleProjects = filterSearchResults(projectEntries, query, (project) => [
    project.name,
    project.summary,
    ...project.highlights,
    project.challenges,
    ...project.stack.map((item) => item.name),
  ]);

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Projects
        </h1>
        <p className="mt-4 max-w-2xl">
          Selected builds, their technical decisions, and what I shipped.
        </p>
        {query ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <p>
              Search: <span className="font-medium text-gray-700">{query}</span>
            </p>
            <Link href="/projects" className="ui-link ui-underline">
              Clear search
            </Link>
          </div>
        ) : null}
      </section>

      {visibleProjects.length === 0 ? (
        <section className="mt-12 ui-item border-t border-gray-200 pt-4">
          <h2 className="text-lg font-semibold text-gray-900">No results</h2>
          <p className="mt-3 text-gray-600">
            No projects matched <span className="font-medium">{query}</span>.
          </p>
        </section>
      ) : (
        <ProjectsTreeTimeline projects={visibleProjects} searchQuery={query} />
      )}
    </>
  );
}
