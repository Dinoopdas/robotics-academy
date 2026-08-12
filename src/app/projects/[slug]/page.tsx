import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import {
  parseHardware,
  parseProjectSections,
  parseSoftware,
  parseStrings,
} from "@/lib/content/parse";
import { PROJECT_SECTION_LABEL, PROJECT_SECTION_ORDER } from "@/lib/content/types";
import {
  Badge,
  Breadcrumbs,
  Container,
  DifficultyBadge,
  Panel,
} from "@/components/ui/primitives";
import { BlockList } from "@/components/lesson/blocks";
import { ProjectStatusControl } from "@/components/project/status-control";

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({ select: { slug: true } });
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { title: true, summary: true, difficulty: true },
  });

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary.slice(0, 160),
    openGraph: { title: `${project.title} — Robotics Academy`, description: project.summary },
    alternates: { canonical: `/projects/${slug}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { courses: { select: { slug: true, title: true } } },
  });
  if (!project) notFound();

  const session = await getSession();

  const progress = session
    ? await prisma.projectProgress.findUnique({
        where: { userId_projectId: { userId: session.id, projectId: project.id } },
        select: { status: true },
      })
    : null;

  const sections = parseProjectSections(project.blocks);
  const hardware = parseHardware(project.hardware);
  const software = parseSoftware(project.software);
  const tags = parseStrings(project.tags);
  const prerequisites = parseStrings(project.prerequisites);

  // Resolve prerequisite lesson slugs to real links, dropping any that no
  // longer exist rather than rendering a dead reference.
  const prerequisiteLessons = prerequisites.length
    ? await prisma.lesson.findMany({
        where: { slug: { in: prerequisites } },
        select: { slug: true, title: true, course: { select: { slug: true } } },
      })
    : [];

  const ordered = PROJECT_SECTION_ORDER.map((id) =>
    sections.find((section) => section.id === id),
  ).filter((section): section is NonNullable<typeof section> => Boolean(section));

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-10">
          <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: project.title }]} />

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={project.difficulty} />
                <Badge>{project.category}</Badge>
                <Badge>~{project.estimatedHours} hours</Badge>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {project.title}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-text-2">{project.summary}</p>

              {tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-line bg-surface-1 px-2 py-0.5 font-mono text-[11px] text-text-3"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-7">
                <ProjectStatusControl
                  projectId={project.id}
                  status={progress?.status ?? null}
                  signedIn={Boolean(session)}
                  returnTo={`/projects/${project.slug}`}
                />
              </div>
            </div>

            <nav aria-label="Project sections">
              <Panel className="p-5">
                <p className="label-tech mb-3">Sections</p>
                <ol className="space-y-1">
                  {ordered.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="flex items-baseline gap-2.5 rounded-md px-2 py-1 text-sm text-text-2 transition hover:bg-surface-2 hover:text-signal"
                      >
                        <span className="font-mono text-[11px] text-text-3">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{PROJECT_SECTION_LABEL[section.id]}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </Panel>
            </nav>
          </div>
        </Container>
      </section>

      <Container size="wide" className="py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0 space-y-14">
            {ordered.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <div className="mb-6 flex items-baseline gap-3 border-b border-line pb-3">
                  <span className="font-mono text-sm font-semibold text-signal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {PROJECT_SECTION_LABEL[section.id]}
                  </h2>
                </div>
                <BlockList blocks={section.blocks} />
              </section>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {prerequisiteLessons.length > 0 ? (
              <Panel className="p-5">
                <p className="label-tech mb-3">Required knowledge</p>
                <ul className="space-y-2">
                  {prerequisiteLessons.map((lesson) => (
                    <li key={lesson.slug}>
                      <Link
                        href={`/learn/${lesson.course.slug}/${lesson.slug}`}
                        className="flex gap-2 text-sm text-text-2 transition hover:text-signal"
                      >
                        <span aria-hidden="true" className="text-signal">→</span>
                        <span className="flex-1">{lesson.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}

            <Panel className="p-5">
              <p className="label-tech mb-3">Hardware</p>
              <ul className="space-y-2.5">
                {hardware.map((item) => (
                  <li key={item.name} className="text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-text-1">{item.name}</span>
                      <span className="shrink-0 font-mono text-xs text-text-3">×{item.qty}</span>
                    </div>
                    {item.note ? <p className="mt-0.5 text-xs text-text-3">{item.note}</p> : null}
                    {item.optional ? (
                      <p className="mt-0.5 font-mono text-[10px] text-amber">optional</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="p-5">
              <p className="label-tech mb-3">Software</p>
              <ul className="space-y-2.5">
                {software.map((item) => (
                  <li key={item.name} className="text-sm">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-signal hover:underline"
                      >
                        {item.name} ↗
                      </a>
                    ) : (
                      <span className="text-text-1">{item.name}</span>
                    )}
                    {item.note ? <p className="mt-0.5 text-xs text-text-3">{item.note}</p> : null}
                  </li>
                ))}
              </ul>
            </Panel>

            {project.courses.length > 0 ? (
              <Panel className="p-5">
                <p className="label-tech mb-3">Related courses</p>
                <ul className="space-y-2">
                  {project.courses.map((course) => (
                    <li key={course.slug}>
                      <Link
                        href={`/learn/${course.slug}`}
                        className="text-sm text-text-2 transition hover:text-signal"
                      >
                        {course.title}
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
