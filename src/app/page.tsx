import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import SearchInput from "@/components/search-input";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: 12,
  });

  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: modules.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Community Modules
          </h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        {/* Debounce Search */}
        <div className="flex gap-2">
          <SearchInput />
        </div>
      </div>

      {/* Category Filter (giữ search param) */}
      <div className="flex items-center justify-between flex-wrap gap-2">
  {/* LEFT: categories */}
  <div className="flex flex-wrap gap-2">
    <a
      href={q ? `/?q=${q}` : "/"}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        !category
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      All
    </a>

    {categories.map((c) => (
      <a
        key={c.id}
        href={`/?category=${c.slug}${q ? `&q=${q}` : ""}`}
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          category === c.slug
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {c.name}
      </a>
    ))}
    </div>

    {/* RIGHT: button */}
      <a
        href="/submit"
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
      >
        + Add Community
      </a>
  </div>

      {/* Empty State */}
      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>

          {(q || category) && (
            <a
              href="/"
              className="mt-2 block text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </a>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              hasVoted={votedIds.has(module.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}