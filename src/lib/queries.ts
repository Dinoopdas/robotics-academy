import "server-only";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { parseStrings } from "@/lib/content/parse";

/**
 * Read helpers shared by several pages. Kept here rather than duplicated so
 * "how progress is computed" has exactly one definition.
 */

export interface CourseProgress {
  total: number;
  completed: number;
  percent: number;
}

/** Completed-lesson counts per course for the signed-in user, or null. */
export async function getProgressByCourse(): Promise<Map<string, number> | null> {
  const session = await getSession();
  if (!session) return null;

  const rows = await prisma.lessonProgress.findMany({
    where: { userId: session.id, status: "COMPLETED" },
    select: { lesson: { select: { courseId: true } } },
  });

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.lesson.courseId, (map.get(row.lesson.courseId) ?? 0) + 1);
  }
  return map;
}

export async function getCompletedLessonIds(): Promise<Set<string>> {
  const session = await getSession();
  if (!session) return new Set();

  const rows = await prisma.lessonProgress.findMany({
    where: { userId: session.id, status: "COMPLETED" },
    select: { lessonId: true },
  });
  return new Set(rows.map((row) => row.lessonId));
}

/** The roadmap: every track with its courses and lesson counts. */
export async function getRoadmap() {
  return prisma.track.findMany({
    orderBy: { level: "asc" },
    include: {
      courses: {
        orderBy: { position: "asc" },
        include: { _count: { select: { lessons: true, modules: true } } },
      },
    },
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      track: true,
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              estimatedMinutes: true,
              difficulty: true,
            },
          },
        },
      },
      _count: { select: { lessons: true } },
    },
  });
}

/**
 * A lesson plus the neighbours needed for prev/next navigation. Ordering is by
 * (module position, lesson position) so the sequence matches the syllabus even
 * though lesson positions restart within each module.
 */
export async function getLessonWithNeighbours(courseSlug: string, lessonSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      track: { select: { slug: true, title: true, level: true } },
      modules: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: { position: "asc" },
            select: { id: true, slug: true, title: true, position: true },
          },
        },
      },
    },
  });
  if (!course) return null;

  const ordered = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title })),
  );
  const index = ordered.findIndex((lesson) => lesson.slug === lessonSlug);
  if (index === -1) return null;

  const lesson = await prisma.lesson.findUnique({
    where: { courseId_slug: { courseId: course.id, slug: lessonSlug } },
    include: {
      module: { select: { title: true, slug: true } },
      quiz: {
        include: {
          questions: {
            orderBy: { position: "asc" },
            include: { answers: { orderBy: { position: "asc" } } },
          },
        },
      },
    },
  });
  if (!lesson) return null;

  return {
    course,
    lesson,
    outline: ordered,
    position: index,
    previous: index > 0 ? ordered[index - 1] : null,
    next: index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}

/**
 * Prerequisite status for a course — the data behind the "you are ready for
 * this" panel. Reports honestly when the learner is not signed in rather than
 * implying nothing is required.
 */
export async function getPrerequisiteStatus(prerequisiteSlugs: string[]) {
  if (prerequisiteSlugs.length === 0) return [];

  const courses = await prisma.course.findMany({
    where: { slug: { in: prerequisiteSlugs } },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      _count: { select: { lessons: true } },
    },
  });

  const progress = await getProgressByCourse();

  return courses.map((course) => {
    const completed = progress?.get(course.id) ?? 0;
    return {
      slug: course.slug,
      title: course.title,
      total: course._count.lessons,
      completed,
      done: course._count.lessons > 0 && completed >= course._count.lessons,
      known: progress !== null,
    };
  });
}

/** Skill tree nodes with the signed-in user's progress folded in. */
export async function getSkillTree() {
  const session = await getSession();

  const [skills, userSkills] = await Promise.all([
    prisma.skill.findMany({ orderBy: [{ tier: "asc" }, { name: "asc" }] }),
    session
      ? prisma.userSkill.findMany({
          where: { userId: session.id },
          select: { skillId: true, progress: true },
        })
      : Promise.resolve([]),
  ]);

  const progressById = new Map(userSkills.map((row) => [row.skillId, row.progress]));

  return skills.map((skill) => ({
    ...skill,
    parents: parseStrings(skill.parentSlugs),
    courses: parseStrings(skill.courseSlugs),
    progress: progressById.get(skill.id) ?? 0,
    signedIn: Boolean(session),
  }));
}

/**
 * Recommends what to study next.
 *
 * Prefers finishing something already started over starting something new,
 * because an abandoned half-finished course is the most common way people
 * stall. Falls back to the first lesson of the lowest-level published course
 * whose prerequisites are met.
 */
export async function getRecommendation() {
  const session = await getSession();

  if (session) {
    const inProgress = await prisma.lessonProgress.findFirst({
      where: { userId: session.id, status: "IN_PROGRESS" },
      orderBy: { lastViewedAt: "desc" },
      select: {
        lesson: {
          select: { slug: true, title: true, course: { select: { slug: true, title: true } } },
        },
      },
    });

    if (inProgress) {
      return {
        reason: "Continue where you left off",
        title: inProgress.lesson.title,
        courseTitle: inProgress.lesson.course.title,
        href: `/learn/${inProgress.lesson.course.slug}/${inProgress.lesson.slug}`,
      };
    }

    const completedIds = await getCompletedLessonIds();
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        id: { notIn: [...completedIds] },
        course: { published: true },
      },
      // Lesson `position` restarts at 0 in every module, so ordering by it
      // alone jumps to the next module's first lesson. Module position must
      // come first for the sequence to match the syllabus.
      orderBy: [
        { course: { track: { level: "asc" } } },
        { course: { position: "asc" } },
        { module: { position: "asc" } },
        { position: "asc" },
      ],
      select: {
        slug: true,
        title: true,
        course: { select: { slug: true, title: true } },
      },
    });

    if (nextLesson) {
      return {
        reason: completedIds.size === 0 ? "Start here" : "Recommended next",
        title: nextLesson.title,
        courseTitle: nextLesson.course.title,
        href: `/learn/${nextLesson.course.slug}/${nextLesson.slug}`,
      };
    }
  }

  const first = await prisma.lesson.findFirst({
    where: { course: { published: true } },
    orderBy: [
      { course: { track: { level: "asc" } } },
      { course: { position: "asc" } },
      { module: { position: "asc" } },
      { position: "asc" },
    ],
    select: { slug: true, title: true, course: { select: { slug: true, title: true } } },
  });

  if (!first) return null;

  return {
    reason: "Start here",
    title: first.title,
    courseTitle: first.course.title,
    href: `/learn/${first.course.slug}/${first.slug}`,
  };
}

/** Headline counts for the homepage. Real numbers, read from the database. */
export async function getPlatformStats() {
  const [lessons, projects, courses, glossaryTerms, simulations, challenges, tracks] =
    await Promise.all([
      prisma.lesson.count(),
      prisma.project.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.glossaryTerm.count(),
      prisma.simulation.count(),
      prisma.challenge.count(),
      prisma.track.count(),
    ]);

  return { lessons, projects, courses, glossaryTerms, simulations, challenges, tracks };
}
