import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { parseStrings } from "@/lib/content/parse";
import { DIFFICULTIES, DIFFICULTY_LABEL } from "@/lib/enums";
import {
  Badge,
  CardLink,
  Container,
  DifficultyBadge,
  EmptyState,
  LinkButton,
} from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Robotics projects",
  description:
    "Build real robots. Every project includes architecture, theory, step-by-step build, annotated code, testing, troubleshooting and an extension challenge.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string }>;
}) {
  const params = await searchParams;
  const difficultyFilter = params.difficulty ?? null;

  const session = await getSession();

  const [projects, progress] = await Promise.all([
    prisma.project.findMany({
      where: difficultyFilter ? { difficulty: difficultyFilter } : undefined,
      orderBy: [{ position: "asc" }],
    }),
    session
      ? prisma.projectProgress.findMany({
          where: { userId: session.id },
          select: { projectId: true, status: true },
        })
      : Promise.resolve([]),
  ]);

  const statusById = new Map(progress.map((row) => [row.projectId, row.status]));

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-12">
          <Badge tone="emerald">Learning by doing</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-3 max-w-2xl text-lg text-text-2">
            Every project follows the same nine sections, so once you have done one you know
            exactly where to look in the next. The troubleshooting sections are written from the
            failures that actually happen.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/projects"
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                difficultyFilter
                  ? "border-line bg-surface-1 text-text-2 hover:border-line-strong"
                  : "border-signal/50 bg-signal-soft text-signal"
              }`}
            >
              All levels
            </Link>
            {DIFFICULTIES.map((difficulty) => (
              <Link
                key={difficulty}
                href={`/projects?difficulty=${difficulty}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  difficultyFilter === difficulty
                    ? "border-signal/50 bg-signal-soft text-signal"
                    : "border-line bg-surface-1 text-text-2 hover:border-line-strong"
                }`}
              >
                {DIFFICULTY_LABEL[difficulty]}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container size="wide" className="py-12">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects at that level yet"
            description="More are being written. In the meantime, try another difficulty."
            action={<LinkButton href="/projects">Show all projects</LinkButton>}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const tags = parseStrings(project.tags);
              const status = statusById.get(project.id);

              return (
                <CardLink
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="flex flex-col p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={project.difficulty} />
                    {status === "COMPLETED" ? <Badge tone="emerald">Completed</Badge> : null}
                    {status === "IN_PROGRESS" ? <Badge tone="cyan">In progress</Badge> : null}
                  </div>

                  <h2 className="mt-3 text-lg font-semibold text-text-1 group-hover:text-signal">
                    {project.title}
                  </h2>
                  <p className="mt-1.5 flex-1 text-sm text-text-2">{project.summary}</p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-text-3"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-text-3">
                      ~{project.estimatedHours} h
                    </span>
                  </div>
                </CardLink>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
