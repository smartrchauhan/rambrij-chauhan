import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function buildUrl() {
  const url = process.env.DATABASE_URL ?? "";
  // connection_limit=1 is right for Lambda but starves concurrent dev requests
  if (process.env.NODE_ENV !== "production") {
    return url.replace(/connection_limit=\d+/, "connection_limit=10");
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: buildUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
