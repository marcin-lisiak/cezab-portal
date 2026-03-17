import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function listSectionFiles(section: "instrukcje" | "certyfikaty" | "materialy") {
  const base = path.join(process.cwd(), "public", section);
  if (!fs.existsSync(base)) return [] as { label: string; url: string }[];
  const all: { label: string; url: string }[] = [];
  const walk = (dir: string, rel = "") => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const r = path.join(rel, e.name).replace(/\\/g, "/");
      if (e.isDirectory()) walk(full, r);
      else all.push({ label: r, url: `/${section}/${r}` });
    }
  };
  walk(base);
  return all;
}

export default async function AdminAssetsAttachPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  const filesInstr = listSectionFiles("instrukcje");
  const filesCert = listSectionFiles("certyfikaty");
  const filesMat = listSectionFiles("materialy");

  async function attach(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") || "");
    const type = String(formData.get("type") || "");
    const title = String(formData.get("title") || "").trim();
    const language = String(formData.get("language") || "PL").trim();
    const fileUrl = String(formData.get("fileUrl") || "");
    if (!productId || !type || !title || !fileUrl) return;

    await prisma.asset.create({
      data: {
        productId,
        type: type as any,
        title,
        language,
        url: fileUrl,
      },
    });
    revalidatePath("/admin/assets");
  }

  const assets = await prisma.asset.findMany({ include: { product: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <section className="rounded border p-4">
        <h2 className="font-medium mb-3">Przypnij plik do produktu</h2>
        <form action={attach} className="grid gap-3 max-w-2xl">
          <label className="block">
            <span className="text-sm">Produkt</span>
            <select name="productId" className="mt-1 w-full border rounded px-3 py-2">
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm">Typ</span>
            <select name="type" className="mt-1 w-full border rounded px-3 py-2">
              <option value="INSTRUCTION">Instrukcja</option>
              <option value="CERTIFICATE">Certyfikat</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm">Tytuł</span>
            <input name="title" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Język</span>
            <input name="language" defaultValue="PL" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Plik</span>
            <select name="fileUrl" className="mt-1 w-full border rounded px-3 py-2">
              <optgroup label="Instrukcje">
                {filesInstr.map((f) => (
                  <option key={`i-${f.url}`} value={f.url}>{f.label}</option>
                ))}
              </optgroup>
              <optgroup label="Certyfikaty">
                {filesCert.map((f) => (
                  <option key={`c-${f.url}`} value={f.url}>{f.label}</option>
                ))}
              </optgroup>
              <optgroup label="Materiały">
                {filesMat.map((f) => (
                  <option key={`m-${f.url}`} value={f.url}>{f.label}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <button type="submit" className="bg-[var(--primary)] text-white rounded px-3 py-2 w-fit">Przypnij</button>
        </form>
      </section>

      <section>
        <h2 className="font-medium mb-3">Przypięte pliki</h2>
        <ul className="space-y-2">
          {assets.map((a) => (
            <li key={a.id} className="rounded border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{a.title} ({a.language})</div>
                <div className="text-sm text-muted-foreground">{a.type} • {a.product.name}</div>
              </div>
              <a className="underline" href={a.url} target="_blank" rel="noreferrer">Otwórz</a>
            </li>
          ))}
          {assets.length === 0 && <li className="text-sm text-muted-foreground">Brak przypiętych plików.</li>}
        </ul>
      </section>
    </div>
  );
}
