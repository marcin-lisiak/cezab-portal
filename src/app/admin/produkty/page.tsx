import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function addProduct(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const categoryId = String(formData.get("categoryId") || "");
    if (!name || !slug || !categoryId) return;
    await prisma.product.create({ data: { name, slug, description: description || null, categoryId } });
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    if (!id) return;
    await prisma.product.delete({ where: { id } });
  }

  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <section className="rounded border p-4">
        <h2 className="font-medium mb-3">Dodaj produkt</h2>
        <form action={addProduct} className="grid gap-3 max-w-xl">
          <label className="block">
            <span className="text-sm">Nazwa</span>
            <input name="name" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Slug</span>
            <input name="slug" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Opis (opcjonalnie)</span>
            <textarea name="description" rows={3} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Kategoria</span>
            <select name="categoryId" className="mt-1 w-full border rounded px-3 py-2">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="bg-[var(--primary)] text-white rounded px-3 py-2 w-fit">Dodaj</button>
        </form>
      </section>

      <section>
        <h2 className="font-medium mb-3">Produkty</h2>
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p.id} className="rounded border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.slug} • {p.category.name}</div>
              </div>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-red-600 underline" type="submit">Usuń</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
