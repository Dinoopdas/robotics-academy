import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseCauses, parseStrings } from "@/lib/content/parse";
import { Badge, Breadcrumbs, Container, Panel } from "@/components/ui/primitives";
import { CauseAccordion } from "@/components/troubleshooting/cause-accordion";

export async function generateStaticParams() {
  const entries = await prisma.troubleshootingEntry.findMany({ select: { slug: true } });
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await prisma.troubleshootingEntry.findUnique({
    where: { slug },
    select: { title: true, symptom: true },
  });

  if (!entry) return { title: "Entry not found" };

  return {
    title: entry.title,
    description: entry.symptom.slice(0, 160),
    alternates: { canonical: `/troubleshooting/${slug}` },
  };
}

export default async function TroubleshootingEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const entry = await prisma.troubleshootingEntry.findUnique({ where: { slug } });
  if (!entry) notFound();

  const causes = parseCauses(entry.causes);
  const relatedSlugs = parseStrings(entry.relatedIds);

  const related = relatedSlugs.length
    ? await prisma.troubleshootingEntry.findMany({
        where: { slug: { in: relatedSlugs } },
        select: { slug: true, title: true, symptom: true },
      })
    : [];

  return (
    <>
      <div className="border-b border-line bg-surface-1">
        <Container size="wide" className="py-4">
          <Breadcrumbs
            items={[{ label: "Troubleshooting", href: "/troubleshooting" }, { label: entry.title }]}
          />
        </Container>
      </div>

      <Container size="wide" className="py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="rose">{entry.category}</Badge>
              <Badge>{entry.severity}</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {entry.title}
            </h1>

            <div className="mt-5 rounded-panel border-l-2 border-l-rose bg-rose-soft/25 py-3 pr-4 pl-4">
              <p className="label-tech mb-1 text-rose">Symptom</p>
              <p className="text-text-1">{entry.symptom}</p>
            </div>

            <div className="mt-8">
              <p className="label-tech mb-1">Work through these in order</p>
              <p className="mb-4 text-sm text-text-3">
                Causes are listed most-likely first. Do the checks before applying the fix — a fix
                applied to the wrong cause hides the real one.
              </p>
              <CauseAccordion causes={causes} />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Panel className="p-5">
              <p className="label-tech mb-2">Diagnostic discipline</p>
              <ul className="space-y-2 text-sm text-text-2">
                <li className="flex gap-2">
                  <span className="text-signal">1.</span>
                  <span>Change one thing at a time, or you will not know what fixed it.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-signal">2.</span>
                  <span>Check the cheap and likely causes before the expensive ones.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-signal">3.</span>
                  <span>Reproduce the fault deliberately before declaring it fixed.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-signal">4.</span>
                  <span>Write down what it was. The same fault recurs.</span>
                </li>
              </ul>
            </Panel>

            {related.length > 0 ? (
              <Panel className="p-5">
                <p className="label-tech mb-3">Related symptoms</p>
                <ul className="space-y-2.5">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/troubleshooting/${item.slug}`} className="group block">
                        <p className="text-sm font-medium text-text-1 group-hover:text-signal">
                          {item.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-3">{item.symptom}</p>
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
