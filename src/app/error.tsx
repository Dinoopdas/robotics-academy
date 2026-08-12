"use client";

import { useEffect } from "react";

import { Container, LinkButton } from "@/components/ui/primitives";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where a reporting service would receive the error;
    // the console keeps the digest visible during development.
    console.error("Page error:", error);
  }, [error]);

  return (
    <Container size="prose" className="py-24 text-center">
      <p className="label-tech">Unexpected error</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mx-auto mt-3 max-w-md text-text-2">
        This page failed to render. Reloading often clears it — if it does not, the details below
        identify the failure.
      </p>

      {error.digest ? (
        <p className="mx-auto mt-4 inline-block rounded-lg border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-text-3">
          digest: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-lg bg-signal px-5 text-sm font-medium text-surface-0 transition hover:bg-signal-strong"
        >
          Try again
        </button>
        <LinkButton href="/" variant="secondary" size="lg">
          Back to the homepage
        </LinkButton>
      </div>
    </Container>
  );
}
