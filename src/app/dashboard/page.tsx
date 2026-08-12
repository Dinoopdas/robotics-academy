import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireUserPage } from "@/lib/auth";
import { getRecommendation, getSkillTree } from "@/lib/queries";
import {
  Badge,
  Container,
  EmptyState,
  LinkButton,
  Panel,
  ProgressBar,
  SectionHeading,
  Stat,
} from "@/components/ui/primitives";
import { SignOutButton } from "@/components/site/sign-out-button";

export const metadata: Metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default async function DashboardPage() {
  const session = await requireUserPage("/dashboard");

  const [
    user,
    completedLessons,
    completedProjects,
    quizAttempts,
    studyDays,
    achievements,
    bookmarks,
    recommendation,
    skills,
    courses,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true, goal: true, currentStreak: true, longestStreak: true, createdAt: true },
    }),
    prisma.lessonProgress.count({ where: { userId: session.id, status: "COMPLETED" } }),
    prisma.projectProgress.count({ where: { userId: session.id, status: "COMPLETED" } }),
    prisma.quizAttempt.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { quiz: { select: { title: true, lesson: { select: { slug: true, course: { select: { slug: true } } } } } } },
    }),
    prisma.studyDay.findMany({
      where: { userId: session.id },
      orderBy: { day: "desc" },
      take: 60,
    }),
    prisma.userAchievement.findMany({
      where: { userId: session.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.bookmark.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    getRecommendation(),
    getSkillTree(),
    prisma.course.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        _count: { select: { lessons: true } },
        track: { select: { level: true } },
      },
      orderBy: { track: { level: "asc" } },
    }),
  ]);

  if (!user) return null;

  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId: session.id, status: "COMPLETED" },
    select: { lesson: { select: { courseId: true } } },
  });

  const doneByCourse = new Map<string, number>();
  for (const row of progressRows) {
    doneByCourse.set(row.lesson.courseId, (doneByCourse.get(row.lesson.courseId) ?? 0) + 1);
  }

  const activeCourses = courses
    .map((course) => ({
      ...course,
      done: doneByCourse.get(course.id) ?? 0,
      percent:
        course._count.lessons === 0
          ? 0
          : Math.round(((doneByCourse.get(course.id) ?? 0) / course._count.lessons) * 100),
    }))
    .filter((course) => course.done > 0)
    .sort((a, b) => b.percent - a.percent);

  const totalSeconds = studyDays.reduce((sum, day) => sum + day.seconds, 0);
  const bestQuiz = await prisma.quizAttempt.findFirst({
    where: { userId: session.id },
    orderBy: { score: "desc" },
    select: { score: true },
  });

  const topSkills = skills.filter((skill) => skill.progress > 0).slice(0, 6);

  return (
    <Container size="wide" className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-tech">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          {user.goal ? (
            <p className="mt-1.5 text-text-2">
              Your goal: <span className="text-text-1">{user.goal}</span>
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {session.role === "ADMIN" ? (
            <LinkButton href="/admin" variant="secondary" size="sm">
              Admin
            </LinkButton>
          ) : null}
          <SignOutButton />
        </div>
      </div>

      {recommendation ? (
        <Link
          href={recommendation.href}
          className="mt-6 flex items-center gap-4 rounded-panel border border-signal/40 bg-signal-soft/40 p-5 transition hover:border-signal"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal text-lg text-surface-0">
            →
          </span>
          <span className="min-w-0 flex-1">
            <span className="label-tech block text-signal">{recommendation.reason}</span>
            <span className="mt-0.5 block truncate text-lg font-medium text-text-1">
              {recommendation.title}
            </span>
            <span className="block truncate text-sm text-text-3">{recommendation.courseTitle}</span>
          </span>
        </Link>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Lessons complete" value={completedLessons} />
        <Stat label="Projects built" value={completedProjects} tone="emerald" />
        <Stat
          label="Current streak"
          value={`${user.currentStreak}d`}
          hint={`Best: ${user.longestStreak} day${user.longestStreak === 1 ? "" : "s"}`}
          tone="amber"
        />
        <Stat label="Time studied" value={formatDuration(totalSeconds)} tone="violet" />
        <Stat label="Best quiz score" value={bestQuiz ? `${bestQuiz.score}%` : "—"} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          <section>
            <SectionHeading
              title="Courses in progress"
              action={
                <LinkButton href="/learn" variant="ghost" size="sm">
                  All courses
                </LinkButton>
              }
            />
            {activeCourses.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="You have not started a course yet"
                  description="The roadmap starts at Level 0 and assumes no prior knowledge at all."
                  action={<LinkButton href="/learn/intro-to-robotics">Start Level 0</LinkButton>}
                />
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {activeCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/learn/${course.slug}`}
                    className="group block rounded-panel border border-line bg-surface-1 p-4 transition hover:border-signal/50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium text-text-1 group-hover:text-signal">
                        {course.title}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-text-3">
                        {course.done}/{course._count.lessons}
                      </span>
                    </div>
                    <ProgressBar
                      value={course.percent}
                      showLabel
                      size="sm"
                      className="mt-2.5"
                      tone={course.percent === 100 ? "emerald" : "signal"}
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {quizAttempts.length > 0 ? (
            <section>
              <SectionHeading title="Recent quiz attempts" />
              <div className="mt-5 divide-y divide-line rounded-panel border border-line">
                {quizAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center gap-4 px-4 py-3">
                    <span
                      className={`flex h-9 w-12 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold ${
                        attempt.passed
                          ? "bg-emerald-soft text-emerald"
                          : "bg-amber-soft text-amber"
                      }`}
                    >
                      {attempt.score}%
                    </span>
                    <div className="min-w-0 flex-1">
                      {attempt.quiz.lesson ? (
                        <Link
                          href={`/learn/${attempt.quiz.lesson.course.slug}/${attempt.quiz.lesson.slug}`}
                          className="truncate text-sm font-medium text-text-1 hover:text-signal"
                        >
                          {attempt.quiz.title}
                        </Link>
                      ) : (
                        <span className="truncate text-sm font-medium text-text-1">
                          {attempt.quiz.title}
                        </span>
                      )}
                      <p className="text-xs text-text-3">
                        {attempt.correct} of {attempt.total} correct ·{" "}
                        {attempt.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {bookmarks.length > 0 ? (
            <section>
              <SectionHeading title="Bookmarks" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {bookmarks.map((bookmark) => (
                  <Link
                    key={bookmark.id}
                    href={bookmark.url}
                    className="group rounded-panel border border-line bg-surface-1 p-4 transition hover:border-signal/50"
                  >
                    <Badge>{bookmark.kind}</Badge>
                    <p className="mt-2 font-medium text-text-1 group-hover:text-signal">
                      {bookmark.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Panel className="p-5">
            <p className="label-tech mb-3">Skill progress</p>
            {topSkills.length === 0 ? (
              <p className="text-sm text-text-3">
                Finish a lesson and your skill tree starts filling in.
              </p>
            ) : (
              <div className="space-y-3">
                {topSkills.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-sm text-text-2">{skill.name}</span>
                      <span className="font-mono text-xs text-text-3">{skill.progress}%</span>
                    </div>
                    <ProgressBar
                      value={skill.progress}
                      size="sm"
                      tone={skill.progress >= 100 ? "emerald" : "signal"}
                    />
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/skills"
              className="mt-4 inline-block text-sm font-medium text-signal hover:underline"
            >
              Full skill tree →
            </Link>
          </Panel>

          <Panel className="p-5">
            <p className="label-tech mb-3">Achievements</p>
            {achievements.length === 0 ? (
              <p className="text-sm text-text-3">
                None yet. Completing your first lesson earns “Powered On”.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {achievements.map((row) => (
                  <li key={row.id} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs ${
                        row.achievement.tier === "gold"
                          ? "bg-amber-soft text-amber"
                          : row.achievement.tier === "silver"
                            ? "bg-surface-3 text-text-2"
                            : "bg-signal-soft text-signal"
                      }`}
                    >
                      ★
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-1">{row.achievement.name}</p>
                      <p className="text-xs text-text-3">{row.achievement.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-5">
            <p className="label-tech mb-3">Study activity</p>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 40 }).map((_, index) => {
                const date = new Date();
                date.setUTCDate(date.getUTCDate() - (39 - index));
                const key = date.toISOString().slice(0, 10);
                const day = studyDays.find((d) => d.day === key);
                const intensity = !day
                  ? 0
                  : day.seconds > 1800
                    ? 3
                    : day.seconds > 600
                      ? 2
                      : 1;

                return (
                  <span
                    key={key}
                    title={`${key}: ${day ? formatDuration(day.seconds) : "no study"}`}
                    className={`aspect-square rounded-[3px] ${
                      ["bg-surface-3", "bg-signal/30", "bg-signal/60", "bg-signal"][intensity]
                    }`}
                  />
                );
              })}
            </div>
            <p className="mt-3 text-xs text-text-3">Last 40 days</p>
          </Panel>

          <Panel className="p-5">
            <p className="label-tech mb-2">Account</p>
            <p className="text-sm text-text-2">{user.email}</p>
            <p className="mt-1 text-xs text-text-3">
              Member since {user.createdAt.toLocaleDateString()}
            </p>
          </Panel>
        </aside>
      </div>
    </Container>
  );
}
