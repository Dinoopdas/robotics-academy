import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/auth";
import { Badge, Container, Panel, Stat } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireAdminPage("/admin");

  const [tracks, counts] = await Promise.all([
    prisma.track.findMany({
      orderBy: { level: "asc" },
      include: {
        courses: {
          orderBy: { position: "asc" },
          include: { _count: { select: { lessons: true, modules: true } } },
        },
      },
    }),
    Promise.all([
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.project.count(),
      prisma.user.count(),
      prisma.searchDoc.count(),
      prisma.quizAttempt.count(),
    ]),
  ]);

  const [courseCount, lessonCount, projectCount, userCount, searchDocCount, attemptCount] = counts;

  return (
    <Container size="wide" className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="amber">Admin</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Content management</h1>
          <p className="mt-1.5 max-w-2xl text-text-2">
            Edit published content without a deploy. Changes write to the database and re-index
            search immediately.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-signal hover:underline">
          ← Back to dashboard
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Courses" value={courseCount} />
        <Stat label="Lessons" value={lessonCount} />
        <Stat label="Projects" value={projectCount} tone="emerald" />
        <Stat label="Users" value={userCount} tone="violet" />
        <Stat label="Search docs" value={searchDocCount} />
        <Stat label="Quiz attempts" value={attemptCount} tone="amber" />
      </div>

      <Panel className="mt-6 p-5">
        <p className="label-tech mb-2">How content works here</p>
        <p className="text-sm text-text-2">
          The curriculum is authored as typed TypeScript in{" "}
          <code className="rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-xs">
            src/content
          </code>{" "}
          and loaded by <code className="rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-xs">npm run db:seed</code>, which
          validates every cross-reference before writing. This admin area edits the database rows
          directly — the right tool for correcting a sentence without a deploy. Re-running the
          seeder resets content to the files, so move anything you want to keep back into{" "}
          <code className="rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-xs">src/content</code>.
        </p>
      </Panel>

      <div className="mt-10 space-y-8">
        {tracks.map((track) => (
          <section key={track.id}>
            <div className="flex items-baseline gap-3 border-b border-line pb-2">
              <span className="font-mono text-sm font-semibold text-signal">
                L{track.level}
              </span>
              <h2 className="text-lg font-semibold">{track.title}</h2>
              <span className="ml-auto font-mono text-xs text-text-3">
                {track.courses.length} courses
              </span>
            </div>

            <div className="mt-3 divide-y divide-line rounded-panel border border-line">
              {track.courses.map((course) => (
                <div key={course.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      course.published ? "bg-emerald" : "bg-amber"
                    }`}
                    title={course.published ? "Published" : "Unpublished"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text-1">{course.title}</p>
                    <p className="truncate text-xs text-text-3">
                      {course._count.modules} modules · {course._count.lessons} lessons ·{" "}
                      {course.difficulty.toLowerCase()}
                    </p>
                  </div>
                  <Link
                    href={`/admin/courses/${course.slug}`}
                    className="shrink-0 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-2 transition hover:border-signal/50 hover:text-signal"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
