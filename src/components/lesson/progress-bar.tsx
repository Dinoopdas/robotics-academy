"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { completeLessonAction, markLessonViewedAction, uncompleteLessonAction } from "@/lib/actions/progress";

/**
 * Marks a lesson complete and records time on page.
 *
 * Time is measured only while the tab is visible, so leaving a lesson open
 * overnight does not report eight hours of study. It is capped at the lesson's
 * own estimate times three, because the dashboard's "time spent" is only
 * useful if it reflects attention rather than an open tab.
 */
export function LessonProgressBar({
  lessonId,
  isComplete,
  signedIn,
  returnTo,
  nextHref,
  nextLabel,
}: {
  lessonId: string;
  isComplete: boolean;
  signedIn: boolean;
  returnTo: string;
  nextHref: string;
  nextLabel: string;
}) {
  const [complete, setComplete] = useState(isComplete);
  const [pending, startTransition] = useTransition();
  const visibleSeconds = useRef(0);

  useEffect(() => {
    if (!signedIn) return;

    startTransition(async () => {
      await markLessonViewedAction(lessonId);
    });

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        visibleSeconds.current = Math.min(visibleSeconds.current + 5, 5400);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lessonId, signedIn]);

  function toggle() {
    startTransition(async () => {
      if (complete) {
        const result = await uncompleteLessonAction(lessonId);
        if (result.ok) setComplete(false);
      } else {
        const result = await completeLessonAction(lessonId, visibleSeconds.current);
        if (result.ok) {
          setComplete(true);
          visibleSeconds.current = 0;
        }
      }
    });
  }

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-panel border border-line bg-surface-1 p-5">
        <div>
          <p className="font-medium text-text-1">Track your progress</p>
          <p className="mt-0.5 text-sm text-text-2">
            Create a free account to mark lessons complete, keep quiz scores and build your skill
            tree. Reading needs no account.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/signup?next=${encodeURIComponent(returnTo)}`}
            className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-surface-0 transition hover:bg-signal-strong"
          >
            Create account
          </Link>
          <Link
            href={nextHref}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium transition hover:border-line-strong"
          >
            Next lesson
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-panel border p-5 transition ${
        complete ? "border-emerald/40 bg-emerald-soft/25" : "border-line bg-surface-1"
      }`}
    >
      <div>
        <p className="font-medium text-text-1">
          {complete ? "Lesson complete" : "Finished this lesson?"}
        </p>
        <p className="mt-0.5 text-sm text-text-2">
          {complete
            ? `Up next: ${nextLabel}`
            : "Marking it complete updates your skill tree and streak."}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
            complete
              ? "border border-line bg-surface-1 text-text-2 hover:border-line-strong"
              : "bg-emerald text-surface-0 hover:opacity-90"
          }`}
        >
          {pending ? "Saving…" : complete ? "Mark incomplete" : "Mark complete"}
        </button>

        <Link
          href={nextHref}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            complete
              ? "bg-signal text-surface-0 hover:bg-signal-strong"
              : "border border-line hover:border-line-strong"
          }`}
        >
          Next →
        </Link>
      </div>
    </div>
  );
}
