import Link from "next/link";
import type { ReactNode } from "react";

import { renderMath } from "@/lib/math";

/**
 * Renders the small inline syntax used throughout lesson text:
 *
 *   **bold**   `code`   *italic*   $math$   [label](href)
 *
 * A deliberately tiny parser rather than a markdown library. The block model
 * already handles structure, so all that is needed here is emphasis — and a
 * full markdown pipeline would let authored content inject arbitrary HTML,
 * which this cannot: every branch produces a React element, never raw markup,
 * except the KaTeX output which comes from a renderer, not from the author.
 */

const PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

export function renderInline(text: string): ReactNode[] {
  const parts = text.split(PATTERN);

  return parts.map((part, index) => {
    if (!part) return null;
    const key = `${index}-${part.slice(0, 8)}`;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-text-1">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={key}
          className="rounded border border-line bg-surface-2 px-[0.34em] py-[0.1em] font-mono text-[0.875em] text-text-1"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      return (
        <span
          key={key}
          // Source is a KaTeX render of author-written LaTeX, with trust
          // disabled so \href and \htmlClass cannot emit markup.
          dangerouslySetInnerHTML={{ __html: renderMath(part.slice(1, -1), false) }}
        />
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={key} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      const isInternal = href.startsWith("/");

      if (isInternal) {
        return (
          <Link
            key={key}
            href={href}
            className="text-signal underline decoration-1 underline-offset-[3px] hover:text-signal-strong"
          >
            {label}
          </Link>
        );
      }

      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-signal underline decoration-1 underline-offset-[3px] hover:text-signal-strong"
        >
          {label}
        </a>
      );
    }

    return <span key={key}>{part}</span>;
  });
}

/** Convenience wrapper for a paragraph of inline-formatted text. */
export function InlineText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderInline(text)}</span>;
}
