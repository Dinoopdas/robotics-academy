import { signOutAction } from "@/lib/actions/auth";

/**
 * Sign-out is a form POST rather than a link, so it cannot be triggered by a
 * prefetch, a crawler, or an <img> tag on another site.
 */
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="h-8 rounded-lg border border-line bg-surface-1 px-3 text-sm text-text-2 transition hover:border-line-strong hover:text-text-1"
      >
        Sign out
      </button>
    </form>
  );
}
