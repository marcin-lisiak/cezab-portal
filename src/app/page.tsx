import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-3xl font-semibold">CEZAB Portal</h1>
      <p className="text-muted-foreground">Baza wiedzy o produktach, instrukcje, certyfikaty i wsparcie techniczne.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link className="rounded border p-4 hover:shadow" href="/katalog">Katalog produktów</Link>
        <Link className="rounded border p-4 hover:shadow" href="/instrukcje">Instrukcje</Link>
        <Link className="rounded border p-4 hover:shadow" href="/certyfikaty">Certyfikaty</Link>
      </div>
      <div>
        <Link href="/api/auth/signin" className="inline-block bg-[var(--primary)] text-white rounded px-4 py-2">Zaloguj się</Link>
        <Link href="/moje-produkty" className="inline-block ml-3 border rounded px-4 py-2">Moje produkty</Link>
      </div>
    </main>
  );
}
