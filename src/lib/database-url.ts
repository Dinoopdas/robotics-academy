/**
 * Resolves DATABASE_URL into the form the driver adapter expects.
 *
 * The Prisma CLI resolves a `file:` URL relative to the project root (the
 * process working directory), so `file:./dev.db` means `<root>/dev.db`. The
 * adapter takes a plain path. Keeping the conversion in one place stops the
 * app and the seeder from disagreeing and silently opening two different
 * database files — which looks exactly like "the table does not exist".
 *
 * Deliberately free of `server-only` so prisma/seed.ts can import it too.
 */
export function resolveDatabaseUrl(raw = process.env.DATABASE_URL): string {
  const url = raw ?? "file:./dev.db";
  return url.startsWith("file:") ? url.slice("file:".length) : url;
}
