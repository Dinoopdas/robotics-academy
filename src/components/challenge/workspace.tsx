"use client";

import { useState } from "react";

import { PythonPlayground } from "@/components/interactive/python-playground";

/**
 * Hints reveal one at a time and the solution stays behind a second, explicit
 * confirmation. Struggling productively is the point of a challenge, so the
 * interface deliberately makes giving up a decision rather than a scroll.
 */
export function ChallengeWorkspace({
  starterCode,
  hints,
  solutionHtml,
  explanation,
}: {
  starterCode: string;
  hints: string[];
  solutionHtml: string;
  explanation: string;
}) {
  const [revealedHints, setRevealedHints] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <p className="label-tech mb-2">Your attempt</p>
        <PythonPlayground initialCode={starterCode} />
      </div>

      {hints.length > 0 ? (
        <div className="rounded-panel border border-line bg-surface-1 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="label-tech">
              Hints ({revealedHints} of {hints.length} shown)
            </p>
            {revealedHints < hints.length ? (
              <button
                type="button"
                onClick={() => setRevealedHints((n) => n + 1)}
                className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-2 transition hover:border-line-strong hover:text-text-1"
              >
                Show{revealedHints > 0 ? " another" : " a"} hint
              </button>
            ) : null}
          </div>

          {revealedHints > 0 ? (
            <ul className="mt-3 space-y-2 border-t border-line pt-3">
              {hints.slice(0, revealedHints).map((hint, index) => (
                <li key={index} className="flex gap-2.5 text-sm text-text-2">
                  <span className="shrink-0 font-mono text-xs text-amber">{index + 1}.</span>
                  <span className="flex-1">{hint}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-panel border border-line bg-surface-1">
        {solutionShown ? (
          <>
            <div className="border-b border-line bg-surface-2 px-5 py-2.5">
              <p className="label-tech">Solution</p>
            </div>
            <div
              className="scrollbar-slim overflow-x-auto p-5 font-mono text-[13px] leading-relaxed [&_pre]:!bg-transparent"
              dangerouslySetInnerHTML={{ __html: solutionHtml }}
            />
            <div className="border-t border-line px-5 py-4">
              <p className="label-tech mb-2">Why it works</p>
              <p className="prose-lesson text-[0.95rem]">{explanation}</p>
            </div>
          </>
        ) : (
          <div className="p-5 text-center">
            <p className="text-sm text-text-2">
              Try it yourself first — including the edge cases in the test table.
            </p>
            <button
              type="button"
              onClick={() => setSolutionShown(true)}
              className="mt-3 rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-text-2 transition hover:border-line-strong hover:text-text-1"
            >
              Show the solution
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
