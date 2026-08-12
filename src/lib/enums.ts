/**
 * SQLite has no native enum type, so these unions are the single source of
 * truth for the String columns that behave like enums. Everything that writes
 * to the database goes through these types, and `isDifficulty` etc. guard the
 * boundaries where untyped data (JSON content files, form input) comes in.
 */

export const DIFFICULTIES = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "PROFESSIONAL",
] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  PROFESSIONAL: "Professional",
};

/** Tailwind class fragments per difficulty, used by the Badge component. */
export const DIFFICULTY_TONE: Record<Difficulty, string> = {
  BEGINNER: "emerald",
  INTERMEDIATE: "cyan",
  ADVANCED: "violet",
  PROFESSIONAL: "amber",
};

export function isDifficulty(value: string): value is Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(value);
}

export const PROGRESS_STATUSES = ["IN_PROGRESS", "COMPLETED"] as const;
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];

export const ROLES = ["USER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const QUESTION_KINDS = ["SINGLE", "MULTI", "TRUE_FALSE"] as const;
export type QuestionKind = (typeof QUESTION_KINDS)[number];

export const SEARCH_KINDS = [
  "course",
  "lesson",
  "project",
  "challenge",
  "glossary",
  "simulation",
  "troubleshooting",
] as const;
export type SearchKind = (typeof SEARCH_KINDS)[number];

export const SEARCH_KIND_LABEL: Record<SearchKind, string> = {
  course: "Course",
  lesson: "Lesson",
  project: "Project",
  challenge: "Challenge",
  glossary: "Glossary",
  simulation: "Simulation",
  troubleshooting: "Troubleshooting",
};

export const BOOKMARK_KINDS = [
  "lesson",
  "project",
  "challenge",
  "glossary",
  "simulation",
  "troubleshooting",
] as const;
export type BookmarkKind = (typeof BOOKMARK_KINDS)[number];

export const SKILL_CATEGORIES = [
  "foundation",
  "programming",
  "electronics",
  "math",
  "control",
  "perception",
  "integration",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const ACHIEVEMENT_CRITERIA = [
  "COURSE_COMPLETE",
  "TRACK_COMPLETE",
  "LESSON_COUNT",
  "PROJECT_COUNT",
  "QUIZ_SCORE",
  "STREAK",
] as const;
export type AchievementCriteria = (typeof ACHIEVEMENT_CRITERIA)[number];
