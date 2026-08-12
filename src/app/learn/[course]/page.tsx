import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import {
  getCompletedLessonIds,
  getCourseBySlug,
  getPrerequisiteStatus,
} from "@/lib/queries";
import { parseStrings } from "@/lib/content/parse";
import {
  Badge,
  Breadcrumbs,
  Container,
  DifficultyBadge,
  LinkButton,
  Panel,
  ProgressBar,
} from "@/components/ui/primitives";

export async function generateStaticParams() {
  const courses = await prisma.course.findMany({ select: { slug: true } });
  return courses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}): Promise<Metadata> {
  const { course: slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true, subtitle: true, description: true },
  });

  if (!course) return { title: "Course not found" };

  return {
    title: course.title,
    description: course.description.slice(0, 160),
    openGraph: {
      title: `${course.title} — Robotics Academy`,
      description: course.subtitle,
      type: "article",
    },
    alternates: { canonical: `/learn/${slug}` },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [completedIds, prerequisites] = await Promise.all([
    getCompletedLessonIds(),
    getPrerequisiteStatus(parseStrings(course.prerequisites)),
  ]);

  const allLessons = course.modules.flatMap((module) => module.lessons);
  const completedCount = allLessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const percent =
    allLessons.length === 0 ? 0 : Math.round((completedCount / allLessons.length) * 100);

  const nextLesson =
    allLessons.find((lesson) => !completedIds.has(lesson.id)) ?? allLessons[0] ?? null;

  const tags = parseStrings(course.tags);

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-10">
          <Breadcrumbs
            items={[
              { label: "Learn", href: "/learn" },
              { label: `Level ${course.track.level}`, href: `/roadmap#level-${course.track.level}` },
              { label: course.title },
            ]}
          />

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={course.difficulty} />
                {course.published ? null : <Badge tone="amber">Curriculum being written</Badge>}
                {tags.slice(0, 3).map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-2 text-lg text-text-2">{course.subtitle}</p>
              <p className="mt-4 max-w-2xl text-text-2">{course.description}</p>

              {course.published && nextLesson ? (
                <div className="mt-7 flex flex-wrap gap-3">
                  <LinkButton href={`/learn/${course.slug}/${nextLesson.slug}`} size="lg">
                    {completedCount > 0 ? "Continue course" : "Start course"}
                  </LinkButton>
                  <LinkButton href="/roadmap" variant="secondary" size="lg">
                    Back to roadmap
                  </LinkButton>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <Panel className="p-5">
                <p className="label-tech mb-3">Course at a glance</p>
                <dl className="space-y-2 text-sm">
                  {[
                    ["Level", `${course.track.level} — ${course.track.title}`],
                    ["Modules", String(course.modules.length)],
                    ["Lessons", String(course._count.lessons)],
                    [
                      "Estimated time",
                      course.estimatedMinutes > 0
                        ? `${Math.max(1, Math.round(course.estimatedMinutes / 60))} hours`
                        : "—",
                    ],
                  ].map(([term, value]) => (
                    <div key={term} className="flex justify-between gap-3">
                      <dt className="text-text-3">{term}</dt>
                      <dd className="text-right font-medium text-text-1">{value}</dd>
                    </div>
                  ))}
                </dl>

                {allLessons.length > 0 ? (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="label-tech mb-2">Your progress</p>
                    <ProgressBar
                      value={percent}
                      showLabel
                      tone={percent === 100 ? "emerald" : "signal"}
                    />
                    <p className="mt-1.5 text-xs text-text-3">
                      {completedCount} of {allLessons.length} lessons complete
                    </p>
                  </div>
                ) : null}
              </Panel>

              {prerequisites.length > 0 ? (
                <Panel className="p-5">
                  <p className="label-tech mb-3">Recommended prerequisites</p>
                  <ul className="space-y-2">
                    {prerequisites.map((prerequisite) => (
                      <li key={prerequisite.slug}>
                        <Link
                          href={`/learn/${prerequisite.slug}`}
                          className="flex items-center gap-2.5 text-sm transition hover:text-signal"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                              prerequisite.done
                                ? "border-emerald bg-emerald text-surface-0"
                                : "border-line-strong text-text-3"
                            }`}
                          >
                            {prerequisite.done ? "✓" : ""}
                          </span>
                          <span className="flex-1 text-text-2">{prerequisite.title}</span>
                          {prerequisite.known && prerequisite.total > 0 ? (
                            <span className="font-mono text-[11px] text-text-3">
                              {prerequisite.completed}/{prerequisite.total}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {!prerequisites[0]?.known ? (
                    <p className="mt-3 border-t border-line pt-3 text-xs text-text-3">
                      Sign in to see which of these you have already finished.
                    </p>
                  ) : null}
                </Panel>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <Container size="wide" className="py-12">
        {course.published && course.modules.length > 0 ? (
          <div className="space-y-8">
            {course.modules.map((module, moduleIndex) => (
              <section key={module.id}>
                <div className="flex items-baseline gap-3 border-b border-line pb-3">
                  <span className="font-mono text-sm font-semibold text-signal">
                    {String(moduleIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold">{module.title}</h2>
                    <p className="mt-0.5 text-sm text-text-3">{module.description}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-text-3">
                    {module.lessons.length} lessons
                  </span>
                </div>

                <ol className="mt-3 divide-y divide-line">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const done = completedIds.has(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/learn/${course.slug}/${lesson.slug}`}
                          className="group flex items-start gap-4 rounded-lg px-2 py-3.5 transition hover:bg-surface-2"
                        >
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] ${
                              done
                                ? "border-emerald bg-emerald text-surface-0"
                                : "border-line-strong text-text-3"
                            }`}
                          >
                            {done ? "✓" : lessonIndex + 1}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-text-1 group-hover:text-signal">
                              {lesson.title}
                            </span>
                            <span className="mt-0.5 block text-sm text-text-3">
                              {lesson.summary}
                            </span>
                          </span>

                          <span className="shrink-0 font-mono text-xs text-text-3">
                            {lesson.estimatedMinutes} min
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        ) : (
          <Panel className="bg-grid-fine p-8">
            <Badge tone="amber">Curriculum being written</Badge>
            <h2 className="mt-4 text-2xl font-semibold">This course is not ready yet</h2>
            <p className="mt-3 max-w-2xl text-text-2">
              The syllabus below is designed and the course appears on the roadmap so the path
              stays honest about its full scope — but the lessons have not been written. Rather
              than show empty pages dressed up as lessons, here is exactly what is coming.
            </p>

            <div className="mt-6 border-t border-line pt-5">
              <p className="label-tech mb-3">Planned syllabus</p>
              <p className="text-sm text-text-2">{course.description}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/learn" variant="secondary">
                Browse courses that are ready
              </LinkButton>
              <LinkButton href="/roadmap" variant="ghost">
                Back to the roadmap
              </LinkButton>
            </div>
          </Panel>
        )}
      </Container>
    </>
  );
}
