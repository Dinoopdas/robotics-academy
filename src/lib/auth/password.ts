import "server-only";

import bcrypt from "bcryptjs";

const COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Password rules kept intentionally simple and honest: length is the only
 * requirement that meaningfully resists offline cracking, and composition
 * rules mostly push people toward predictable substitutions.
 */
export function passwordProblem(plain: string): string | null {
  if (plain.length < 10) return "Use at least 10 characters.";
  if (plain.length > 200) return "That password is too long.";
  if (/^\s|\s$/.test(plain)) return "Remove the leading or trailing space.";
  return null;
}
