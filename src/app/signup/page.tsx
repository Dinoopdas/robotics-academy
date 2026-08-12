import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { signUpAction } from "@/lib/actions/auth";
import { Container } from "@/components/ui/primitives";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/site/logo";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  if (session) redirect(params.next?.startsWith("/") ? params.next : "/dashboard");

  // On a fresh install the first account becomes the admin, so say so plainly
  // rather than leaving the person to discover it.
  const isFirstAccount = (await prisma.user.count()) === 0;

  return (
    <Container size="prose" className="py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto h-10 w-10" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-text-2">Free, and it takes about twenty seconds.</p>
        </div>

        {isFirstAccount ? (
          <div className="mb-5 rounded-lg border-l-2 border-l-amber bg-amber-soft/40 px-4 py-3">
            <p className="label-tech mb-0.5 text-amber">First account</p>
            <p className="text-sm text-text-2">
              This installation has no users yet, so this account will be given admin access to the
              content management system.
            </p>
          </div>
        ) : null}

        <AuthForm
          mode="signup"
          action={signUpAction}
          next={params.next ?? "/dashboard"}
          submitLabel="Create account"
        />

        <p className="mt-6 text-center text-sm text-text-2">
          Already have an account?{" "}
          <Link
            href={`/login${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}
            className="font-medium text-signal hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}
