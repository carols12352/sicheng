function SkeletonPost() {
  return (
    <article className="border-t border-gray-200 pt-4">
      <div className="h-6 w-2/3 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/4 rounded bg-gray-100" />
      <div className="mt-4 h-4 w-full rounded bg-gray-100" />
      <div className="mt-2 h-4 w-5/6 rounded bg-gray-100" />
    </article>
  );
}

export default function WritingLoading() {
  return (
    <section className="mt-12 space-y-8" aria-label="Loading posts">
      <SkeletonPost />
      <SkeletonPost />
      <SkeletonPost />
    </section>
  );
}
