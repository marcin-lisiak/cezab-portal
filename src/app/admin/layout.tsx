import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-semibold mb-4">Panel admina</h1>
      <nav className="mb-6 flex gap-4 text-sm">
        <Link className="underline" href="/admin">Start</Link>
        <Link className="underline" href="/admin/kategorie">Kategorie</Link>
        <Link className="underline" href="/admin/produkty">Produkty</Link>
        <Link className="underline" href="/admin/pliki">Pliki</Link>
      </nav>
      {children}
    </div>
  );
}
