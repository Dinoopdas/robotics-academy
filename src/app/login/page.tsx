import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { signInAction } from "@/lib/actions/auth";
import { Container } from "@/components/ui/primitives";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/site/logo";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  if (session) redirect(params.next?.startsWith("/") ? params.next : "/dashboard");

  return (
    <Container size="prose" className="py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto h-10 w-10" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-text-2">Sign in to pick up where you left off.</p>
        </div>

        <AuthForm
          mode="signin"
          action={signInAction}
          next={params.next ?? "/dashboard"}
          submitLabel="Sign in"
        />

        <p className="mt-6 text-center text-sm text-text-2">
          No account yet?{" "}
          <Link
            href={`/signup${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}
            className="font-medium text-signal hover:underline"
          >
            Create one free
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-text-3">
          You do not need an account to read any lesson. Signing in adds progress tracking, quiz
          scores, the skill tree and your streak.
        </p>
      </div>
    </Container>
  );
}
