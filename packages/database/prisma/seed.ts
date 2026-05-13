import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { sleep } from "bun";
import { PrismaClient } from "../generated/prisma/client.ts";
import { logger } from "../src/lib/logger.ts";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  logger.info("Seeding...");

  await sleep(1000);
  // Add seed logic here
  logger.info("Seeding completed.");
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
