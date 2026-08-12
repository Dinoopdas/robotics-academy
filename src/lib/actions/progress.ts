"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { parseStrings } from "@/lib/content/parse";

/** UTC day key, so streaks do not shift when a learner travels. */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const b = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((b - a) / 86_400_000);
}

/**
 * Records study activity and maintains the streak.
 *
 * Streak rules: same day is a no-op, exactly one day later extends it, and any
 * larger gap resets to 1. Deliberately not "any activity in the last 48 hours"
 * — a streak the learner cannot predict is not motivating.
 */
async function touchStudyDay(userId: string, seconds: number, lessonCompleted: boolean) {
  const day = todayKey();

  await prisma.studyDay.upsert({
    where: { userId_day: { userId, day } },
    create: {
      userId,
      day,
      seconds: Math.max(0, seconds),
      lessonsCompleted: lessonCompleted ? 1 : 0,
    },
    update: {
      seconds: { increment: Math.max(0, seconds) },
      lessonsCompleted: { increment: lessonCompleted ? 1 : 0 },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveOn: true, currentStreak: true, longestStreak: true },
  });
  if (!user) return;

  const now = new Date();
  let streak = user.currentStreak;

  if (!user.lastActiveOn) {
    streak = 1;
  } else {
    const gap = daysBetween(user.lastActiveOn, now);
    if (gap === 0) return; // already counted today; leave lastActiveOn alone
    streak = gap === 1 ? streak + 1 : 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastActiveOn: now,
      currentStreak: streak,
      longestStreak: Math.max(streak, user.longestStreak),
    },
  });
}

const completeSchema = z.object({
  lessonId: z.string().min(1),
  seconds: z.number().int().min(0).max(7200),
});

export async function completeLessonAction(lessonId: string, seconds = 0) {
  const session = await requireUser();
  const parsed = completeSchema.safeParse({ lessonId, seconds });
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsed.data.lessonId },
    select: { id: true, courseId: true, course: { select: { slug: true } } },
  });
  if (!lesson) return { ok: false as const, error: "That lesson no longer exists." };

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.id, lessonId: lesson.id } },
    select: { status: true },
  });
  const alreadyDone = existing?.status === "COMPLETED";

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.id, lessonId: lesson.id } },
    create: {
      userId: session.id,
      lessonId: lesson.id,
      status: "COMPLETED",
      completedAt: new Date(),
      secondsSpent: parsed.data.seconds,
    },
    update: {
      status: "COMPLETED",
      completedAt: existing ? undefined : new Date(),
      secondsSpent: { increment: parsed.data.seconds },
      lastViewedAt: new Date(),
    },
  });

  await touchStudyDay(session.id, parsed.data.seconds, !alreadyDone);
  await recomputeSkills(session.id);
  await awardAchievements(session.id);

  revalidatePath(`/learn/${lesson.course.slug}`);
  revalidatePath("/dashboard");

  return { ok: true as const };
}

export async function uncompleteLessonAction(lessonId: string) {
  const session = await requireUser();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, course: { select: { slug: true } } },
  });
  if (!lesson) return { ok: false as const, error: "That lesson no longer exists." };

  await prisma.lessonProgress.updateMany({
    where: { userId: session.id, lessonId: lesson.id },
    data: { status: "IN_PROGRESS", completedAt: null },
  });

  await recomputeSkills(session.id);
  revalidatePath(`/learn/${lesson.course.slug}`);
  revalidatePath("/dashboard");

  return { ok: true as const };
}

export async function markLessonViewedAction(lessonId: string) {
  const session = await requireUser();

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.id, lessonId } },
    create: { userId: session.id, lessonId, status: "IN_PROGRESS" },
    update: { lastViewedAt: new Date() },
  });

  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

export async function submitQuizAction(
  quizId: string,
  responses: Record<string, string[]>,
) {
  const session = await requireUser();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { include: { answers: true }, orderBy: { position: "asc" } },
      lesson: { select: { id: true, course: { select: { slug: true } } } },
    },
  });
  if (!quiz) return { ok: false as const, error: "That quiz no longer exists." };

  // Grade on the server against the database. The client is told which answers
  // were right only after submitting, so the correct answers are never present
  // in the page before the attempt is made.
  let correct = 0;
  const perQuestion: Record<string, { correct: boolean; correctIds: string[] }> = {};

  for (const question of quiz.questions) {
    const correctIds = question.answers.filter((a) => a.isCorrect).map((a) => a.id);
    const given = responses[question.id] ?? [];

    const isCorrect =
      given.length === correctIds.length && correctIds.every((id) => given.includes(id));

    if (isCorrect) correct += 1;
    perQuestion[question.id] = { correct: isCorrect, correctIds };
  }

  const total = quiz.questions.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.create({
    data: {
      userId: session.id,
      quizId: quiz.id,
      score,
      correct,
      total,
      passed,
      responses: JSON.stringify(responses),
    },
  });

  await touchStudyDay(session.id, 0, false);
  await awardAchievements(session.id);

  if (quiz.lesson) revalidatePath(`/learn/${quiz.lesson.course.slug}`);
  revalidatePath("/dashboard");

  return { ok: true as const, score, correct, total, passed, perQuestion };
}

