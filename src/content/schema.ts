import type {
  ChallengeTestCase,
  HardwareItem,
  LessonBlock,
  LessonRef,
  LinkRef,
  ProjectSection,
  SoftwareItem,
  TroubleCause,
} from "@/lib/content/types";
import type { Difficulty } from "@/lib/enums";

/**
 * Authoring types for the curriculum source.
 *
 * Content is written as typed TypeScript in src/content and loaded into the
 * database by prisma/seed.ts. Authoring in code rather than straight into the
 * database buys review-in-pull-request, refactor-safe cross-references (a typo
 * in a prerequisite slug is a build error, not a dead link at runtime), and a
 * reproducible `db:reset`. The admin CMS then edits the database rows, which is
 * the right tool for correcting a sentence without a deploy.
 */

export interface TrackSource {
  slug: string;
  level: number;
  title: string;
  subtitle: string;
  description: string;
  /** Concrete capability the learner walks away with. */
  outcome: string;
  accent: "cyan" | "violet" | "emerald" | "amber" | "rose";
  icon: string;
}

export interface QuizSource {
  title?: string;
  description?: string;
  passingScore?: number;
  questions: {
    prompt: string;
    kind?: "SINGLE" | "MULTI" | "TRUE_FALSE";
    explanation: string;
    answers: { text: string; correct?: boolean }[];
  }[];
}

export interface LessonSource {
  slug: string;
  title: string;
  summary: string;
  difficulty?: Difficulty;
  estimatedMinutes?: number;
  objectives: string[];
  /** Glossary slugs defined or used heavily in this lesson. */
  keyTerms?: string[];
  blocks: LessonBlock[];
  quiz?: QuizSource;
}

export interface ModuleSource {
  slug: string;
  title: string;
  description: string;
  lessons: LessonSource[];
}

export interface CourseSource {
  slug: string;
  /** Track slug this course belongs to. */
  track: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  tags?: string[];
  /** Course slugs that should be finished first. */
  prerequisites?: string[];
  /** Skill slugs this course advances. */
  skills?: string[];
  modules: ModuleSource[];
  /**
   * Planned courses are seeded so the roadmap can show an honest outline of
   * what is coming, but they are not published: they carry no lessons and the
   * UI labels them as planned rather than pretending they are ready.
   */
  planned?: boolean;
  /** For planned courses: the module titles that are being written. */
  outline?: string[];
}

export interface ProjectSource {
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  category: string;
  estimatedHours: number;
  tags?: string[];
  prerequisites?: string[];
  skills?: string[];
  courses?: string[];
  hardware: HardwareItem[];
  software: SoftwareItem[];
  sections: ProjectSection[];
}

export interface ChallengeSource {
  slug: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  language: string;
  prompt: string;
  inputSpec: string;
  outputSpec: string;
  starterCode: string;
  solution: string;
  explanation: string;
  hints: string[];
  testCases: ChallengeTestCase[];
}

export interface SimulationSource {
  slug: string;
  title: string;
  description: string;
  category: string;
  widget: string;
  config?: Record<string, unknown>;
  learnMore?: LinkRef[];
}

export interface GlossarySource {
  slug: string;
  term: string;
  abbreviation?: string;
  category: string;
  simple: string;
  technical: string;
  example?: string;
  formula?: string;
  related?: string[];
  lessons?: LessonRef[];
}

export interface TroubleshootingSource {
  slug: string;
  title: string;
  symptom: string;
  category: string;
  severity?: string;
  causes: TroubleCause[];
  related?: string[];
}

export interface SkillSource {
  slug: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  parents?: string[];
  courses?: string[];
}

export interface AchievementSource {
  slug: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  criteriaKind:
    | "COURSE_COMPLETE"
    | "TRACK_COMPLETE"
    | "LESSON_COUNT"
    | "PROJECT_COUNT"
    | "QUIZ_SCORE"
    | "STREAK";
  criteriaRef?: string;
  threshold?: number;
}
