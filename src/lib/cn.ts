/**
 * Minimal class joiner. The project has no conflicting-class problem that
 * would justify pulling in tailwind-merge — components own their base classes
 * and callers append, they do not override.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
