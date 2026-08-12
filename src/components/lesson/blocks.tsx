import type { LessonBlock } from "@/lib/content/types";
import { highlight } from "@/lib/highlight";
import { renderMath } from "@/lib/math";
import { cn } from "@/lib/cn";
import { Diagram, hasDiagram } from "@/components/diagrams/registry";
import { InteractiveWidget } from "@/components/interactive/registry";
import { Callout, type CalloutTone } from "@/components/ui/primitives";
import { InlineText, renderInline } from "./inline";
import { CheckReveal } from "./check-reveal";

/**
 * Renders one lesson block. Async because code blocks are syntax-highlighted
 * on the server — no highlighter reaches the browser.
 */
export async function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "prose":
      return (
        <p className="prose-lesson">
          <InlineText text={block.text} />
        </p>
      );

    case "heading": {
      const Tag = block.level === 3 ? "h3" : "h2";
      return (
        <div className={block.level === 3 ? "pt-2" : "border-t border-line pt-8"}>
          <Tag
            id={slugify(block.text)}
            className={cn(
              "scroll-mt-24 font-semibold tracking-tight",
              block.level === 3 ? "text-lg" : "text-2xl",
            )}
          >
            {block.text}
          </Tag>
          {block.kicker ? <p className="mt-1.5 text-sm text-text-3">{block.kicker}</p> : null}
        </div>
      );
    }

    case "ladder":
      return (
        <figure className="rounded-panel border border-line bg-surface-1 p-5">
          {block.title ? <figcaption className="label-tech mb-4">{block.title}</figcaption> : null}
          <ol className="space-y-0">
            {block.rungs.map((rung, index) => (
              <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
                {index < block.rungs.length - 1 ? (
                  <span className="absolute top-7 bottom-0 left-[13px] w-px bg-line" aria-hidden="true" />
                ) : null}
                <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 font-mono text-xs font-semibold text-signal">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="label-tech mb-1">{rung.label}</p>
                  <p className="prose-lesson text-[0.95rem]">
                    <InlineText text={rung.text} />
                  </p>
                  {rung.math ? (
                    <div
                      className="scrollbar-slim mt-2 overflow-x-auto text-text-1"
                      dangerouslySetInnerHTML={{ __html: renderMath(rung.math) }}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </figure>
      );

    case "flow":
      return (
        <figure className="rounded-panel border border-line bg-surface-1 p-5">
          {block.title ? <figcaption className="label-tech mb-4">{block.title}</figcaption> : null}
          <div
            className={cn(
              "flex gap-2",
              block.direction === "horizontal"
                ? "scrollbar-slim flex-row items-stretch overflow-x-auto pb-2"
                : "flex-col",
            )}
          >
            {block.nodes.map((node, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  block.direction === "horizontal" ? "shrink-0 items-center gap-2" : "flex-col",
                )}
              >
                <div
                  className={cn(
                    "rounded-lg border px-4 py-2.5",
                    block.direction === "horizontal" ? "w-48" : "w-full",
                    node.accent
                      ? "border-signal/45 bg-signal-soft"
                      : "border-line bg-surface-2",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-medium",
                      node.accent ? "text-signal" : "text-text-1",
                    )}
                  >
                    {node.label}
                  </p>
                  {node.detail ? (
                    <p className="mt-0.5 text-xs text-text-3">{node.detail}</p>
                  ) : null}
                </div>

                {index < block.nodes.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex items-center justify-center text-text-3",
                      block.direction === "horizontal" ? "px-1" : "h-5 w-full",
                    )}
                  >
                    {block.direction === "horizontal" ? "→" : "↓"}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </figure>
      );

    case "diagram":
      if (!hasDiagram(block.name)) {
        return (
          <div className="rounded-panel border border-dashed border-line bg-surface-2 px-4 py-6 text-center text-sm text-text-3">
            Diagram “{block.name}” has not been drawn yet.
          </div>
        );
      }
      return (
        <figure className="rounded-panel border border-line bg-surface-1 p-5">
          {block.title ? <figcaption className="label-tech mb-4">{block.title}</figcaption> : null}
          <Diagram name={block.name} />
          {block.caption ? (
            <p className="mt-3 border-t border-line pt-3 text-xs text-text-3">{block.caption}</p>
          ) : null}
        </figure>
      );

    case "math":
      return (
        <figure className="rounded-panel border border-line bg-surface-1 p-5">
          {block.title ? <figcaption className="label-tech mb-3">{block.title}</figcaption> : null}
          <div
            className="scrollbar-slim overflow-x-auto py-1 text-text-1"
            dangerouslySetInnerHTML={{ __html: renderMath(block.latex) }}
          />
          {block.where?.length ? (
            <dl className="mt-4 space-y-1.5 border-t border-line pt-3">
              {block.where.map((entry, index) => (
                <div key={index} className="flex gap-3 text-sm">
                  <dt
                    className="w-20 shrink-0 text-right text-text-1"
                    dangerouslySetInnerHTML={{ __html: renderMath(entry.symbol, false) }}
                  />
                  <dd className="flex-1 text-text-2">
                    {entry.meaning}
                    {entry.unit ? (
                      <span className="ml-1.5 font-mono text-xs text-text-3">[{entry.unit}]</span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {block.note ? (
            <p className="mt-3 border-t border-line pt-3 text-sm text-text-2">
              <InlineText text={block.note} />
            </p>
          ) : null}
        </figure>
      );

    case "code": {
      const html = await highlight(block.code, block.language);
      return (
        <figure className="overflow-hidden rounded-panel border border-line bg-surface-1">
          {(block.title || block.filename) && (
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-2">
              <span className="text-xs font-medium text-text-1">{block.title}</span>
              <span className="font-mono text-[11px] text-text-3">
                {block.filename ?? block.language}
              </span>
            </figcaption>
          )}

          <div
            className="scrollbar-slim overflow-x-auto p-4 font-mono text-[13px] leading-relaxed [&_pre]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {block.annotations?.length ? (
            <div className="border-t border-line bg-surface-2 px-4 py-3">
              <p className="label-tech mb-2">Line by line</p>
              <dl className="space-y-1.5">
                {block.annotations.map((annotation, index) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <dt className="w-10 shrink-0 text-right font-mono text-xs text-signal">
                      {annotation.line}
                    </dt>
                    <dd className="flex-1 text-text-2">
                      <InlineText text={annotation.text} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {block.output ? (
            <div className="border-t border-line px-4 py-3">
              <p className="label-tech mb-1.5">Output</p>
              <pre className="scrollbar-slim overflow-x-auto font-mono text-xs whitespace-pre-wrap text-text-2">
                {block.output}
              </pre>
            </div>
          ) : null}
        </figure>
      );
    }

    case "callout":
      return (
        <Callout tone={block.tone as CalloutTone} title={block.title}>
          <InlineText text={block.text} />
        </Callout>
      );

    case "list": {
      const Tag = block.style === "number" ? "ol" : "ul";
      return (
        <div>
          {block.title ? <p className="label-tech mb-2.5">{block.title}</p> : null}
          <Tag className="space-y-2">
            {block.items.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-[3px] shrink-0 font-mono text-xs",
                    block.style === "check" ? "text-emerald" : "text-signal",
                  )}
                >
                  {block.style === "number" ? `${index + 1}.` : block.style === "check" ? "✓" : "▪"}
                </span>
                <span className="prose-lesson flex-1 text-[0.95rem]">
                  <InlineText text={item} />
                </span>
              </li>
            ))}
          </Tag>
        </div>
      );
    }

    case "steps":
      return (
        <div>
          {block.title ? <p className="label-tech mb-3">{block.title}</p> : null}
          <ol className="space-y-3">
            {await Promise.all(
              block.steps.map(async (step, index) => {
                const codeHtml = step.code
                  ? await highlight(step.code, step.language ?? "bash")
                  : null;

                return (
                  <li
                    key={index}
                    className="rounded-panel border border-line bg-surface-1 p-4"
                  >
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-signal font-mono text-xs font-bold text-surface-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-1">{step.title}</p>
                        {step.text ? (
                          <p className="prose-lesson mt-1 text-[0.95rem]">
                            <InlineText text={step.text} />
                          </p>
                        ) : null}
                        {codeHtml ? (
                          <div
                            className="scrollbar-slim mt-2.5 overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-xs [&_pre]:!bg-transparent"
                            dangerouslySetInnerHTML={{ __html: codeHtml }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              }),
            )}
          </ol>
        </div>
      );

    case "table":
      return (
        <figure>
          {block.title ? <figcaption className="label-tech mb-2.5">{block.title}</figcaption> : null}
          <div className="scrollbar-slim overflow-x-auto rounded-panel border border-line">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="bg-surface-2">
                  {block.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-line px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold tracking-wide text-text-2 uppercase"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-line last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={cn(
                          "px-3.5 py-2.5 align-top",
                          cellIndex === 0 ? "font-medium text-text-1" : "text-text-2",
                        )}
                      >
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption ? <p className="mt-2 text-xs text-text-3">{block.caption}</p> : null}
        </figure>
      );

    case "compare":
      return (
        <div>
          {block.title ? <p className="label-tech mb-2.5">{block.title}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {block.columns.map((column, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-panel border p-4",
                  column.tone === "positive"
                    ? "border-emerald/35 bg-emerald-soft/25"
                    : column.tone === "negative"
                      ? "border-rose/30 bg-rose-soft/20"
                      : "border-line bg-surface-1",
                )}
              >
                <p className="mb-2.5 font-medium text-text-1">{column.heading}</p>
                <ul className="space-y-1.5">
                  {column.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex gap-2 text-sm text-text-2">
                      <span aria-hidden="true" className="mt-[3px] text-xs text-text-3">▪</span>
                      <span className="flex-1">{renderInline(point)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case "example":
      return (
        <figure className="rounded-panel border border-violet/30 bg-violet-soft/25 p-5">
          <figcaption className="label-tech mb-2 text-violet">Worked example</figcaption>
          <p className="font-medium text-text-1">{block.title}</p>
          <p className="prose-lesson mt-1.5 text-[0.95rem]">
            <InlineText text={block.scenario} />
          </p>

          {block.steps?.length ? (
            <ol className="mt-3 space-y-1.5 border-t border-violet/20 pt-3">
              {block.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-mono text-xs text-violet">{index + 1}.</span>
                  <span className="flex-1 text-text-2">{renderInline(step)}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {block.result ? (
            <p className="mt-3 border-t border-violet/20 pt-3 text-sm text-text-1">
              <InlineText text={block.result} />
            </p>
          ) : null}
        </figure>
      );

    case "interactive":
      return (
        <section className="space-y-2.5">
          <div>
            <p className="label-tech text-signal">Interactive</p>
            {block.title ? <p className="mt-0.5 font-medium text-text-1">{block.title}</p> : null}
            {block.instructions ? (
              <p className="mt-1 text-sm text-text-2">
                <InlineText text={block.instructions} />
              </p>
            ) : null}
          </div>
          <InteractiveWidget widget={block.widget} config={block.config} />
        </section>
      );

    case "check":
      return <CheckReveal question={block.question} answer={block.answer} hint={block.hint} />;

    case "challenge":
      return (
        <figure className="rounded-panel border border-amber/35 bg-amber-soft/25 p-5">
          <figcaption className="label-tech mb-2 text-amber">Mini challenge</figcaption>
          <p className="font-medium text-text-1">{block.title}</p>
          <p className="prose-lesson mt-1.5 text-[0.95rem]">
            <InlineText text={block.text} />
          </p>

          {block.hints?.length ? (
            <details className="mt-3 border-t border-amber/25 pt-3">
              <summary className="cursor-pointer text-sm font-medium text-amber select-none">
                Hints ({block.hints.length})
              </summary>
              <ul className="mt-2 space-y-1.5">
                {block.hints.map((hint, index) => (
                  <li key={index} className="flex gap-2 text-sm text-text-2">
                    <span aria-hidden="true" className="text-xs text-amber">▪</span>
                    <span className="flex-1">{renderInline(hint)}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {block.challengeSlug ? (
            <a
              href={`/challenges/${block.challengeSlug}`}
              className="mt-3 inline-flex text-sm font-medium text-amber hover:underline"
            >
              Open the full challenge →
            </a>
          ) : null}
        </figure>
      );

    case "summary":
      return (
        <figure className="rounded-panel border border-signal/30 bg-signal-soft/25 p-5">
          <figcaption className="label-tech mb-3 text-signal">Summary</figcaption>
          <ul className="space-y-2">
            {block.points.map((point, index) => (
              <li key={index} className="flex gap-2.5 text-sm">
                <span aria-hidden="true" className="mt-[3px] shrink-0 text-xs text-signal">✓</span>
                <span className="flex-1 text-text-1">{renderInline(point)}</span>
              </li>
            ))}
          </ul>
        </figure>
      );

    case "deepdive":
      return (
        <div className="rounded-panel border border-line bg-surface-1 p-5">
          <p className="label-tech mb-3">{block.title ?? "Going deeper"}</p>
          <dl className="divide-y divide-line">
            {block.entries.map((entry, index) => (
              <div key={index} className="py-3 first:pt-0 last:pb-0">
                <dt className="font-medium text-text-1">{entry.question}</dt>
                <dd className="prose-lesson mt-1 text-[0.95rem]">
                  <InlineText text={entry.answer} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );

    default:
      return null;
  }
}

export async function BlockList({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
