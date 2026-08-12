import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseConfig, parseLinks } from "@/lib/content/parse";
import { Badge, Breadcrumbs, Container, Panel } from "@/components/ui/primitives";
import { InteractiveWidget } from "@/components/interactive/registry";

export async function generateStaticParams() {
  const simulations = await prisma.simulation.findMany({ select: { slug: true } });
  return simulations.map((simulation) => ({ slug: simulation.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const simulation = await prisma.simulation.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });

  if (!simulation) return { title: "Simulation not found" };

  return {
    title: simulation.title,
    description: simulation.description.slice(0, 160),
    alternates: { canonical: `/simulations/${slug}` },
  };
}

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const simulation = await prisma.simulation.findUnique({ where: { slug } });
  if (!simulation) notFound();

  const config = parseConfig(simulation.config);
  const links = parseLinks(simulation.learnMore);

  return (
    <>
      <div className="border-b border-line bg-surface-1">
        <Container size="wide" className="py-4">
          <Breadcrumbs
            items={[{ label: "Simulations", href: "/simulations" }, { label: simulation.title }]}
          />
        </Container>
      </div>

      <Container size="wide" className="py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <Badge tone="cyan">{simulation.category}</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{simulation.title}</h1>
            <p className="mt-2 max-w-2xl text-text-2">{simulation.description}</p>

            <div className="mt-8">
              <InteractiveWidget widget={simulation.widget} config={config} />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {links.length > 0 ? (
              <Panel className="p-5">
                <p className="label-tech mb-3">Learn the theory</p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex gap-2 text-sm text-text-2 transition hover:text-signal"
                      >
                        <span aria-hidden="true" className="text-signal">→</span>
                        <span className="flex-1">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}

            <Panel className="p-5">
              <p className="label-tech mb-2">Runs locally</p>
              <p className="text-sm text-text-2">
                This simulator executes in your browser. Nothing is sent to a server, so you can
                experiment freely — including with the Python playground, which runs CPython
                compiled to WebAssembly.
              </p>
            </Panel>
          </aside>
        </div>
      </Container>
    </>
  );
}
