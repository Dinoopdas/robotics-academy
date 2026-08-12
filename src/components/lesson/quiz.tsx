"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { cn } from "@/lib/cn";
import { submitQuizAction } from "@/lib/actions/progress";

interface QuizQuestion {
  id: string;
  prompt: string;
  kind: string;
  explanation: string;
  answers: { id: string; text: string }[];
}

interface Result {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  perQuestion: Record<string, { correct: boolean; correctIds: string[] }>;
}

export function Quiz({
  quizId,
  title,
  passingScore,
  questions,
  signedIn,
  returnTo,
}: {
  quizId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
  signedIn: boolean;
  returnTo: string;
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const answeredCount = questions.filter((q) => (selected[q.id] ?? []).length > 0).length;
  const allAnswered = answeredCount === questions.length;

  function choose(question: QuizQuestion, answerId: string) {
    if (result) return;

    setSelected((current) => {
      const existing = current[question.id] ?? [];

      if (question.kind === "MULTI") {
        return {
          ...current,
          [question.id]: existing.includes(answerId)
            ? existing.filter((id) => id !== answerId)
            : [...existing, answerId],
        };
      }

      return { ...current, [question.id]: [answerId] };
    });
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const response = await submitQuizAction(quizId, selected);
      if (response.ok) {
        setResult({
          score: response.score,
          correct: response.correct,
          total: response.total,
          passed: response.passed,
          perQuestion: response.perQuestion,
        });
      } else {
        setError(response.error);
      }
    });
  }

  function retry() {
    setSelected({});
    setResult(null);
    setError(null);
  }

  return (
    <section className="overflow-hidden rounded-panel border border-line bg-surface-1">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-5 py-3.5">
        <div>
          <p className="label-tech">Quiz</p>
          <h2 className="mt-0.5 font-semibold text-text-1">{title}</h2>
        </div>
        {result ? (
          <div className="text-right">
            <p
              className={cn(
                "font-mono text-2xl font-semibold",
                result.passed ? "text-emerald" : "text-amber",
              )}
            >
              {result.score}%
            </p>
            <p className="text-xs text-text-3">
              {result.correct} of {result.total} · pass at {passingScore}%
            </p>
          </div>
        ) : (
          <p className="font-mono text-xs text-text-3">
            {answeredCount} / {questions.length} answered
          </p>
        )}
      </header>

      <div className="divide-y divide-line">
        {questions.map((question, index) => {
          const chosen = selected[question.id] ?? [];
          const outcome = result?.perQuestion[question.id];

          return (
            <div key={question.id} className="px-5 py-4">
              <div className="flex gap-3">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold",
                    outcome
                      ? outcome.correct
                        ? "bg-emerald text-surface-0"
                        : "bg-rose text-surface-0"
                      : "bg-surface-3 text-text-2",
                  )}
                >
                  {outcome ? (outcome.correct ? "✓" : "✗") : index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-1">{question.prompt}</p>
                  {question.kind === "MULTI" ? (
                    <p className="mt-0.5 text-xs text-text-3">Select all that apply</p>
                  ) : null}

                  <div className="mt-2.5 space-y-1.5">
                    {question.answers.map((answer) => {
                      const isChosen = chosen.includes(answer.id);
                      const isCorrect = outcome?.correctIds.includes(answer.id);

                      return (
                        <button
                          key={answer.id}
                          type="button"
                          disabled={Boolean(result)}
                          onClick={() => choose(question, answer.id)}
                          className={cn(
                            "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition",
                            result
                              ? isCorrect
                                ? "border-emerald/50 bg-emerald-soft/40 text-text-1"
                                : isChosen
                                  ? "border-rose/50 bg-rose-soft/40 text-text-1"
                                  : "border-line bg-surface-1 text-text-3"
                              : isChosen
                                ? "border-signal/55 bg-signal-soft text-text-1"
                                : "border-line bg-surface-1 text-text-2 hover:border-line-strong hover:bg-surface-2",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center border",
                              question.kind === "MULTI" ? "rounded-[3px]" : "rounded-full",
                              result
                                ? isCorrect
                                  ? "border-emerald bg-emerald"
                                  : isChosen
                                    ? "border-rose bg-rose"
                                    : "border-line"
                                : isChosen
                                  ? "border-signal bg-signal"
                                  : "border-line-strong",
                            )}
                          />
                          <span className="flex-1">{answer.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {outcome ? (
                    <p className="mt-2.5 rounded-lg border-l-2 border-l-signal bg-surface-2 px-3 py-2 text-sm text-text-2">
                      {question.explanation}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2 px-5 py-3.5">
        {error ? <p className="text-sm text-rose">{error}</p> : <span />}

        {!signedIn ? (
          <div className="flex w-full items-center justify-between gap-3">
            <p className="text-sm text-text-2">Sign in to have your score recorded.</p>
            <Link
              href={`/login?next=${encodeURIComponent(returnTo)}`}
              className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-surface-0 transition hover:bg-signal-strong"
            >
              Sign in
            </Link>
          </div>
        ) : result ? (
          <button
            type="button"
            onClick={retry}
            className="rounded-lg border border-line bg-surface-1 px-4 py-2 text-sm font-medium transition hover:border-line-strong"
          >
            Try again
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!allAnswered || pending}
            className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-surface-0 transition hover:bg-signal-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Marking…" : allAnswered ? "Submit answers" : `Answer all ${questions.length}`}
          </button>
        )}
      </footer>
    </section>
  );
}
