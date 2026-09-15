import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Local dev runs on sqlite via a driver adapter (Prisma 7 requires one --
// there's no more implicit `url` pickup from the datasource block). Swapping
// to Postgres for deploy means installing @prisma/adapter-pg, changing the
// datasource provider in schema.prisma, and constructing PrismaPg here
// instead -- the rest of the app's Prisma usage doesn't change.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
