import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Bramy szybkobieżne", slug: "bramy-szybkobiezne" },
    { name: "Napędy garażowe", slug: "napedy-garazowe" },
    { name: "Napędy bramowe", slug: "napedy-bramowe" },
    { name: "Akcesoria", slug: "akcesoria" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const cat = await prisma.category.findFirst({ where: { slug: "bramy-szybkobiezne" } });
  if (cat) {
    const product = await prisma.product.upsert({
      where: { slug: "eco-plus" },
      update: {},
      create: {
        name: "ECO PLUS",
        slug: "eco-plus",
        categoryId: cat.id,
        description: "Przykładowy produkt do startu.",
      },
    });
    
    await prisma.asset.upsert({
      where: { id: "seed-eco-plus-instr-pl" },
      update: {},
      create: {
        id: "seed-eco-plus-instr-pl",
        productId: product.id,
        type: "INSTRUCTION",
        title: "Instrukcja ECO PLUS (PL)",
        language: "PL",
        url: "/files/instrukcje/Instrukcja_BRAMA_ECO_PLUS_PL.pdf",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
