import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseLessonRefs, parseStrings } from "@/lib/content/parse";
import { renderMath } from "@/lib/math";
import { Badge, Breadcrumbs, Container, Panel } from "@/components/ui/primitives";

export async function generateStaticParams() {
  const terms = await prisma.glossaryTerm.findMany({ select: { slug: true } });
  return terms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = await prisma.glossaryTerm.findUnique({
    where: { slug },
    select: { term: true, abbreviation: true, simple: true },
  });

  if (!term) return { title: "Term not found" };

  const title = term.abbreviation ? `${term.term} (${term.abbreviation})` : term.term;

  return {
    title: `${title} — robotics glossary`,
    description: term.simple.slice(0, 160),
    alternates: { canonical: `/glossary/${slug}` },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const term = await prisma.glossaryTerm.findUnique({ where: { slug } });
  if (!term) notFound();

  const relatedSlugs = parseStrings(term.relatedSlugs);
  const lessonRefs = parseLessonRefs(term.lessonRefs);

  const related = relatedSlugs.length
    ? await prisma.glossaryTerm.findMany({
        where: { slug: { in: relatedSlugs } },
        select: { slug: true, term: true, abbreviation: true, simple: true },
      })
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    alternateName: term.abbreviation || undefined,
    description: term.technical,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Robotics Academy Glossary",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-line bg-surface-1">
        <Container size="wide" className="py-4">
          <Breadcrumbs items={[{ label: "Glossary", href: "/glossary" }, { label: term.term }]} />
        </Container>
      </div>

      <Container size="wide" className="py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="min-w-0">
            <Badge>{term.category}</Badge>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {term.term}
              {term.abbreviation ? (
                <span className="ml-3 font-mono text-2xl text-text-3">{term.abbreviation}</span>
              ) : null}
            </h1>

            <div className="mt-8 space-y-6">
              <section className="rounded-panel border border-emerald/30 bg-emerald-soft/20 p-5">
                <p className="label-tech mb-2 text-emerald">In plain language</p>
                <p className="text-lg text-text-1">{term.simple}</p>
              </section>

              <section className="rounded-panel border border-line bg-surface-1 p-5">
                <p className="label-tech mb-2">Technical definition</p>
                <p className="prose-lesson">{term.technical}</p>
              </section>

              {term.formula ? (
                <section className="rounded-panel border border-line bg-surface-1 p-5">
                  <p className="label-tech mb-3">Mathematical form</p>
                  <div
                    className="scrollbar-slim overflow-x-auto text-text-1"
                    dangerouslySetInnerHTML={{ __html: renderMath(term.formula) }}
                  />
                </section>
              ) : null}

              {term.example ? (
                <section className="rounded-panel border border-violet/30 bg-violet-soft/25 p-5">
                  <p className="label-tech mb-2 text-violet">Example</p>
                  <p className="prose-lesson">{term.example}</p>
                </section>
              ) : null}
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {lessonRefs.length > 0 ? (
              <Panel className="p-5">
                <p className="label-tech mb-3">Learn it properly</p>
                <ul className="space-y-2">
                  {lessonRefs.map((ref) => (
                    <li key={`${ref.courseSlug}/${ref.lessonSlug}`}>
                      <Link
                        href={`/learn/${ref.courseSlug}/${ref.lessonSlug}`}
                        className="flex gap-2 text-sm text-text-2 transition hover:text-signal"
                      >
                        <span aria-hidden="true" className="text-signal">→</span>
                        <span className="flex-1">{ref.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}

            {related.length > 0 ? (
              <Panel className="p-5">
                <p className="label-tech mb-3">Related terms</p>
                <ul className="space-y-2.5">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/glossary/${item.slug}`} className="group block">
                        <p className="text-sm font-medium text-text-1 group-hover:text-signal">
                          {item.term}
                          {item.abbreviation ? (
                            <span className="ml-1.5 font-mono text-[11px] text-text-3">
                              {item.abbreviation}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-3">{item.simple}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}
          </aside>
        </div>
      </Container>
    </>
  );
}
