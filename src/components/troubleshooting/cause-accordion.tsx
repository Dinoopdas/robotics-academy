"use client";

import { useState } from "react";

import type { TroubleCause } from "@/lib/content/types";

const LIKELIHOOD_STYLE: Record<string, { label: string; className: string }> = {
  high: { label: "Most likely", className: "border-rose/40 bg-rose-soft text-rose" },
  medium: { label: "Possible", className: "border-amber/40 bg-amber-soft text-amber" },
  low: { label: "Less likely", className: "border-line bg-surface-2 text-text-3" },
};

/**
 * Causes as a checklist rather than prose.
 *
 * Ticking a check crosses it out locally so a learner working through a real
 * fault can see what they have already eliminated. The state is deliberately
 * not persisted — it belongs to this debugging session, not to the account.
 */
export function CauseAccordion({ causes }: { causes: TroubleCause[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <ol className="space-y-3">
      {causes.map((cause, index) => {
        const isOpen = open === index;
        const style = LIKELIHOOD_STYLE[cause.likelihood] ?? LIKELIHOOD_STYLE.low;

        return (
          <li key={index} className="overflow-hidden rounded-panel border border-line bg-surface-1">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-2"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-3 font-mono text-xs font-bold text-text-2">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 font-medium text-text-1">{cause.cause}</span>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${style.className}`}
              >
                {style.label}
              </span>
              <span
                aria-hidden="true"
                className={`shrink-0 text-text-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {isOpen ? (
              <div className="border-t border-line px-4 py-4">
                <p className="label-tech mb-2.5">Checks</p>
                <ul className="space-y-2">
                  {cause.checks.map((check, checkIndex) => {
                    const key = `${index}-${checkIndex}`;
                    const isChecked = checked[key] ?? false;

                    return (
                      <li key={checkIndex}>
                        <button
                          type="button"
                          onClick={() => setChecked((c) => ({ ...c, [key]: !isChecked }))}
                          className="flex w-full items-start gap-2.5 text-left text-sm transition"
                        >
                          <span
                            className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] transition ${
                              isChecked
                                ? "border-emerald bg-emerald text-surface-0"
                                : "border-line-strong text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span
                            className={`flex-1 ${isChecked ? "text-text-3 line-through" : "text-text-2"}`}
                          >
                            {check}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 rounded-lg border-l-2 border-l-emerald bg-emerald-soft/30 px-3.5 py-2.5">
                  <p className="label-tech mb-1 text-emerald">If this is the cause</p>
                  <p className="text-sm text-text-1">{cause.fix}</p>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
