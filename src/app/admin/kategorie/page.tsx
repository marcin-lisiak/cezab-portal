import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  async function addCategory(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    if (!name || !slug) return;
    await prisma.category.create({ data: { name, slug } });
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    if (!id) return;
    await prisma.category.delete({ where: { id } });
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <section className="rounded border p-4">
        <h2 className="font-medium mb-3">Dodaj kategorię</h2>
        <form action={addCategory} className="grid gap-3 max-w-md">
          <label className="block">
            <span className="text-sm">Nazwa</span>
            <input name="name" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Slug</span>
            <input name="slug" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <button type="submit" className="bg-[var(--primary)] text-white rounded px-3 py-2 w-fit">Dodaj</button>
        </form>
      </section>

      <section>
        <h2 className="font-medium mb-3">Kategorie</h2>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="rounded border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.slug}</div>
              </div>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-red-600 underline" type="submit">Usuń</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
