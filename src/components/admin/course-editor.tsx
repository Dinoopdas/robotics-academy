"use client";

import { useActionState } from "react";

import { updateCourseAction, type AdminState } from "@/lib/actions/admin";
import { DIFFICULTIES, DIFFICULTY_LABEL } from "@/lib/enums";

const initialState: AdminState = {};

export function CourseEditor({
  courseId,
  title,
  subtitle,
  description,
  difficulty,
  published,
}: {
  courseId: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: string;
  published: boolean;
}) {
  const [state, action, pending] = useActionState(updateCourseAction, initialState);

  return (
    <form action={action} className="space-y-4 rounded-panel border border-line bg-surface-1 p-5">
      <input type="hidden" name="courseId" value={courseId} />

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
        <span className="mb-1.5 block text-sm font-medium">Subtitle</span>
        <input
          name="subtitle"
          defaultValue={subtitle}
          required
          className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm outline-none focus:border-signal"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Description</span>
        <textarea
          name="description"
          defaultValue={description}
          required
          rows={5}
          className="scrollbar-slim w-full resize-y rounded-lg border border-line bg-surface-2 p-3 text-sm outline-none focus:border-signal"
        />
      </label>

      <div className="flex flex-wrap items-end gap-4">
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

        <button
          type="submit"
          disabled={pending}
          className="ml-auto h-10 rounded-lg bg-signal px-5 text-sm font-medium text-surface-0 transition hover:bg-signal-strong disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save course"}
        </button>
      </div>
    </form>
  );
}
