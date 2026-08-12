import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/auth";
import { Badge, Breadcrumbs, Container, Panel } from "@/components/ui/primitives";
import { CourseEditor } from "@/components/admin/course-editor";

export const metadata: Metadata = {
  title: "Edit course",
  robots: { index: false, follow: false },
};

export default async function AdminCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireAdminPage(`/admin/courses/${slug}`);

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      track: { select: { level: true, title: true } },
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              published: true,
              estimatedMinutes: true,
              difficulty: true,
            },
          },
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <Container size="wide" className="py-8">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: course.title },
        ]}
      />

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="amber">Level {course.track.level}</Badge>
            <Badge tone={course.published ? "emerald" : "neutral"}>
              {course.published ? "Published" : "Unpublished"}
            </Badge>
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{course.title}</h1>

          <div className="mt-6">
            <CourseEditor
              courseId={course.id}
              title={course.title}
              subtitle={course.subtitle}
              description={course.description}
              difficulty={course.difficulty}
              published={course.published}
            />
          </div>

          <section className="mt-10">
            <h2 className="border-b border-line pb-2 text-lg font-semibold">Lessons</h2>

            {course.modules.length === 0 ? (
              <Panel className="mt-4 p-5">
                <p className="text-sm text-text-2">
                  This course has no modules yet. Content is authored in{" "}
                  <code className="rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-xs">
                    src/content/courses
                  </code>{" "}
                  and loaded with the seeder — adding whole modules here is intentionally not
                  supported, because a module without validated cross-references is how dead links
                  get into the curriculum.
                </p>
              </Panel>
            ) : (
              <div className="mt-4 space-y-5">
                {course.modules.map((module) => (
                  <div key={module.id}>
                    <p className="label-tech mb-2">{module.title}</p>
                    <div className="divide-y divide-line rounded-panel border border-line">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              lesson.published ? "bg-emerald" : "bg-amber"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text-1">
                              {lesson.title}
                            </p>
                            <p className="truncate font-mono text-[11px] text-text-3">
                              {lesson.slug} · {lesson.estimatedMinutes} min ·{" "}
                              {lesson.difficulty.toLowerCase()}
                            </p>
                          </div>
                          <Link
                            href={`/admin/lessons/${course.slug}/${lesson.slug}`}
                            className="shrink-0 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-2 transition hover:border-signal/50 hover:text-signal"
                          >
                            Edit
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Panel className="p-5">
            <p className="label-tech mb-2">Preview</p>
            <Link
              href={`/learn/${course.slug}`}
              className="text-sm text-signal hover:underline"
              target="_blank"
            >
              Open the public course page ↗
            </Link>
            <p className="mt-3 border-t border-line pt-3 text-xs text-text-3">
              Saving revalidates the public pages immediately, so a refresh shows the change.
            </p>
          </Panel>
        </aside>
      </div>
    </Container>
  );
}
