/**
 * Reads and validates DATABASE_URL.
 *
 * Deliberately fails loudly with an actionable message. A missing or malformed
 * connection string otherwise surfaces as an opaque adapter error at the first
 * query — that is, on a page a visitor is looking at, rather than at startup.
 *
 * Free of `server-only` so prisma/seed.ts can import it too.
 */
export function resolveDatabaseUrl(raw = process.env.DATABASE_URL): string {
  if (!raw) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your PostgreSQL " +
        "connection string — see the Deploying section of the README.",
    );
  }

  if (raw.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL points at a SQLite file, but this project now uses PostgreSQL. " +
        "Use a postgresql:// connection string.",
    );
  }

  if (!/^postgres(ql)?:\/\//.test(raw)) {
    throw new Error(
      `DATABASE_URL does not look like a PostgreSQL connection string (got "${raw.slice(0, 12)}…"). ` +
        "It should start with postgresql:// or postgres://",
    );
  }

  return raw;
}
