type SearchParamValue = string | string[] | undefined;

export type SearchPageParams = Promise<{ q?: SearchParamValue }>;

export async function resolveSearchQuery(searchParams: SearchPageParams): Promise<string> {
  const resolvedSearchParams = await searchParams;
  const rawQuery = resolvedSearchParams.q;
  const queryValue = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
  return (queryValue ?? "").trim();
}

function buildSearchText(fields: string[]): string {
  return fields.join(" ").replace(/\s+/g, " ").trim();
}

function buildSnippet(fallback: string, fields: string[], query: string): string {
  if (!query) {
    return fallback;
  }

  const source = buildSearchText(fields);
  const index = source.toLowerCase().indexOf(query);
  if (index < 0) {
    return fallback;
  }

  const start = Math.max(0, index - 68);
  const end = Math.min(source.length, index + query.length + 92);
  const prefix = start > 0 ? "... " : "";
  const suffix = end < source.length ? " ..." : "";
  return `${prefix}${source.slice(start, end).trim()}${suffix}`;
}

export function filterSearchResults<T extends { summary: string }>(
  entries: T[],
  query: string,
  getFields: (entry: T) => string[],
): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return entries;
  }

  return entries
    .filter((entry) => buildSearchText(getFields(entry)).toLowerCase().includes(normalizedQuery))
    .map((entry) => ({
      ...entry,
      summary: buildSnippet(entry.summary, getFields(entry), normalizedQuery),
    }));
}
