"use client";

import { useActionState, useState } from "react";

import { updateLessonAction, type AdminState } from "@/lib/actions/admin";
import { DIFFICULTIES, DIFFICULTY_LABEL } from "@/lib/enums";

const initialState: AdminState = {};

/** Pretty-prints stored JSON so the textarea is editable rather than one long line. */
function format(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function LessonEditor({
  lessonId,
  title,
  summary,
  estimatedMinutes,
  difficulty,
  published,
  objectives,
  blocks,
}: {
  lessonId: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  difficulty: string;
  published: boolean;
  objectives: string;
  blocks: string;
}) {
  const [state, action, pending] = useActionState(updateLessonAction, initialState);
  const [blocksText, setBlocksText] = useState(() => format(blocks));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Validate on every keystroke so a broken paste is visible before submitting
  // rather than after a round trip.
  function onBlocksChange(value: string) {
    setBlocksText(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(Array.isArray(parsed) ? null : "Top level must be an array of blocks.");
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Invalid JSON");
    }
  }

  const blockCount = (() => {
    try {
      const parsed = JSON.parse(blocksText);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  })();

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lessonId" value={lessonId} />

      {state.error ? (
        <p className="rounded-lg border border-rose/40 bg-rose-soft/50 px-3.5 py-2.5 text-sm text-rose">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg border border-emerald/40 bg-emerald-soft/50 px-3.5 py-2.5 text-sm text-emerald">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-4 rounded-panel border border-line bg-surface-1 p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Title</span>
          <input
            name="title"
            defaultValue={title}
            required
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm outline-none focus:border-signal"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Summary</span>
          <textarea
            name="summary"
            defaultValue={summary}
            required
            rows={3}
            className="scrollbar-slim w-full resize-y rounded-lg border border-line bg-surface-2 p-3 text-sm outline-none focus:border-signal"
          />
        </label>

        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Minutes</span>
            <input
              name="estimatedMinutes"
              type="number"
              min={1}
              max={240}
              defaultValue={estimatedMinutes}
              className="h-10 w-24 rounded-lg border border-line bg-surface-2 px-3 text-sm outline-none focus:border-signal"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Difficulty</span>
            <select
              name="difficulty"
              defaultValue={difficulty}
              className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm outline-none focus:border-signal"
            >
              {DIFFICULTIES.map((value) => (
                <option key={value} value={value}>
                  {DIFFICULTY_LABEL[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex h-10 items-center gap-2.5">
            <input
              type="checkbox"
              name="published"
              defaultChecked={published}
              className="h-4 w-4 accent-[var(--signal)]"
            />
            <span className="text-sm font-medium">Published</span>
          </label>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          Learning objectives{" "}
          <span className="font-normal text-text-3">— JSON array of strings</span>
        </span>
        <textarea
          name="objectives"
          defaultValue={format(objectives)}
          rows={5}
          spellCheck={false}
          className="scrollbar-slim w-full resize-y rounded-lg border border-line bg-surface-1 p-3 font-mono text-xs outline-none focus:border-signal"
        />
      </label>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium">
            Content blocks{" "}
            <span className="font-normal text-text-3">— JSON array</span>
          </span>
          <span
            className={`font-mono text-xs ${jsonError ? "text-rose" : "text-text-3"}`}
          >
            {jsonError ? jsonError : `${blockCount} blocks · valid JSON`}
          </span>
        </div>
        <textarea
          name="blocks"
          value={blocksText}
          onChange={(event) => onBlocksChange(event.target.value)}
          rows={28}
          spellCheck={false}
          className={`scrollbar-slim w-full resize-y rounded-lg border bg-surface-1 p-3 font-mono text-xs leading-relaxed outline-none ${
            jsonError ? "border-rose" : "border-line focus:border-signal"
          }`}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || Boolean(jsonError)}
          className="h-10 rounded-lg bg-signal px-5 text-sm font-medium text-surface-0 transition hover:bg-signal-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save lesson"}
        </button>
        {jsonError ? (
          <span className="text-xs text-rose">Fix the JSON before saving.</span>
        ) : (
          <span className="text-xs text-text-3">
            Saving re-indexes search and revalidates the public page.
          </span>
        )}
      </div>
    </form>
  );
}
