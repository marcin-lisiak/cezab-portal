import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function KatalogPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold mb-6">Katalog produktów</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Link key={c.id} href={`/katalog/${c.slug}`} className="block rounded border p-4 hover:shadow">
            <div className="text-lg font-medium">{c.name}</div>
            <div className="text-sm text-muted-foreground">Zobacz produkty</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
