import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { Badge, Container, Panel } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Robotics glossary",
  description:
    "Every robotics term defined twice — once in plain language for a beginner, once in engineering terms for later. DOF, TCP, IK, SLAM, PID, URDF, QoS and more.",
};

export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryFilter = params.category ?? null;

  const terms = await prisma.glossaryTerm.findMany({
    where: categoryFilter ? { category: categoryFilter } : undefined,
    orderBy: { term: "asc" },
  });

  const allCategories = await prisma.glossaryTerm.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  // Group alphabetically so the page can be scanned like a real dictionary.
  const byLetter = new Map<string, typeof terms>();
  for (const term of terms) {
    const letter = term.term[0].toUpperCase();
    const list = byLetter.get(letter) ?? [];
    list.push(term);
    byLetter.set(letter, list);
  }

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-12">
          <Badge>Reference</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Glossary</h1>
          <p className="mt-3 max-w-2xl text-lg text-text-2">
            {terms.length} terms, each defined twice: once in plain language for first contact, and
            once in engineering terms for when you come back to it six months later.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/glossary"
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                categoryFilter
                  ? "border-line bg-surface-1 text-text-2 hover:border-line-strong"
                  : "border-signal/50 bg-signal-soft text-signal"
              }`}
            >
              All
            </Link>
            {allCategories.map(({ category }) => (
              <Link
                key={category}
                href={`/glossary?category=${category}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  categoryFilter === category
                    ? "border-signal/50 bg-signal-soft text-signal"
                    : "border-line bg-surface-1 text-text-2 hover:border-line-strong"
                }`}
              >
                {category}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-1">
            {[...byLetter.keys()].sort().map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="flex h-7 w-7 items-center justify-center rounded border border-line bg-surface-1 font-mono text-xs text-text-2 transition hover:border-signal/50 hover:text-signal"
              >
                {letter}
              </a>
            ))}
          </div>
        </Container>
      </section>

      <Container size="wide" className="space-y-8 py-12">
        {[...byLetter.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([letter, group]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-20">
              <h2 className="border-b border-line pb-2 font-mono text-lg font-semibold text-signal">
                {letter}
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {group.map((term) => (
                  <Link key={term.id} href={`/glossary/${term.slug}`} className="group">
                    <Panel className="h-full p-4 transition group-hover:border-signal/50">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-medium text-text-1 group-hover:text-signal">
                          {term.term}
                        </p>
                        {term.abbreviation ? (
                          <span className="shrink-0 font-mono text-[11px] text-text-3">
                            {term.abbreviation}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 line-clamp-3 text-sm text-text-2">{term.simple}</p>
                    </Panel>
                  </Link>
                ))}
              </div>
            </section>
          ))}
      </Container>
    </>
  );
}
