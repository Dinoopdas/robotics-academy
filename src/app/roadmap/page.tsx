import type { Metadata } from "next";
import Link from "next/link";

import { getProgressByCourse, getRoadmap } from "@/lib/queries";
import {
  Badge,
  Container,
  DifficultyBadge,
  LinkButton,
  Panel,
  ProgressBar,
} from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "The robotics roadmap",
  description:
    "Sixteen levels from absolute beginner to professional robotics engineering. Each level's outcome is the next one's prerequisite.",
};

const ACCENT_RING: Record<string, string> = {
  cyan: "border-signal/50 text-signal",
  violet: "border-violet/50 text-violet",
  emerald: "border-emerald/50 text-emerald",
  amber: "border-amber/50 text-amber",
  rose: "border-rose/50 text-rose",
};

export default async function RoadmapPage() {
  const [tracks, progressByCourse] = await Promise.all([getRoadmap(), getProgressByCourse()]);

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-14">
          <Badge tone="cyan">The path</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            The complete robotics roadmap
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-2">
            Sixteen levels, in order. Each one ends with a concrete capability that the next level
            assumes. Start at Level 0 with no prior knowledge, or jump to wherever you already are.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LinkButton href="/learn">Browse all courses</LinkButton>
            <LinkButton href="/skills" variant="secondary">
              See the skill tree
            </LinkButton>
          </div>
        </Container>
      </section>

      <Container size="wide" className="py-14">
        <ol className="relative space-y-4">
          {/* Spine connecting the levels */}
          <span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-[27px] hidden w-px bg-line md:block"
          />

          {tracks.map((track) => {
            const published = track.courses.filter((course) => course.published);
            const planned = track.courses.filter((course) => !course.published);
            const lessonTotal = published.reduce((sum, c) => sum + c._count.lessons, 0);

            const completed = progressByCourse
              ? published.reduce((sum, c) => sum + (progressByCourse.get(c.id) ?? 0), 0)
              : 0;
            const percent = lessonTotal === 0 ? 0 : Math.round((completed / lessonTotal) * 100);

            return (
              <li key={track.id} id={`level-${track.level}`} className="relative scroll-mt-20">
                <div className="flex gap-4">
                  <div
                    className={`relative z-10 hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 bg-surface-1 md:flex ${
                      ACCENT_RING[track.accent] ?? ACCENT_RING.cyan
                    }`}
                  >
                    <span className="font-mono text-lg font-bold">{track.level}</span>
                  </div>

                  <Panel className="min-w-0 flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="label-tech md:hidden">Level {track.level}</p>
                        <h2 className="text-xl font-semibold">{track.title}</h2>
                        <p className="mt-0.5 text-sm text-text-3">{track.subtitle}</p>
                      </div>
                      {lessonTotal > 0 ? (
                        <Badge tone="emerald">{lessonTotal} lessons ready</Badge>
                      ) : (
                        <Badge tone="amber">Curriculum being written</Badge>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-text-2">{track.description}</p>

                    <p className="mt-3 rounded-lg border-l-2 border-l-signal bg-signal-soft/30 px-3 py-2 text-sm">
                      <span className="label-tech text-signal">You will be able to</span>
                      <span className="mt-0.5 block text-text-1">{track.outcome}</span>
                    </p>

                    {progressByCourse && lessonTotal > 0 ? (
                      <div className="mt-4">
                        <ProgressBar value={percent} showLabel size="sm" />
                      </div>
                    ) : null}

                    {published.length > 0 ? (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {published.map((course) => {
                          const done = progressByCourse?.get(course.id) ?? 0;
                          return (
                            <Link
                              key={course.id}
                              href={`/learn/${course.slug}`}
                              className="group rounded-lg border border-line bg-surface-2 px-3.5 py-3 transition hover:border-signal/50"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-medium text-text-1 group-hover:text-signal">
                                  {course.title}
                                </span>
                                <DifficultyBadge difficulty={course.difficulty} />
                              </div>
                              <p className="mt-1 font-mono text-[11px] text-text-3">
                                {course._count.modules} modules · {course._count.lessons} lessons
                                {progressByCourse && done > 0 ? ` · ${done} done` : ""}
                              </p>
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}

                    {planned.length > 0 ? (
                      <div className="mt-4 border-t border-line pt-3">
                        <p className="label-tech mb-2">Planned for this level</p>
                        <div className="flex flex-wrap gap-2">
                          {planned.map((course) => (
                            <Link
                              key={course.id}
                              href={`/learn/${course.slug}`}
                              className="rounded-full border border-dashed border-line px-3 py-1 text-xs text-text-3 transition hover:border-amber/50 hover:text-amber"
                            >
                              {course.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </Panel>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </>
  );
}
