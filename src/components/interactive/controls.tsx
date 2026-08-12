"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Shared chrome so every simulator looks and behaves the same way. */
export function LabShell({
  children,
  controls,
  readouts,
  footnote,
}: {
  children: ReactNode;
  controls?: ReactNode;
  readouts?: ReactNode;
  footnote?: string;
}) {
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface-1">
      <div className="bg-grid-fine border-b border-line p-4">{children}</div>

      {readouts ? (
        <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
          {readouts}
        </div>
      ) : null}

      {controls ? <div className="space-y-3 p-4">{controls}</div> : null}

      {footnote ? (
        <p className="border-t border-line px-4 py-2.5 text-xs text-text-3">{footnote}</p>
      ) : null}
    </div>
  );
}

export function Readout({
  label,
  value,
  unit,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    default: "text-text-1",
    good: "text-emerald",
    warn: "text-amber",
    bad: "text-rose",
  }[tone];

  return (
    <div className="bg-surface-1 px-3 py-2.5">
      <p className="label-tech text-[10px]">{label}</p>
      <p className={cn("font-mono text-sm font-semibold tabular-nums", toneClass)}>
        {value}
        {unit ? <span className="ml-0.5 text-[11px] font-normal text-text-3">{unit}</span> : null}
      </p>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit,
  onChange,
  format,
  accent = "signal",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  accent?: "signal" | "violet" | "emerald" | "amber";
}) {
  const accentColour = {
    signal: "accent-[var(--signal)]",
    violet: "accent-[var(--violet)]",
    emerald: "accent-[var(--emerald)]",
    amber: "accent-[var(--amber)]",
  }[accent];

  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-text-2">{label}</span>
        <span className="font-mono text-xs tabular-nums text-text-1">
          {format ? format(value) : value.toFixed(2)}
          {unit ? <span className="text-text-3"> {unit}</span> : null}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn("h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3", accentColour)}
        aria-label={label}
      />
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
        checked
          ? "border-signal/50 bg-signal-soft text-signal"
          : "border-line bg-surface-2 text-text-2 hover:border-line-strong",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full transition",
          checked ? "bg-signal" : "bg-text-3",
        )}
      />
      {label}
    </button>
  );
}

export function LabButton({
  children,
  onClick,
  variant = "secondary",
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50",
        variant === "primary"
          ? "bg-signal text-surface-0 hover:bg-signal-strong"
          : "border border-line bg-surface-2 text-text-2 hover:border-line-strong hover:text-text-1",
      )}
    >
      {children}
    </button>
  );
}
