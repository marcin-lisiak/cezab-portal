import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props { params: Promise<{ slug: string }> }

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  async function createTicket(formData: FormData) {
    "use server";
    const curSession = await getServerSession(authOptions);
    const curUserId = (curSession?.user as any)?.id as string | undefined;
    if (!curUserId) {
      redirect("/api/auth/signin");
    }
    const subject = String(formData.get("subject") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const serial = String(formData.get("serial") || "").trim();
    const productSlug = String(formData.get("productSlug") || "");

    const product = await prisma.product.findUnique({ where: { slug: productSlug || slug } });
    if (!product || !subject || !content) return;

    let reg = await prisma.registeredProduct.findFirst({ where: { userId: curUserId, productId: product.id, ...(serial ? { serialNumber: serial } : {}) } });
    if (!reg) {
      reg = await prisma.registeredProduct.create({
        data: {
          userId: curUserId,
          productId: product.id,
          serialNumber: serial || "NIEPODANY",
        },
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        ownerId: curUserId,
        registeredProductId: reg.id,
        subject,
      },
    });

    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: curUserId,
        content,
      },
    });

    redirect("/moje-zgloszenia");
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { assets: true, videos: true, category: true },
  });
  if (!product) return <div className="p-6">Produkt nie istnieje.</div>;

  const instructions = product.assets.filter(a => a.type === "INSTRUCTION");
  const certificates = product.assets.filter(a => a.type === "CERTIFICATE");

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{product.category.name}</p>
        {product.description && <p className="mt-3">{product.description}</p>}
      </header>

      {instructions.length > 0 && (
        <section>
          <h2 className="text-xl font-medium mb-2">Instrukcje</h2>
          <ul className="list-disc pl-5 space-y-1">
            {instructions.map(i => (
              <li key={i.id}><a className="text-blue-600 underline" href={i.url} target="_blank" rel="noreferrer">{i.title} ({i.language})</a></li>
            ))}
          </ul>
        </section>
      )}

      {certificates.length > 0 && (
        <section>
          <h2 className="text-xl font-medium mb-2">Certyfikaty</h2>
          <ul className="list-disc pl-5 space-y-1">
            {certificates.map(c => (
              <li key={c.id}><a className="text-blue-600 underline" href={c.url} target="_blank" rel="noreferrer">{c.title} ({c.language})</a></li>
            ))}
          </ul>
        </section>
      )}

      {product.videos.length > 0 && (
        <section>
          <h2 className="text-xl font-medium mb-2">Wideo</h2>
          <div className="space-y-4">
            {product.videos.sort((a,b)=>a.position-b.position).map(v => (
              <div key={v.id} className="aspect-video">
                <iframe className="w-full h-full" src={v.url} title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="serwis" className="rounded border p-4">
        <h2 className="text-xl font-medium mb-3">Zgłoś serwis</h2>
        {userId ? (
          <form action={createTicket} className="grid gap-3">
            <input type="hidden" name="productSlug" value={product.slug} />
            <label className="block">
              <span className="text-sm">Temat</span>
              <input name="subject" required className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm">Opis problemu</span>
              <textarea name="content" required rows={4} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm">Numer seryjny (opcjonalnie)</span>
              <input name="serial" className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <button type="submit" className="bg-[var(--primary)] text-white rounded px-3 py-2">Wyślij zgłoszenie</button>
          </form>
        ) : (
          <p>Aby zgłosić serwis, <a className="text-blue-600 underline" href="/api/auth/signin">zaloguj się</a>.</p>
        )}
      </section>
    </main>
  );
}
