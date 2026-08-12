"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { blocksToSearchText, normaliseText, parseBlocks } from "@/lib/content/parse";
import type { LessonBlock } from "@/lib/content/types";

export interface AdminState {
  ok?: boolean;
  error?: string;
  message?: string;
}

/**
 * Keeps the search index in step with an edited lesson.
 *
 * The index is denormalised, so an edit that does not update it leaves search
 * returning the old text — a bug that is invisible on the page you just
 * changed and only shows up later.
 */
async function reindexLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { slug: true, title: true, tags: true } } },
  });
  if (!lesson) return;

  const blocks = parseBlocks(lesson.blocks);
  const ref = `${lesson.course.slug}/${lesson.slug}`;

  await prisma.searchDoc.upsert({
    where: { kind_ref: { kind: "lesson", ref } },
    create: {
      kind: "lesson",
      ref,
      url: `/learn/${lesson.course.slug}/${lesson.slug}`,
      title: lesson.title,
      summary: lesson.summary,
      body: normaliseText(`${lesson.summary} ${blocksToSearchText(blocks)}`),
      keywords: normaliseText(lesson.course.title),
      difficulty: lesson.difficulty,
      weight: 70,
    },
    update: {
      url: `/learn/${lesson.course.slug}/${lesson.slug}`,
      title: lesson.title,
      summary: lesson.summary,
      body: normaliseText(`${lesson.summary} ${blocksToSearchText(blocks)}`),
      difficulty: lesson.difficulty,
    },
  });
}

const lessonSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().min(10).max(500),
  estimatedMinutes: z.coerce.number().int().min(1).max(240),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"]),
  published: z.coerce.boolean(),
  objectives: z.string(),
  blocks: z.string(),
});

export async function updateLessonAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not authorised." };
  }

  const parsed = lessonSchema.safeParse({
    lessonId: formData.get("lessonId"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    difficulty: formData.get("difficulty"),
    published: formData.get("published") === "on",
    objectives: formData.get("objectives") ?? "[]",
    blocks: formData.get("blocks") ?? "[]",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields and try again." };
  }

  // Blocks are edited as raw JSON. Validate before writing, or one bad paste
  // breaks the lesson page for every reader.
  let blocks: LessonBlock[];
  let objectives: string[];
  try {
    blocks = JSON.parse(parsed.data.blocks);
    if (!Array.isArray(blocks)) throw new Error("Blocks must be a JSON array.");
    const invalid = blocks.findIndex((block) => !block || typeof block.type !== "string");
    if (invalid !== -1) throw new Error(`Block ${invalid + 1} has no "type" field.`);
  } catch (error) {
    return { error: `Blocks JSON: ${error instanceof Error ? error.message : "invalid JSON"}` };
  }

  try {
    objectives = JSON.parse(parsed.data.objectives);
    if (!Array.isArray(objectives)) throw new Error("Objectives must be a JSON array of strings.");
  } catch (error) {
    return { error: `Objectives JSON: ${error instanceof Error ? error.message : "invalid JSON"}` };
  }

  const lesson = await prisma.lesson.update({
    where: { id: parsed.data.lessonId },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      estimatedMinutes: parsed.data.estimatedMinutes,
      difficulty: parsed.data.difficulty,
      published: parsed.data.published,
      objectives: JSON.stringify(objectives),
      blocks: JSON.stringify(blocks),
    },
    select: { id: true, slug: true, course: { select: { slug: true } } },
  });

  await reindexLesson(lesson.id);

  revalidatePath(`/learn/${lesson.course.slug}/${lesson.slug}`);
  revalidatePath(`/learn/${lesson.course.slug}`);
  revalidatePath("/admin");

  return { ok: true, message: `Saved. ${blocks.length} blocks, search index updated.` };
}

const courseSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().trim().min(3).max(200),
  subtitle: z.string().trim().min(3).max(300),
  description: z.string().trim().min(10).max(2000),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"]),
  published: z.coerce.boolean(),
});

export async function updateCourseAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not authorised." };
  }

  const parsed = courseSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    description: formData.get("description"),
    difficulty: formData.get("difficulty"),
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields and try again." };
  }

  const course = await prisma.course.update({
    where: { id: parsed.data.courseId },
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      published: parsed.data.published,
    },
    select: { id: true, slug: true, title: true, subtitle: true, description: true, difficulty: true },
  });

  await prisma.searchDoc.upsert({
    where: { kind_ref: { kind: "course", ref: course.slug } },
    create: {
      kind: "course",
      ref: course.slug,
      url: `/learn/${course.slug}`,
      title: course.title,
      summary: course.subtitle,
      body: normaliseText(course.description),
      keywords: "",
      difficulty: course.difficulty,
      weight: parsed.data.published ? 90 : 20,
    },
    update: {
      title: course.title,
      summary: course.subtitle,
      body: normaliseText(course.description),
      difficulty: course.difficulty,
      weight: parsed.data.published ? 90 : 20,
    },
  });

  revalidatePath(`/learn/${course.slug}`);
  revalidatePath("/learn");
  revalidatePath("/roadmap");
  revalidatePath("/admin");

  return { ok: true, message: "Course saved." };
}

export async function reorderLessonAction(lessonId: string, direction: "up" | "down") {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, position: true, moduleId: true, course: { select: { slug: true } } },
  });
  if (!lesson) return { ok: false as const, error: "Lesson not found." };

  const neighbour = await prisma.lesson.findFirst({
    where: {
      moduleId: lesson.moduleId,
      position: direction === "up" ? { lt: lesson.position } : { gt: lesson.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!neighbour) return { ok: false as const, error: "Already at the end." };

  // Swap through a temporary position: (moduleId, position) is effectively
  // unique in practice and a direct swap would collide mid-transaction.
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lesson.id }, data: { position: -1 } }),
    prisma.lesson.update({ where: { id: neighbour.id }, data: { position: lesson.position } }),
    prisma.lesson.update({ where: { id: lesson.id }, data: { position: neighbour.position } }),
  ]);

  revalidatePath(`/learn/${lesson.course.slug}`);
  revalidatePath("/admin");

  return { ok: true as const };
}
