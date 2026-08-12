import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { Badge, CardLink, Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Robotics simulations",
  description:
    "Interactive robotics simulators: PID tuning, forward and inverse kinematics, differential drive, coordinate frames, PWM, ultrasonic sensing and a Python playground.",
};

export default async function SimulationsPage() {
  const simulations = await prisma.simulation.findMany({
    where: { published: true },
    orderBy: [{ category: "asc" }, { position: "asc" }],
  });

  const byCategory = new Map<string, typeof simulations>();
  for (const simulation of simulations) {
    const list = byCategory.get(simulation.category) ?? [];
    list.push(simulation);
    byCategory.set(simulation.category, list);
  }

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-12">
          <Badge tone="cyan">Interactive</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Simulations</h1>
          <p className="mt-3 max-w-2xl text-lg text-text-2">
            Change a number and watch the robot respond. Every simulator runs entirely in your
            browser — no installation, no account, nothing uploaded.
          </p>
        </Container>
      </section>

      <Container size="wide" className="space-y-10 py-12">
        {[...byCategory.entries()].map(([category, items]) => (
          <section key={category}>
            <h2 className="border-b border-line pb-2 font-mono text-xs font-semibold tracking-wide text-text-3 uppercase">
              {category}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((simulation) => (
                <CardLink
                  key={simulation.id}
                  href={`/simulations/${simulation.slug}`}
                  className="p-5"
                >
                  <h3 className="font-semibold text-text-1 group-hover:text-signal">
                    {simulation.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-text-2">{simulation.description}</p>
                  <p className="mt-3 border-t border-line pt-3 font-mono text-[11px] text-text-3">
                    {simulation.widget}
                  </p>
                </CardLink>
              ))}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}
