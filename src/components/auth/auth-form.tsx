"use client";

import { useActionState } from "react";

import type { AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = {};

export function AuthForm({
  mode,
  action,
  next,
  submitLabel,
}: {
  mode: "signin" | "signup";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.error ? (
        <p className="rounded-lg border border-rose/40 bg-rose-soft/50 px-4 py-2.5 text-sm text-rose">
          {state.error}
        </p>
      ) : null}

      {mode === "signup" ? (
        <Field
          label="Your name"
          name="name"
          type="text"
          autoComplete="name"
          required
          error={state.fieldErrors?.name}
        />
      ) : null}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        required
        hint={mode === "signup" ? "At least 10 characters. Length beats complexity." : undefined}
        error={state.fieldErrors?.password}
      />

      {mode === "signup" ? (
        <Field
          label="What do you want to build? (optional)"
          name="goal"
          type="text"
          placeholder="A robot arm that sorts parts by colour"
          error={state.fieldErrors?.goal}
        />
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-signal text-sm font-medium text-surface-0 transition hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Working…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  error,
  hint,
  ...rest
}: {
  label: string;
  name: string;
  type: string;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text-1">{label}</span>
      <input
        name={name}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={`h-11 w-full rounded-lg border bg-surface-1 px-3.5 text-sm text-text-1 outline-none transition focus:border-signal ${
          error ? "border-rose" : "border-line"
        }`}
        {...rest}
      />
      {error ? (
        <span id={`${name}-error`} className="mt-1 block text-xs text-rose">
          {error}
        </span>
      ) : hint ? (
        <span id={`${name}-hint`} className="mt-1 block text-xs text-text-3">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
