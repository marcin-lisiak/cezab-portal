import fs from "fs";
import path from "path";
import { promisify } from "util";
import { revalidatePath } from "next/cache";

const writeFile = promisify(fs.writeFile);

export const dynamic = "force-dynamic";

type SectionKey = "instrukcje" | "certyfikaty" | "materialy";

function walkFiles(rootDir: string, baseUrl: string): { folder: string; name: string; url: string }[] {
  if (!fs.existsSync(rootDir)) return [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const out: { folder: string; name: string; url: string }[] = [];
  for (const e of entries) {
    const full = path.join(rootDir, e.name);
    const rel = full.split(rootDir).pop()!.replace(/\\/g, "/");
    if (e.isDirectory()) {
      out.push(...walkFiles(full, baseUrl));
    } else {
      const relDir = path.dirname(rel).replace(/^\/+/, "");
      out.push({ folder: relDir || "/", name: e.name, url: `${baseUrl}${rel}` });
    }
  }
  return out;
}

export default async function AdminFilesPage() {
  async function upload(formData: FormData) {
    "use server";
    const file = formData.get("file") as File | null;
    const section = (String(formData.get("section") || "instrukcje").trim() as SectionKey);
    const subfolder = String(formData.get("folder") || "").trim();
    if (!file) return;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const baseDir = path.join(process.cwd(), "public", section);
    const targetDir = subfolder ? path.join(baseDir, subfolder) : baseDir;
    fs.mkdirSync(targetDir, { recursive: true });
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]+/g, "-");
    const targetPath = path.join(targetDir, safeName);
    await writeFile(targetPath, buffer);

    revalidatePath("/admin/pliki");
  }

  const sections: { key: SectionKey; label: string }[] = [
    { key: "instrukcje", label: "Instrukcje" },
    { key: "certyfikaty", label: "Certyfikaty" },
    { key: "materialy", label: "Materiały dodatkowe" },
  ];

  const lists = sections.map((s) => {
    const dir = path.join(process.cwd(), "public", s.key);
    fs.mkdirSync(dir, { recursive: true });
    return { key: s.key, label: s.label, files: walkFiles(dir, `/${s.key}`) };
  });

  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.key} className="rounded border p-4">
          <h2 className="text-lg font-medium mb-2">{s.label}</h2>
          <p className="text-sm text-muted-foreground mb-3">Możesz też skopiować pliki bezpośrednio do katalogu <code>public/{s.key}</code>.</p>
          <form action={upload} className="grid gap-3 max-w-xl">
            <input type="hidden" name="section" value={s.key} />
            <label className="block">
              <span className="text-sm">Podfolder (opcjonalnie)</span>
              <input name="folder" placeholder={`np. ${s.key}/eco-plus`} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm">Plik</span>
              <input name="file" type="file" className="mt-1 w-full" />
            </label>
            <button type="submit" className="bg-[var(--primary)] text-white rounded px-3 py-2 w-fit">Wyślij</button>
          </form>
        </section>
      ))}

      {lists.map((l) => (
        <section key={`${l.key}-list`}>
          <h3 className="font-medium mb-2">Lista: {l.label}</h3>
          <ul className="space-y-2">
            {l.files.map((f) => (
              <li key={`${l.key}${f.folder}/${f.name}`} className="rounded border p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-muted-foreground">/{l.key}{f.folder}</div>
                </div>
                <a className="underline" href={f.url} target="_blank" rel="noreferrer">Otwórz</a>
              </li>
            ))}
            {l.files.length === 0 && (
              <li className="text-sm text-muted-foreground">Brak plików.</li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
