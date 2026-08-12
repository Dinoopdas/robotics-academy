import type { CourseSource } from "./schema";

import { tracks } from "./tracks";
import { skills, achievements } from "./skills";
import { glossary } from "./glossary";
import { projects } from "./projects";
import { challenges, simulations, troubleshooting } from "./practice";

import { orientationCourses } from "./courses/orientation";
import { fundamentalsCourses } from "./courses/fundamentals";
import { programmingElectronicsCourses } from "./courses/programming-electronics";
import { sensorsMathKinematicsCourses } from "./courses/sensors-math-kinematics";
import { advancedTrackCourses } from "./courses/advanced-tracks";
import { plannedCourses } from "./courses/planned";

export const courses: CourseSource[] = [
  ...orientationCourses,
  ...fundamentalsCourses,
  ...programmingElectronicsCourses,
  ...sensorsMathKinematicsCourses,
  ...advancedTrackCourses,
  ...plannedCourses,
];

export {
  tracks,
  skills,
  achievements,
  glossary,
  projects,
  challenges,
  simulations,
  troubleshooting,
};

/**
 * Validates cross-references before anything is written to the database.
 *
 * Content is the one part of this system where a typo produces a dead link
 * rather than a crash, so the seeder refuses to run on a broken corpus.
 * Returns a list of human-readable problems; empty means the corpus is sound.
 */
export function validateContent(): string[] {
  const problems: string[] = [];

  const trackSlugs = new Set(tracks.map((t) => t.slug));
  const courseSlugs = new Set(courses.map((c) => c.slug));
  const skillSlugs = new Set(skills.map((s) => s.slug));
  const glossarySlugs = new Set(glossary.map((g) => g.slug));
  const challengeSlugs = new Set(challenges.map((c) => c.slug));
  const troubleSlugs = new Set(troubleshooting.map((t) => t.slug));

  // Lesson slugs are unique per course; collect the pairs for prerequisite checks.
  const lessonSlugs = new Set<string>();
  const seenCourseSlugs = new Set<string>();

  for (const course of courses) {
    if (seenCourseSlugs.has(course.slug)) {
      problems.push(`Duplicate course slug: ${course.slug}`);
    }
    seenCourseSlugs.add(course.slug);

    if (!trackSlugs.has(course.track)) {
      problems.push(`Course ${course.slug} references unknown track "${course.track}"`);
    }

    for (const prerequisite of course.prerequisites ?? []) {
      if (!courseSlugs.has(prerequisite)) {
        problems.push(`Course ${course.slug} requires unknown course "${prerequisite}"`);
      }
    }

    for (const skill of course.skills ?? []) {
      if (!skillSlugs.has(skill)) {
        problems.push(`Course ${course.slug} references unknown skill "${skill}"`);
      }
    }

    if (course.planned && course.modules.length > 0) {
      problems.push(`Course ${course.slug} is marked planned but declares modules`);
    }
    if (!course.planned && course.modules.length === 0) {
      problems.push(`Course ${course.slug} has no modules and is not marked planned`);
    }

    const seenLessonSlugs = new Set<string>();
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        if (seenLessonSlugs.has(lesson.slug)) {
          problems.push(`Course ${course.slug} has duplicate lesson slug "${lesson.slug}"`);
        }
        seenLessonSlugs.add(lesson.slug);
        lessonSlugs.add(lesson.slug);

        for (const term of lesson.keyTerms ?? []) {
          if (!glossarySlugs.has(term)) {
            problems.push(
              `Lesson ${course.slug}/${lesson.slug} references unknown glossary term "${term}"`,
            );
          }
        }

        for (const block of lesson.blocks) {
          if (block.type === "challenge" && block.challengeSlug) {
            if (!challengeSlugs.has(block.challengeSlug)) {
              problems.push(
                `Lesson ${course.slug}/${lesson.slug} links unknown challenge "${block.challengeSlug}"`,
              );
            }
          }
        }

        if (lesson.quiz) {
          for (const [index, question] of lesson.quiz.questions.entries()) {
            const correct = question.answers.filter((a) => a.correct).length;
            if (correct === 0) {
              problems.push(
                `Quiz ${course.slug}/${lesson.slug} question ${index + 1} has no correct answer`,
              );
            }
            if (correct > 1 && (question.kind ?? "SINGLE") === "SINGLE") {
              problems.push(
                `Quiz ${course.slug}/${lesson.slug} question ${index + 1} is SINGLE but has ${correct} correct answers`,
              );
            }
          }
        }
      }
    }
  }

  for (const skill of skills) {
    for (const parent of skill.parents ?? []) {
      if (!skillSlugs.has(parent)) {
        problems.push(`Skill ${skill.slug} references unknown parent "${parent}"`);
      }
    }
    for (const course of skill.courses ?? []) {
      if (!courseSlugs.has(course)) {
        problems.push(`Skill ${skill.slug} references unknown course "${course}"`);
      }
    }
  }

  for (const achievement of achievements) {
    if (achievement.criteriaKind === "COURSE_COMPLETE" && achievement.criteriaRef) {
      if (!courseSlugs.has(achievement.criteriaRef)) {
        problems.push(
          `Achievement ${achievement.slug} references unknown course "${achievement.criteriaRef}"`,
        );
      }
    }
    if (achievement.criteriaKind === "TRACK_COMPLETE" && achievement.criteriaRef) {
      if (!trackSlugs.has(achievement.criteriaRef)) {
        problems.push(
          `Achievement ${achievement.slug} references unknown track "${achievement.criteriaRef}"`,
        );
      }
    }
  }

  for (const term of glossary) {
    for (const related of term.related ?? []) {
      if (!glossarySlugs.has(related)) {
        problems.push(`Glossary term ${term.slug} links unknown term "${related}"`);
      }
    }
    for (const ref of term.lessons ?? []) {
      if (!courseSlugs.has(ref.courseSlug)) {
        problems.push(`Glossary term ${term.slug} references unknown course "${ref.courseSlug}"`);
      }
    }
  }

  for (const project of projects) {
    for (const course of project.courses ?? []) {
      if (!courseSlugs.has(course)) {
        problems.push(`Project ${project.slug} references unknown course "${course}"`);
      }
    }
    for (const skill of project.skills ?? []) {
      if (!skillSlugs.has(skill)) {
        problems.push(`Project ${project.slug} references unknown skill "${skill}"`);
      }
    }
    for (const prerequisite of project.prerequisites ?? []) {
      if (!lessonSlugs.has(prerequisite)) {
        problems.push(`Project ${project.slug} requires unknown lesson "${prerequisite}"`);
      }
    }
  }

  for (const entry of troubleshooting) {
    for (const related of entry.related ?? []) {
      if (!troubleSlugs.has(related)) {
        problems.push(`Troubleshooting ${entry.slug} links unknown entry "${related}"`);
      }
    }
  }

  return problems;
}
