import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { resolveDatabaseUrl } from "./database-url";

// Next.js hot-reloads modules in development, and serverless platforms reuse
// warm instances between invocations. Caching the client on globalThis stops
// both from opening a new connection pool every time.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Connection pool size.
 *
 * This has to be small, because the number of *pools* is not one. `next build`
 * fans out across parallel workers and a serverless platform runs many
 * concurrent instances — each with its own pool. Total connections are
 * `pools × max`, and a hosted Postgres free tier typically allows only a
 * few dozen. A generous-looking pool of 10 became ~70 connections during the
 * build and the database refused them, which failed the build outright.
 *
 * Each worker and each serverless invocation handles one request at a time, so
 * a pool larger than 1 buys them nothing anyway.
 */
function poolSize(): number {
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_REGION);
  if (isBuild || isServerless) return 1;
  return 5; // long-running server or local dev: one process, real concurrency
}

function createClient() {
  const adapter = new PrismaPg({
    connectionString: resolveDatabaseUrl(),
    max: poolSize(),
    // Give up rather than hang if the database is unreachable — a build that
    // fails in 10 seconds is far easier to diagnose than one that stalls.
    connectionTimeoutMillis: 10_000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
