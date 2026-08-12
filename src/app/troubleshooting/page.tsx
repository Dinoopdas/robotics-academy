import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { parseCauses } from "@/lib/content/parse";
import { Badge, CardLink, Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Robotics troubleshooting",
  description:
    "A diagnostic knowledge base: the robot does not move, a ROS 2 node publishes but nothing receives, TF lookups fail, motors overheat, PID oscillates, vision detects the wrong thing.",
};

export default async function TroubleshootingPage() {
  const entries = await prisma.troubleshootingEntry.findMany({
    orderBy: [{ category: "asc" }, { position: "asc" }],
  });

  const byCategory = new Map<string, typeof entries>();
  for (const entry of entries) {
    const list = byCategory.get(entry.category) ?? [];
    list.push(entry);
    byCategory.set(entry.category, list);
  }

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-12">
          <Badge tone="rose">Diagnostics</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Troubleshooting</h1>
          <p className="mt-3 max-w-2xl text-lg text-text-2">
            Start from the symptom. Each entry lists the likely causes in order of probability, with
            the specific checks that confirm or eliminate each one — so you narrow it down instead
            of changing things at random.
          </p>
        </Container>
      </section>

      <Container size="wide" className="space-y-10 py-12">
        {[...byCategory.entries()].map(([category, items]) => (
          <section key={category}>
            <h2 className="border-b border-line pb-2 font-mono text-xs font-semibold tracking-wide text-text-3 uppercase">
              {category}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {items.map((entry) => {
                const causes = parseCauses(entry.causes);
                return (
                  <CardLink
                    key={entry.id}
                    href={`/troubleshooting/${entry.slug}`}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-text-1 group-hover:text-signal">
                        {entry.title}
                      </h3>
                      <span className="shrink-0 font-mono text-[10px] text-text-3">
                        {entry.severity}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-text-2">{entry.symptom}</p>
                    <p className="mt-3 border-t border-line pt-3 font-mono text-[11px] text-text-3">
                      {causes.length} likely causes
                    </p>
                  </CardLink>
                );
              })}
            </div>
          </section>
        ))}

        <p className="border-t border-line pt-6 text-sm text-text-3">
          Cannot find your symptom?{" "}
          <Link href="/search" className="text-signal hover:underline">
            Search the whole platform
          </Link>{" "}
          — error messages often appear in the lesson that explains the underlying concept.
        </p>
      </Container>
    </>
  );
}
