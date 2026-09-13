import { PrismaClient } from "@prisma/client";
import { kenyaLocations } from "./kenya-locations";

const prisma = new PrismaClient();

async function main() {
  for (const [county, town, estate] of kenyaLocations) {
    await prisma.location.upsert({
      where: { id: `directory-${county}-${town}-${estate}` },
      update: {},
      create: { id: `directory-${county}-${town}-${estate}`, county, town, estate },
    });
  }

}

main().finally(() => prisma.$disconnect());
