import type { Metadata } from "next";
import Link from "next/link";

import { searchGrouped, type SearchHit } from "@/lib/search";
import { SEARCH_KIND_LABEL, type SearchKind } from "@/lib/enums";
import { Badge, Container, EmptyState, LinkButton, Panel } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every lesson, project, challenge, glossary term and troubleshooting entry.",
  robots: { index: false, follow: true },
};

const KIND_TONE: Record<string, "cyan" | "violet" | "emerald" | "amber" | "rose" | "neutral"> = {
  lesson: "cyan",
  course: "violet",
  project: "emerald",
  challenge: "amber",
  glossary: "neutral",
  simulation: "cyan",
  troubleshooting: "rose",
};

const SUGGESTIONS = [
  "What is TCP?",
  "How does inverse kinematics work?",
  "ROS 2 publisher example",
  "How to control a servo",
  "PID overshoot",
  "degrees of freedom",
  "ultrasonic sensor limitations",
  "odometry drift",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const empty = { hits: [] as SearchHit[], groups: new Map<SearchKind, SearchHit[]>() };
  const { hits, groups } = query ? await searchGrouped(query) : empty;

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-10">
          <h1 className="text-3xl font-semibold tracking-tight">Search</h1>

          <form action="/search" method="get" className="mt-5 max-w-2xl">
            <div className="flex gap-2">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search concepts, sensors, algorithms, errors…"
                autoFocus
                className="h-11 flex-1 rounded-lg border border-line bg-surface-1 px-4 text-sm text-text-1 outline-none transition focus:border-signal"
                aria-label="Search query"
              />
              <button
                type="submit"
                className="h-11 rounded-lg bg-signal px-5 text-sm font-medium text-surface-0 transition hover:bg-signal-strong"
              >
                Search
              </button>
            </div>
          </form>

          {query ? (
            <p className="mt-3 text-sm text-text-3">
              {hits.length === 0
                ? `No results for “${query}”`
                : `${hits.length} result${hits.length === 1 ? "" : "s"} for “${query}”`}
            </p>
          ) : null}
        </Container>
      </section>

      <Container size="wide" className="py-10">
        {!query ? (
          <Panel className="p-6">
            <p className="label-tech mb-3">Try one of these</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-sm text-text-2 transition hover:border-signal/50 hover:text-signal"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
            <p className="mt-5 border-t border-line pt-4 text-sm text-text-3">
              Search covers lessons, courses, projects, challenges, simulations, glossary terms and
              troubleshooting entries. Press <kbd className="rounded border border-line bg-surface-2 px-1.5 font-mono text-xs">Ctrl</kbd>{" "}
              <kbd className="rounded border border-line bg-surface-2 px-1.5 font-mono text-xs">K</kbd> anywhere to search without leaving the page.
            </p>
          </Panel>
        ) : hits.length === 0 ? (
          <EmptyState
            title="Nothing matched"
            description="Try a broader term, a component name, or the exact wording of an error message."
            action={<LinkButton href="/learn">Browse the curriculum</LinkButton>}
          />
        ) : (
          <div className="space-y-8">
            {[...groups.entries()].map(([kind, kindHits]) => (
              <section key={kind}>
                <h2 className="flex items-center gap-2 border-b border-line pb-2">
                  <span className="font-mono text-xs font-semibold tracking-wide text-text-3 uppercase">
                    {SEARCH_KIND_LABEL[kind as SearchKind]}
                  </span>
                  <span className="font-mono text-xs text-text-3">({kindHits.length})</span>
                </h2>

                <ul className="mt-3 divide-y divide-line">
                  {kindHits.map((hit) => (
                    <li key={`${hit.kind}-${hit.ref}`}>
                      <Link
                        href={hit.url}
                        className="group block rounded-lg px-2 py-3.5 transition hover:bg-surface-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={KIND_TONE[hit.kind] ?? "neutral"}>
                            {SEARCH_KIND_LABEL[hit.kind]}
                          </Badge>
                          <span className="font-medium text-text-1 group-hover:text-signal">
                            {hit.title}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-text-2">{hit.excerpt}</p>
                        <p className="mt-1 font-mono text-[11px] text-text-3">{hit.url}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
