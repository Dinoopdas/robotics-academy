"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { setProjectStatusAction } from "@/lib/actions/progress";

export function ProjectStatusControl({
  projectId,
  status,
  signedIn,
  returnTo,
}: {
  projectId: string;
  status: string | null;
  signedIn: boolean;
  returnTo: string;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Link
        href={`/signup?next=${encodeURIComponent(returnTo)}`}
        className="inline-flex h-10 items-center rounded-lg border border-line bg-surface-1 px-4 text-sm font-medium transition hover:border-signal/50"
      >
        Sign in to track this build
      </Link>
    );
  }

  function set(next: "IN_PROGRESS" | "COMPLETED") {
    startTransition(async () => {
      const result = await setProjectStatusAction(projectId, next);
      if (result.ok) setCurrent(next);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => set("IN_PROGRESS")}
        disabled={pending}
        className={`h-10 rounded-lg px-4 text-sm font-medium transition disabled:opacity-50 ${
          current === "IN_PROGRESS"
            ? "border border-signal/50 bg-signal-soft text-signal"
            : "border border-line bg-surface-1 text-text-2 hover:border-line-strong"
        }`}
      >
        {current === "IN_PROGRESS" ? "Building this" : "Start building"}
      </button>

      <button
        type="button"
        onClick={() => set("COMPLETED")}
        disabled={pending}
        className={`h-10 rounded-lg px-4 text-sm font-medium transition disabled:opacity-50 ${
          current === "COMPLETED"
            ? "bg-emerald text-surface-0"
            : "border border-line bg-surface-1 text-text-2 hover:border-line-strong"
        }`}
      >
        {current === "COMPLETED" ? "✓ Built it" : "Mark as built"}
      </button>

      {pending ? <span className="text-xs text-text-3">Saving…</span> : null}
    </div>
  );
}
