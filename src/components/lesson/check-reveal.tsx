"use client";

import { useState } from "react";

import { InlineText } from "./inline";

/**
 * A self-check with a deliberate reveal step.
 *
 * The answer is hidden behind a click rather than shown inline because the
 * retrieval attempt is what makes it stick — reading the answer alongside the
 * question produces recognition, not recall.
 */
export function CheckReveal({
  question,
  answer,
  hint,
}: {
  question: string;
  answer: string;
  hint?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  return (
    <div className="rounded-panel border border-emerald/30 bg-emerald-soft/20 p-5">
      <p className="label-tech mb-2 text-emerald">Check yourself</p>
      <p className="font-medium text-text-1">
        <InlineText text={question} />
      </p>

      {hint && !revealed ? (
        <div className="mt-3">
          {hintShown ? (
            <p className="text-sm text-text-2">
              <span className="font-medium text-emerald">Hint: </span>
              <InlineText text={hint} />
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setHintShown(true)}
              className="text-sm font-medium text-emerald hover:underline"
            >
              Show a hint
            </button>
          )}
        </div>
      ) : null}

      <div className="mt-3 border-t border-emerald/20 pt-3">
        {revealed ? (
          <p className="prose-lesson text-[0.95rem]">
            <InlineText text={answer} />
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded-lg border border-emerald/40 bg-surface-1 px-3.5 py-1.5 text-sm font-medium text-emerald transition hover:bg-emerald-soft"
          >
            Reveal the answer
          </button>
        )}
      </div>
    </div>
  );
}
