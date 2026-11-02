import { PrismaClient } from "@prisma/client";

declare global {
  // Evita conexões extras durante hot reload em desenvolvimento.
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
