import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MojeZgloszeniaPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Moje zgłoszenia</h1>
        <p>Aby zobaczyć zgłoszenia, najpierw <a className="text-blue-600 underline" href="/api/auth/signin">zaloguj się</a>.</p>
      </main>
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: { ownerId: userId },
    include: { registeredProduct: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Moje zgłoszenia</h1>
      <ul className="space-y-2">
        {tickets.map((t) => (
          <li key={t.id} className="rounded border p-3">
            <div className="font-medium">{t.subject}</div>
            <div className="text-sm text-muted-foreground">{t.registeredProduct.product.name} • {t.status}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
