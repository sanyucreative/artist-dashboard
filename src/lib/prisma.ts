import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Netlify injects NETLIFY_DB_URL (the exact name @netlify/database itself
// reads) for both `netlify dev` locally and the deployed site in
// production -- a real local Postgres branch in dev, the managed Neon
// database in prod. DATABASE_URL is a manual-override fallback (e.g. a
// plain `next dev` run, or pointing at a different Postgres entirely).
//
// This must NOT throw when the string is missing: `next build` imports
// every route module (even dynamic ones) to collect page data, with no
// database available and no query about to run, so an eager throw here
// fails the build itself. A missing string only becomes a real problem
// when a query actually executes, which is what surfaces then instead.
const connectionString = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL ?? "";

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
