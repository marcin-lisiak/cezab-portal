import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ slug: string }> }

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return <div className="p-6">Kategoria nie istnieje.</div>;

  const products = await prisma.product.findMany({ where: { categoryId: category.id }, orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">{category.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <Link key={p.id} href={`/produkt/${p.slug}`} className="block rounded border p-4 hover:shadow">
            <div className="text-lg font-medium">{p.name}</div>
            <div className="text-sm text-muted-foreground">Zobacz szczegóły</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
