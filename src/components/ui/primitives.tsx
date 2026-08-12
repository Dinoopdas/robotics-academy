import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";
import { DIFFICULTY_LABEL, DIFFICULTY_TONE, type Difficulty } from "@/lib/enums";

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Panel({
  className,
  children,
  ...rest
}: ComponentProps<"div"> & { children: ReactNode }) {
  return (
    <div
      className={cn("rounded-panel border border-line bg-surface-1", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Panel that lifts on hover — for anything the whole surface links to. */
export function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block rounded-panel border border-line bg-surface-1 transition",
        "hover:border-signal/50 hover:bg-surface-2 focus-visible:border-signal/60",
        className,
      )}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="label-tech mb-2">{eyebrow}</p> : null}
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 text-text-2">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function TechLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("label-tech", className)}>{children}</p>;
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

const TONE_CLASS: Record<string, string> = {
  cyan: "border-signal/35 bg-signal-soft text-signal",
  emerald: "border-emerald/35 bg-emerald-soft text-emerald",
  violet: "border-violet/35 bg-violet-soft text-violet",
  amber: "border-amber/35 bg-amber-soft text-amber",
  rose: "border-rose/35 bg-rose-soft text-rose",
  neutral: "border-line bg-surface-2 text-text-2",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide uppercase",
        TONE_CLASS[tone] ?? TONE_CLASS.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  const key = (difficulty in DIFFICULTY_LABEL ? difficulty : "BEGINNER") as Difficulty;
  return (
    <Badge tone={DIFFICULTY_TONE[key] as keyof typeof TONE_CLASS} className={className}>
      {DIFFICULTY_LABEL[key]}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-55";

const BUTTON_SIZE = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

const BUTTON_VARIANT = {
  primary:
    "bg-signal text-surface-0 hover:bg-signal-strong shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]",
  secondary: "border border-line bg-surface-1 text-text-1 hover:border-line-strong hover:bg-surface-2",
  ghost: "text-text-2 hover:bg-surface-2 hover:text-text-1",
  danger: "border border-rose/40 bg-rose-soft text-rose hover:border-rose/70",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANT;
export type ButtonSize = keyof typeof BUTTON_SIZE;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(BUTTON_BASE, BUTTON_SIZE[size], BUTTON_VARIANT[variant], className)}
      {...rest}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      href={href}
      className={cn(BUTTON_BASE, BUTTON_SIZE[size], BUTTON_VARIANT[variant], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export function ProgressBar({
  value,
  tone = "signal",
  className,
  showLabel = false,
  size = "md",
}: {
  value: number;
  tone?: "signal" | "emerald" | "violet" | "amber";
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const fill = {
    signal: "bg-signal",
    emerald: "bg-emerald",
    violet: "bg-violet",
    amber: "bg-amber",
  }[tone];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-surface-3",
          size === "sm" ? "h-1.5" : "h-2",
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel ? (
        <span className="w-10 shrink-0 text-right font-mono text-xs text-text-3">{pct}%</span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Callouts
// ---------------------------------------------------------------------------

const CALLOUT_STYLE = {
  note: { border: "border-l-signal", bg: "bg-signal-soft/40", label: "Note", text: "text-signal" },
  tip: { border: "border-l-emerald", bg: "bg-emerald-soft/40", label: "Tip", text: "text-emerald" },
  warning: {
    border: "border-l-amber",
    bg: "bg-amber-soft/40",
    label: "Watch out",
    text: "text-amber",
  },
  mistake: {
    border: "border-l-rose",
    bg: "bg-rose-soft/40",
    label: "Common mistake",
    text: "text-rose",
  },
  insight: {
    border: "border-l-violet",
    bg: "bg-violet-soft/40",
    label: "Insight",
    text: "text-violet",
  },
} as const;

export type CalloutTone = keyof typeof CALLOUT_STYLE;

export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}) {
  const style = CALLOUT_STYLE[tone] ?? CALLOUT_STYLE.note;
  return (
    <div className={cn("rounded-r-lg border-l-2 py-3 pr-4 pl-4", style.border, style.bg)}>
      <p className={cn("label-tech mb-1", style.text)}>{title || style.label}</p>
      <div className="prose-lesson text-[0.95rem]">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export function Stat({
  label,
  value,
  hint,
  tone = "signal",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "signal" | "emerald" | "violet" | "amber";
}) {
  const accent = {
    signal: "text-signal",
    emerald: "text-emerald",
    violet: "text-violet",
    amber: "text-amber",
  }[tone];

  return (
    <Panel className="p-4">
      <p className="label-tech">{label}</p>
      <p className={cn("mt-1.5 font-mono text-2xl font-semibold tracking-tight", accent)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-3">{hint}</p> : null}
    </Panel>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Panel className="bg-grid-fine px-6 py-14 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-2">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Panel>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-text-3">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="transition hover:text-signal">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-2">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Page-level container: one width for the whole site so pages line up. */
export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "prose";
}) {
  const width = {
    default: "max-w-6xl",
    wide: "max-w-7xl",
    prose: "max-w-3xl",
  }[size];

  return <div className={cn("mx-auto w-full px-4 sm:px-6", width, className)}>{children}</div>;
}
