import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import {
  achievements,
  challenges,
  courses,
  glossary,
  projects,
  simulations,
  skills,
  tracks,
  troubleshooting,
  validateContent,
} from "../src/content";
import { blocksToSearchText, estimateMinutes, normaliseText } from "../src/lib/content/parse";
import { resolveDatabaseUrl } from "../src/lib/database-url";
import type { LessonSource } from "../src/content/schema";

const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

const json = (value: unknown) => JSON.stringify(value ?? []);

/** Deterministic slug for a lesson's quiz, so re-seeding is idempotent. */
const quizSlug = (courseSlug: string, lessonSlug: string) => `${courseSlug}--${lessonSlug}`;

async function main() {
  console.log("Validating content cross-references…");
  const problems = validateContent();
  if (problems.length > 0) {
    console.error(`\n${problems.length} content problem(s) found:\n`);
    for (const problem of problems) console.error(`  • ${problem}`);
    console.error("\nRefusing to seed a corpus with broken references.");
    process.exit(1);
  }
  console.log("  content is consistent\n");

  console.log("Clearing existing content…");
  // Order matters: children before parents, since SQLite enforces the FKs.
  await prisma.searchDoc.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.projectProgress.deleteMany();
  await prisma.project.deleteMany();
  await prisma.course.deleteMany();
  await prisma.track.deleteMany();
  await prisma.challengeAttempt.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.glossaryTerm.deleteMany();
  await prisma.troubleshootingEntry.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();

  // -------------------------------------------------------------------------
  // Tracks and courses
  // -------------------------------------------------------------------------

  console.log("Seeding tracks…");
  const trackIds = new Map<string, string>();
  for (const track of tracks) {
    const row = await prisma.track.create({
      data: {
        slug: track.slug,
        level: track.level,
        title: track.title,
        subtitle: track.subtitle,
        description: track.description,
        outcome: track.outcome,
        accent: track.accent,
        icon: track.icon,
      },
    });
    trackIds.set(track.slug, row.id);
  }
  console.log(`  ${tracks.length} tracks`);

  console.log("Seeding courses, modules and lessons…");
  const courseIds = new Map<string, string>();
  const searchDocs: {
    kind: string;
    ref: string;
    url: string;
    title: string;
    summary: string;
    body: string;
    keywords: string;
    difficulty: string;
    weight: number;
  }[] = [];

  let lessonCount = 0;
  let quizCount = 0;

  for (const [courseIndex, course] of courses.entries()) {
    const trackId = trackIds.get(course.track);
    if (!trackId) continue;

    // A planned course carries its outline in the description so the "being
    // written" page has something real to show, rather than an empty shell.
    const estimatedMinutes = course.modules.reduce(
      (total, module) =>
        total +
        module.lessons.reduce(
          (sum, lesson) => sum + (lesson.estimatedMinutes ?? estimateMinutes(lesson.blocks)),
          0,
        ),
      0,
    );

    const courseRow = await prisma.course.create({
      data: {
        slug: course.slug,
        trackId,
        position: courseIndex,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        difficulty: course.difficulty,
        estimatedMinutes,
        tags: json(course.tags ?? []),
        prerequisites: json(course.prerequisites ?? []),
        skillSlugs: json(course.skills ?? []),
        published: !course.planned,
      },
    });
    courseIds.set(course.slug, courseRow.id);

    searchDocs.push({
      kind: "course",
      ref: course.slug,
      url: `/learn/${course.slug}`,
      title: course.title,
      summary: course.subtitle,
      body: normaliseText(
        `${course.description} ${(course.tags ?? []).join(" ")} ${(course.outline ?? []).join(" ")}`,
      ),
      keywords: normaliseText((course.tags ?? []).join(" ")),
      difficulty: course.difficulty,
      weight: course.planned ? 20 : 90,
    });

    for (const [moduleIndex, module] of course.modules.entries()) {
      const moduleRow = await prisma.module.create({
        data: {
          slug: module.slug,
          courseId: courseRow.id,
          position: moduleIndex,
          title: module.title,
          description: module.description,
        },
      });

      for (const [lessonIndex, lesson] of module.lessons.entries()) {
        const body = blocksToSearchText(lesson.blocks);

        await prisma.lesson.create({
          data: {
            slug: lesson.slug,
            moduleId: moduleRow.id,
            courseId: courseRow.id,
            position: lessonIndex,
            title: lesson.title,
            summary: lesson.summary,
            difficulty: lesson.difficulty ?? course.difficulty,
            estimatedMinutes: lesson.estimatedMinutes ?? estimateMinutes(lesson.blocks),
            objectives: json(lesson.objectives),
            blocks: json(lesson.blocks),
            keyTerms: json(lesson.keyTerms ?? []),
          },
        });
        lessonCount += 1;

        searchDocs.push({
          kind: "lesson",
          ref: `${course.slug}/${lesson.slug}`,
          url: `/learn/${course.slug}/${lesson.slug}`,
          title: lesson.title,
          summary: lesson.summary,
          body: normaliseText(`${lesson.summary} ${lesson.objectives.join(" ")} ${body}`),
          keywords: normaliseText(
            `${(lesson.keyTerms ?? []).join(" ")} ${course.title} ${(course.tags ?? []).join(" ")}`,
          ),
          difficulty: lesson.difficulty ?? course.difficulty,
          weight: 70,
        });

        if (lesson.quiz) {
          await createQuiz(courseRow.id, course.slug, lesson);
          quizCount += 1;
        }
      }
    }
  }
  console.log(`  ${courses.length} courses, ${lessonCount} lessons, ${quizCount} quizzes`);

  // -------------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------------

  console.log("Seeding projects…");
  for (const [index, project] of projects.entries()) {
    const relatedCourseIds = (project.courses ?? [])
      .map((slug) => courseIds.get(slug))
      .filter((id): id is string => Boolean(id));

    await prisma.project.create({
      data: {
        slug: project.slug,
        position: index,
        title: project.title,
        summary: project.summary,
        difficulty: project.difficulty,
        category: project.category,
        estimatedHours: project.estimatedHours,
        tags: json(project.tags ?? []),
        prerequisites: json(project.prerequisites ?? []),
        skillSlugs: json(project.skills ?? []),
        hardware: json(project.hardware),
        software: json(project.software),
        blocks: json(project.sections),
        courses: { connect: relatedCourseIds.map((id) => ({ id })) },
      },
    });

    const projectBody = project.sections
      .map((section) => blocksToSearchText(section.blocks))
      .join(" ");

    searchDocs.push({
      kind: "project",
      ref: project.slug,
      url: `/projects/${project.slug}`,
      title: project.title,
      summary: project.summary,
      body: normaliseText(`${project.summary} ${projectBody}`),
      keywords: normaliseText(
        `${(project.tags ?? []).join(" ")} ${project.hardware.map((h) => h.name).join(" ")} ${project.software.map((s) => s.name).join(" ")}`,
      ),
      difficulty: project.difficulty,
      weight: 80,
    });
  }
  console.log(`  ${projects.length} projects`);

  // -------------------------------------------------------------------------
  // Challenges, simulations, glossary, troubleshooting
  // -------------------------------------------------------------------------

  console.log("Seeding challenges…");
  for (const [index, challenge] of challenges.entries()) {
    await prisma.challenge.create({
      data: {
        slug: challenge.slug,
        position: index,
        title: challenge.title,
        difficulty: challenge.difficulty,
        category: challenge.category,
        language: challenge.language,
        prompt: challenge.prompt,
        inputSpec: challenge.inputSpec,
        outputSpec: challenge.outputSpec,
        starterCode: challenge.starterCode,
        solution: challenge.solution,
        explanation: challenge.explanation,
        hints: json(challenge.hints),
        testCases: json(challenge.testCases),
      },
    });

    searchDocs.push({
      kind: "challenge",
      ref: challenge.slug,
      url: `/challenges/${challenge.slug}`,
      title: challenge.title,
      summary: challenge.prompt.slice(0, 180),
      body: normaliseText(`${challenge.prompt} ${challenge.explanation} ${challenge.hints.join(" ")}`),
      keywords: normaliseText(`${challenge.category} ${challenge.language}`),
      difficulty: challenge.difficulty,
      weight: 60,
    });
  }
  console.log(`  ${challenges.length} challenges`);

  console.log("Seeding simulations…");
  for (const [index, simulation] of simulations.entries()) {
    await prisma.simulation.create({
      data: {
        slug: simulation.slug,
        position: index,
        title: simulation.title,
        description: simulation.description,
        category: simulation.category,
        widget: simulation.widget,
        config: JSON.stringify(simulation.config ?? {}),
        learnMore: json(simulation.learnMore ?? []),
      },
    });

    searchDocs.push({
      kind: "simulation",
      ref: simulation.slug,
      url: `/simulations/${simulation.slug}`,
      title: simulation.title,
      summary: simulation.description,
      body: normaliseText(simulation.description),
      keywords: normaliseText(`${simulation.category} simulator interactive`),
      difficulty: "",
      weight: 65,
    });
  }
  console.log(`  ${simulations.length} simulations`);

  console.log("Seeding glossary…");
  for (const term of glossary) {
    await prisma.glossaryTerm.create({
      data: {
        slug: term.slug,
        term: term.term,
        abbreviation: term.abbreviation ?? "",
        category: term.category,
        simple: term.simple,
        technical: term.technical,
        example: term.example ?? "",
        formula: term.formula ?? "",
        relatedSlugs: json(term.related ?? []),
        lessonRefs: json(term.lessons ?? []),
      },
    });

    searchDocs.push({
      kind: "glossary",
      ref: term.slug,
      url: `/glossary/${term.slug}`,
      title: term.abbreviation ? `${term.term} (${term.abbreviation})` : term.term,
      summary: term.simple,
      body: normaliseText(`${term.simple} ${term.technical} ${term.example ?? ""}`),
      keywords: normaliseText(`${term.abbreviation ?? ""} ${term.category}`),
      difficulty: "",
      // Glossary entries are the canonical answer to "what is X?", so they
      // outrank a lesson that merely mentions X in passing.
      weight: 85,
    });
  }
  console.log(`  ${glossary.length} glossary terms`);

  console.log("Seeding troubleshooting…");
  for (const [index, entry] of troubleshooting.entries()) {
    await prisma.troubleshootingEntry.create({
      data: {
        slug: entry.slug,
        position: index,
        title: entry.title,
        symptom: entry.symptom,
        category: entry.category,
        severity: entry.severity ?? "common",
        causes: json(entry.causes),
        relatedIds: json(entry.related ?? []),
      },
    });

    const causeText = entry.causes
      .map((cause) => `${cause.cause} ${cause.checks.join(" ")} ${cause.fix}`)
      .join(" ");

    searchDocs.push({
      kind: "troubleshooting",
      ref: entry.slug,
      url: `/troubleshooting/${entry.slug}`,
      title: entry.title,
      summary: entry.symptom,
      body: normaliseText(`${entry.symptom} ${causeText}`),
      keywords: normaliseText(`${entry.category} error problem fault fix debug`),
      difficulty: "",
      weight: 75,
    });
  }
  console.log(`  ${troubleshooting.length} troubleshooting entries`);

  // -------------------------------------------------------------------------
  // Skills and achievements
  // -------------------------------------------------------------------------

  console.log("Seeding skills and achievements…");
  for (const skill of skills) {
    await prisma.skill.create({
      data: {
        slug: skill.slug,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        tier: skill.tier,
        parentSlugs: json(skill.parents ?? []),
        courseSlugs: json(skill.courses ?? []),
      },
    });
  }

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: {
        slug: achievement.slug,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        tier: achievement.tier,
        criteriaKind: achievement.criteriaKind,
        criteriaRef: achievement.criteriaRef ?? "",
        threshold: achievement.threshold ?? 1,
      },
    });
  }
  console.log(`  ${skills.length} skills, ${achievements.length} achievements`);

  // -------------------------------------------------------------------------
  // Search index
  // -------------------------------------------------------------------------

  console.log("Building search index…");
  for (const doc of searchDocs) {
    await prisma.searchDoc.create({ data: doc });
  }
  console.log(`  ${searchDocs.length} documents indexed`);

  // -------------------------------------------------------------------------
  // Admin account
  // -------------------------------------------------------------------------

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  // A seeded admin means a password exists in a file, and files get committed.
  // Refuse the obviously-weak ones rather than quietly creating an account
  // whose credentials are readable by anyone who clones the repository.
  if (adminEmail && adminPassword) {
    const weak =
      adminPassword.length < 12 || /changeme|password|admin|123456|letmein/i.test(adminPassword);

    if (weak) {
      console.error(
        [
          "",
          `Refusing to create ${adminEmail}: SEED_ADMIN_PASSWORD is weak or a known default.`,
          "",
          "Leave SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD empty and let the first person who",
          "signs up become the admin. Then no password is ever written into a file — which",
          "matters, because files get committed and git history is forever.",
          "",
        ].join("\n"),
      );
      process.exit(1);
    }
  }

  if (adminEmail && adminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
      console.log(`\nAdmin account ${adminEmail} already exists (role confirmed).`);
    } else {
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Academy Admin",
          role: "ADMIN",
          passwordHash: await bcrypt.hash(adminPassword, 12),
        },
      });
      console.log(`\nAdmin account created: ${adminEmail}`);
      console.log("Change this password after your first sign-in.");
    }
  }

  console.log("\nSeed complete.");
}

async function createQuiz(courseId: string, courseSlug: string, lesson: LessonSource) {
  const source = lesson.quiz;
  if (!source) return;

  const lessonRow = await prisma.lesson.findUnique({
    where: { courseId_slug: { courseId, slug: lesson.slug } },
    select: { id: true },
  });
  if (!lessonRow) return;

  const quiz = await prisma.quiz.create({
    data: {
      slug: quizSlug(courseSlug, lesson.slug),
      lessonId: lessonRow.id,
      courseId,
      title: source.title ?? `${lesson.title} — check your understanding`,
      description: source.description ?? "",
      passingScore: source.passingScore ?? 70,
    },
  });

  for (const [questionIndex, question] of source.questions.entries()) {
    const questionRow = await prisma.question.create({
      data: {
        quizId: quiz.id,
        position: questionIndex,
        prompt: question.prompt,
        kind: question.kind ?? "SINGLE",
        explanation: question.explanation,
      },
    });

    for (const [answerIndex, answer] of question.answers.entries()) {
      await prisma.answer.create({
        data: {
          questionId: questionRow.id,
          position: answerIndex,
          text: answer.text,
          isCorrect: Boolean(answer.correct),
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error("\nSeed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
