import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CertyfikatyPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (sp?.q || "").trim();
  const assets = await prisma.asset.findMany({
    where: { type: "CERTIFICATE", ...(q ? { title: { contains: q } } : {}) },
    include: { product: true },
    orderBy: { title: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Certyfikaty</h1>
      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="Szukaj po tytule" className="w-full border rounded px-3 py-2" />
      </form>
      <ul className="space-y-2">
        {assets.map(a => (
          <li key={a.id} className="rounded border p-3">
            <div className="font-medium"><Link href={`/produkt/${a.product.slug}`}>{a.product.name}</Link></div>
            <a href={a.url} className="text-blue-600 underline" target="_blank" rel="noreferrer">{a.title} ({a.language})</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
