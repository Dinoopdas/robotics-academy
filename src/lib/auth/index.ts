import "server-only";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession, type SessionUser } from "./session";

export { getSession, startSession, endSession, SESSION_COOKIE } from "./session";
export type { SessionUser } from "./session";

/**
 * Re-reads the user from the database. Server actions that mutate anything
 * should use this rather than trusting the cookie claims, so a deleted or
 * demoted account cannot keep acting on a still-valid token.
 */
export async function currentUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      bio: true,
      goal: true,
      currentStreak: true,
      longestStreak: true,
      lastActiveOn: true,
      createdAt: true,
    },
  });
}

/**
 * A session that is also confirmed to still exist in the database.
 *
 * Use this anywhere a truthy session causes a *redirect away* — the sign-in and
 * sign-up pages especially. Trusting the raw cookie there strands anyone whose
 * account has gone: sign-up bounces to the dashboard, the dashboard bounces
 * back to sign-in, and there is no way out of the loop.
 */
export async function getLiveSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const exists = await prisma.user.findUnique({
    where: { id: session.id },
    select: { role: true },
  });
  if (!exists) return null;

  return { ...session, role: exists.role === "ADMIN" ? "ADMIN" : "USER" };
}

/** For server actions: throws rather than redirecting, so the caller can report. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("You need to be signed in to do that.");

  const exists = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, role: true },
  });
  if (!exists) throw new Error("Your session is no longer valid. Please sign in again.");

  return { ...session, role: exists.role === "ADMIN" ? "ADMIN" : "USER" };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("This action requires an admin account.");
  return user;
}

/**
 * For pages: sends the visitor to sign in and back again afterwards.
 *
 * Sessions are stateless JWTs, so a cookie stays cryptographically valid after
 * its user is gone — a deleted account, or a database that was reset or
 * migrated. Verifying existence here turns that into a clean redirect to
 * sign-in, instead of a page that renders blank because its data fetch came
 * back empty.
 *
 * The stale cookie cannot be cleared during a page render — Next.js only
 * allows setting cookies in Server Actions and Route Handlers — but signing in
 * overwrites it, so it resolves on the very next step.
 */
export async function requireUserPage(returnTo: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const exists = await prisma.user.findUnique({
    where: { id: session.id },
    select: { role: true },
  });
  if (!exists) redirect(`/login?next=${encodeURIComponent(returnTo)}&expired=1`);

  return { ...session, role: exists.role === "ADMIN" ? "ADMIN" : "USER" };
}

export async function requireAdminPage(returnTo: string): Promise<SessionUser> {
  const session = await requireUserPage(returnTo);
  if (session.role !== "ADMIN") redirect("/dashboard?error=admin-only");
  return session;
}
