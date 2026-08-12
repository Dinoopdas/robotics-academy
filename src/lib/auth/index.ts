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

/** For pages: sends the visitor to sign in and back again afterwards. */
export async function requireUserPage(returnTo: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session;
}

export async function requireAdminPage(returnTo: string): Promise<SessionUser> {
  const session = await requireUserPage(returnTo);
  if (session.role !== "ADMIN") redirect("/dashboard?error=admin-only");
  return session;
}
