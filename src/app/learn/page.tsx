import type { Metadata } from "next";
import Link from "next/link";

import { getProgressByCourse, getRoadmap } from "@/lib/queries";
import {
  Badge,
  CardLink,
  Container,
  DifficultyBadge,
  EmptyState,
  LinkButton,
  ProgressBar,
} from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "All courses",
  description:
    "Every robotics course on the platform, organised by level — fundamentals, programming, electronics, sensors, kinematics, control, ROS 2, computer vision and industrial robotics.",
};

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; difficulty?: string }>;
}) {
  const params = await searchParams;
  const [tracks, progressByCourse] = await Promise.all([getRoadmap(), getProgressByCourse()]);

  const levelFilter = params.level !== undefined ? Number(params.level) : null;
  const difficultyFilter = params.difficulty ?? null;

  const visibleTracks = tracks.filter((track) => {
    if (levelFilter !== null && !Number.isNaN(levelFilter) && track.level !== levelFilter) {
      return false;
    }
    if (difficultyFilter) {
      return track.courses.some((course) => course.difficulty === difficultyFilter);
    }
    return true;
  });

  const hasFilter = levelFilter !== null || difficultyFilter !== null;

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-12">
          <Badge tone="cyan">Curriculum</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Courses</h1>
          <p className="mt-3 max-w-2xl text-lg text-text-2">
            Organised by roadmap level. Courses marked “being written” have a published outline but
            no lessons yet — they are shown so the path stays honest about its full scope.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link
              href="/learn"
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                hasFilter
                  ? "border-line bg-surface-1 text-text-2 hover:border-line-strong"
                  : "border-signal/50 bg-signal-soft text-signal"
              }`}
            >
              All levels
            </Link>
            {["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"].map((difficulty) => (
              <Link
                key={difficulty}
                href={`/learn?difficulty=${difficulty}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  difficultyFilter === difficulty
                    ? "border-signal/50 bg-signal-soft text-signal"
                    : "border-line bg-surface-1 text-text-2 hover:border-line-strong"
                }`}
              >
                {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container size="wide" className="py-12">
        {visibleTracks.length === 0 ? (
          <EmptyState
            title="No courses match that filter"
            description="Try a different level or difficulty, or browse the whole curriculum."
            action={<LinkButton href="/learn">Show all courses</LinkButton>}
          />
        ) : (
          <div className="space-y-12">
            {visibleTracks.map((track) => {
              const courses = difficultyFilter
                ? track.courses.filter((c) => c.difficulty === difficultyFilter)
                : track.courses;
              if (courses.length === 0) return null;

              return (
                <section key={track.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                    <div>
                      <p className="label-tech">Level {track.level}</p>
                      <h2 className="mt-0.5 text-xl font-semibold">{track.title}</h2>
                    </div>
                    <p className="max-w-md text-sm text-text-3">{track.subtitle}</p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => {
                      const done = progressByCourse?.get(course.id) ?? 0;
                      const total = course._count.lessons;
                      const percent = total === 0 ? 0 : Math.round((done / total) * 100);

                      return (
                        <CardLink
                          key={course.id}
                          href={`/learn/${course.slug}`}
                          className={`flex flex-col p-5 ${course.published ? "" : "border-dashed"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <DifficultyBadge difficulty={course.difficulty} />
                            {course.published ? null : <Badge tone="amber">Being written</Badge>}
                          </div>

                          <h3 className="mt-2.5 font-semibold text-text-1 group-hover:text-signal">
                            {course.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-text-2">
                            {course.subtitle}
                          </p>

                          <div className="mt-4 border-t border-line pt-3">
                            {course.published ? (
                              <>
                                <p className="font-mono text-xs text-text-3">
                                  {course._count.modules} modules · {total} lessons ·{" "}
                                  {Math.max(1, Math.round(course.estimatedMinutes / 60))} h
                                </p>
                                {progressByCourse && total > 0 ? (
                                  <ProgressBar
                                    value={percent}
                                    showLabel
                                    size="sm"
                                    className="mt-2"
                                    tone={percent === 100 ? "emerald" : "signal"}
                                  />
                                ) : null}
                              </>
                            ) : (
                              <p className="font-mono text-xs text-amber">
                                Outline published · lessons in progress
                              </p>
                            )}
                          </div>
                        </CardLink>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
