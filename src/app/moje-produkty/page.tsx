import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MojeProduktyPage() {
  const session = await getServerSession(authOptions);
  const initialUserId = session?.user?.id as string | undefined;

  async function registerProduct(formData: FormData) {
    "use server";
    const curSession = await getServerSession(authOptions);
    const userId = curSession?.user?.id as string | undefined;
    const serial = String(formData.get("serial") || "").trim();
    const invoice = String(formData.get("invoice") || "").trim();
    const nip = String(formData.get("nip") || "").trim();
    const productSlug = String(formData.get("product") || "");

    if (!userId) return;
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product || !serial) return;

    await prisma.registeredProduct.create({
      data: {
        userId,
        productId: product.id,
        serialNumber: serial,
        invoiceNumber: invoice || null,
        nip: nip || null,
      },
    });
  }

  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  const registered = initialUserId
    ? await prisma.registeredProduct.findMany({ where: { userId: initialUserId }, include: { product: true }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Moje produkty</h1>

      {initialUserId ? (
        <>
          <section className="rounded border p-4">
            <h2 className="font-medium mb-3">Zarejestruj produkt</h2>
            <form action={registerProduct} className="grid gap-3">
              <label className="block">
                <span className="text-sm">Produkt</span>
                <select name="product" className="mt-1 w-full border rounded px-3 py-2">
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm">Numer seryjny</span>
                <input name="serial" required className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm">Nr faktury (opcjonalnie)</span>
                <input name="invoice" className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm">NIP (opcjonalnie)</span>
                <input name="nip" className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <button type="submit" className="bg-[var(--primary)] text-white rounded px-3 py-2">Zarejestruj</button>
            </form>
          </section>

          <section>
            <h2 className="font-medium mb-3">Zarejestrowane</h2>
            <ul className="space-y-2">
              {registered.map((r) => (
                <li key={r.id} className="rounded border p-3">
                  <div className="font-medium">{r.product.name}</div>
                  <div className="text-sm text-muted-foreground mb-2">S/N: {r.serialNumber}{r.invoiceNumber ? ` • FV: ${r.invoiceNumber}` : ""}{r.nip ? ` • NIP: ${r.nip}` : ""}</div>
                  <div className="flex gap-2 text-sm">
                    <Link className="underline" href={`/produkt/${r.product.slug}`}>Szczegóły produktu</Link>
                    <Link className="underline" href={`/produkt/${r.product.slug}#serwis`}>Zgłoś serwis</Link>
                    <Link className="underline" href={`/moje-produkty/${r.id}`}>Szczegóły rejestracji</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <p>Aby zarządzać produktami, <a className="text-blue-600 underline" href="/api/auth/signin">zaloguj się</a>.</p>
      )}
    </main>
  );
}
