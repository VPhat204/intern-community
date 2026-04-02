import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SubmitPage() {
  const session = await auth();

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  async function handleSubmit(formData: FormData) {
    "use server";

    const session = await auth();

    // ❌ Nếu chưa login → bắt login GitHub
    if (!session?.user) {
      redirect("/api/auth/signin?callbackUrl=/submit");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const repoUrl = formData.get("repoUrl") as string;
    const demoUrl = formData.get("demoUrl") as string;
    const categoryId = formData.get("categoryId") as string;

    const slug =
      name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    await db.miniApp.create({
      data: {
        name,
        description,
        repoUrl,
        demoUrl,
        categoryId,
        slug,
        authorId: session.user.id,
        status: "PENDING",
      },
    });

    redirect("/my-submissions");
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Community Module</h1>

      {/* 🔥 Notice guest */}
      {!session?.user && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-700">
          You are using guest mode. You must sign in with GitHub to submit.
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Module name"
          required
          className="w-full border px-3 py-2 rounded-lg"
        />

        <textarea
          name="description"
          placeholder="Description"
          required
          className="w-full border px-3 py-2 rounded-lg"
        />

        <input
          name="repoUrl"
          placeholder="GitHub repo URL"
          required
          className="w-full border px-3 py-2 rounded-lg"
        />

        <input
          name="demoUrl"
          placeholder="Demo URL (optional)"
          className="w-full border px-3 py-2 rounded-lg"
        />

        <select
          name="categoryId"
          required
          className="w-full border px-3 py-2 rounded-lg"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          {session?.user ? "Submit" : "Sign in to Submit"}
        </button>
      </form>
    </div>
  );
}