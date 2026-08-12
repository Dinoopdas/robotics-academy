"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { endSession, startSession } from "@/lib/auth/session";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { currentUser, requireUser } from "@/lib/auth";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
}

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Tell us what to call you.").max(80),
  email: z.string().trim().toLowerCase().email("That does not look like an email address."),
  password: z.string(),
  goal: z.string().trim().max(200).optional(),
});

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("That does not look like an email address."),
  password: z.string().min(1, "Enter your password."),
});

/** Only allow relative paths, so `?next=` can never bounce a user off-site. */
function safeNext(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    goal: formData.get("goal") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const { name, email, password, goal } = parsed.data;

  const weak = passwordProblem(password);
  if (weak) return { fieldErrors: { password: weak } };

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { fieldErrors: { email: "An account already uses that email. Try signing in." } };
  }

  // The very first account to register becomes the admin, so a fresh install
  // has a way into the CMS without shipping a hard-coded password.
  const isFirstAccount = (await prisma.user.count()) === 0;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      goal: goal ?? null,
      passwordHash: await hashPassword(password),
      role: isFirstAccount ? "ADMIN" : "USER",
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await startSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  });

  redirect(safeNext(formData.get("next")));
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });

  // Same message and a real hash comparison either way, so response timing and
  // wording do not reveal whether an address is registered.
  const dummyHash = "$2b$12$0000000000000000000000000000000000000000000000000000";
  const ok = await verifyPassword(password, user?.passwordHash ?? dummyHash);

  if (!user || !ok) {
    return { error: "That email and password combination did not match." };
  }

  await startSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  });

  redirect(safeNext(formData.get("next")));
}

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  goal: z.string().trim().max(200),
  bio: z.string().trim().max(500),
});

export async function updateProfileAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireUser();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    goal: formData.get("goal") ?? "",
    bio: formData.get("bio") ?? "",
  });

  if (!parsed.success) {
    return { error: "Check the fields and try again." };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: {
      name: parsed.data.name,
      goal: parsed.data.goal || null,
      bio: parsed.data.bio || null,
    },
  });

  // The display name lives in the session claims, so refresh the cookie too.
  const fresh = await currentUser();
  if (fresh) {
    await startSession({
      id: fresh.id,
      email: fresh.email,
      name: fresh.name,
      role: fresh.role === "ADMIN" ? "ADMIN" : "USER",
    });
  }

  return { ok: true };
}