// ---------------------------------------------------------------------------
// Projects and bookmarks
// ---------------------------------------------------------------------------

export async function setProjectStatusAction(projectId: string, status: "IN_PROGRESS" | "COMPLETED") {
  const session = await requireUser();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, slug: true },
  });
  if (!project) return { ok: false as const, error: "That project no longer exists." };

  await prisma.projectProgress.upsert({
    where: { userId_projectId: { userId: session.id, projectId: project.id } },
    create: {
      userId: session.id,
      projectId: project.id,
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    update: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  await touchStudyDay(session.id, 0, false);
  await awardAchievements(session.id);

  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/dashboard");

  return { ok: true as const };
}

export async function toggleBookmarkAction(input: {
  kind: string;
  ref: string;
  title: string;
  url: string;
}) {
  const session = await requireUser();

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_kind_ref: { userId: session.id, kind: input.kind, ref: input.ref },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard");
    return { ok: true as const, bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId: session.id, ...input } });
  revalidatePath("/dashboard");
  return { ok: true as const, bookmarked: true };
}

// ---------------------------------------------------------------------------
// Derived state
// ---------------------------------------------------------------------------

/**
 * Skill progress is derived from course completion rather than tracked
 * separately, so it can never disagree with the lessons the learner has
 * actually finished.
 */
export async function recomputeSkills(userId: string) {
  const skills = await prisma.skill.findMany({
    select: { id: true, courseSlugs: true },
  });

  const completed = await prisma.lessonProgress.findMany({
    where: { userId, status: "COMPLETED" },
    select: { lesson: { select: { courseId: true } } },
  });

  const completedByCourse = new Map<string, number>();
  for (const row of completed) {
    const courseId = row.lesson.courseId;
    completedByCourse.set(courseId, (completedByCourse.get(courseId) ?? 0) + 1);
  }

  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { id: true, slug: true, _count: { select: { lessons: true } } },
  });
  const courseBySlug = new Map(courses.map((c) => [c.slug, c]));

  for (const skill of skills) {
    const slugs = parseStrings(skill.courseSlugs);
    const relevant = slugs
      .map((slug) => courseBySlug.get(slug))
      .filter((course): course is NonNullable<typeof course> => Boolean(course));

    if (relevant.length === 0) continue;

    const totalLessons = relevant.reduce((sum, c) => sum + c._count.lessons, 0);
    const doneLessons = relevant.reduce((sum, c) => sum + (completedByCourse.get(c.id) ?? 0), 0);
    const progress = totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100);

    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId: skill.id } },
      create: {
        userId,
        skillId: skill.id,
        progress,
        unlockedAt: progress >= 100 ? new Date() : null,
      },
      update: {
        progress,
        unlockedAt: progress >= 100 ? new Date() : null,
      },
    });
  }
}

/** Evaluates every achievement's criteria and grants any newly met ones. */
export async function awardAchievements(userId: string): Promise<string[]> {
  const [achievements, earned] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const earnedIds = new Set(earned.map((row) => row.achievementId));
  const pending = achievements.filter((a) => !earnedIds.has(a.id));
  if (pending.length === 0) return [];

  const [lessonsDone, projectsDone, bestQuiz, user] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId, status: "COMPLETED" } }),
    prisma.projectProgress.count({ where: { userId, status: "COMPLETED" } }),
    prisma.quizAttempt.findFirst({
      where: { userId },
      orderBy: { score: "desc" },
      select: { score: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true } }),
  ]);

  const newlyEarned: string[] = [];

  for (const achievement of pending) {
    let met = false;

    switch (achievement.criteriaKind) {
      case "LESSON_COUNT":
        met = lessonsDone >= achievement.threshold;
        break;
      case "PROJECT_COUNT":
        met = projectsDone >= achievement.threshold;
        break;
      case "QUIZ_SCORE":
        met = (bestQuiz?.score ?? 0) >= achievement.threshold;
        break;
      case "STREAK":
        met = (user?.currentStreak ?? 0) >= achievement.threshold;
        break;
      case "COURSE_COMPLETE": {
        if (!achievement.criteriaRef) break;
        const course = await prisma.course.findUnique({
          where: { slug: achievement.criteriaRef },
          select: { id: true, _count: { select: { lessons: true } } },
        });
        if (!course || course._count.lessons === 0) break;
        const done = await prisma.lessonProgress.count({
          where: { userId, status: "COMPLETED", lesson: { courseId: course.id } },
        });
        met = done >= course._count.lessons;
        break;
      }
      case "TRACK_COMPLETE": {
        if (!achievement.criteriaRef) break;
        const track = await prisma.track.findUnique({
          where: { slug: achievement.criteriaRef },
          select: { courses: { where: { published: true }, select: { id: true } } },
        });
        if (!track || track.courses.length === 0) break;
        const courseIds = track.courses.map((c) => c.id);
        const totalLessons = await prisma.lesson.count({ where: { courseId: { in: courseIds } } });
        if (totalLessons === 0) break;
        const done = await prisma.lessonProgress.count({
          where: { userId, status: "COMPLETED", lesson: { courseId: { in: courseIds } } },
        });
        met = done >= totalLessons;
        break;
      }
    }

    if (met) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      newlyEarned.push(achievement.name);
    }
  }

  return newlyEarned;
}
