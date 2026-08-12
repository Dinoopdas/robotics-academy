/**
 * The lesson content model.
 *
 * Lessons are stored as a JSON array of blocks rather than as a blob of
 * markdown. That costs a little authoring convenience and buys three things
 * the platform depends on:
 *
 *  1. The renderer can treat a maths block, a code block and a simulator as
 *     first-class things with their own affordances, instead of parsing HTML.
 *  2. The admin CMS can edit one block at a time without a markdown parser.
 *  3. The search indexer can extract meaningful text and skip code noise.
 *
 * `text` fields accept a small inline syntax handled by renderInline():
 *   **bold**, `code`, *italic*, $math$, [label](href)
 */

export type Tone = "note" | "tip" | "warning" | "mistake" | "insight";

/** Free prose. The workhorse block. */
export interface ProseBlock {
  type: "prose";
  text: string;
}

export interface HeadingBlock {
  type: "heading";
  text: string;
  /** 2 renders an <h2> section break, 3 an <h3> subsection. */
  level?: 2 | 3;
  /** Optional deck line under the heading. */
  kicker?: string;
}

/**
 * The progressive-explanation ladder the curriculum is built around:
 * plain sentence -> engineering sentence -> formal model. Rendered as a
 * stepped column so a beginner can stop at tier 1 and come back later.
 */
export interface LadderBlock {
  type: "ladder";
  title?: string;
  rungs: {
    label: string;
    text: string;
    /** Optional KaTeX shown alongside the rung. */
    math?: string;
  }[];
}

/** Declarative flow diagram — the `A ↓ B ↓ C` shape used across the syllabus. */
export interface FlowBlock {
  type: "flow";
  title?: string;
  direction?: "vertical" | "horizontal";
  nodes: { label: string; detail?: string; accent?: boolean }[];
}

/** Labelled schematic drawn as inline SVG by a named diagram component. */
export interface DiagramBlock {
  type: "diagram";
  /** Key resolved by src/components/diagrams/registry.tsx */
  name: string;
  title?: string;
  caption?: string;
  config?: Record<string, unknown>;
}

export interface MathBlock {
  type: "math";
  title?: string;
  /** Display-mode KaTeX. */
  latex: string;
  /** What each symbol means — beginners need this every single time. */
  where?: { symbol: string; meaning: string; unit?: string }[];
  note?: string;
}

export interface CodeBlock {
  type: "code";
  language: string;
  code: string;
  filename?: string;
  title?: string;
  /** Line-by-line commentary, keyed by 1-based line number. */
  annotations?: { line: number; text: string }[];
  /** Shown under the block: what running this actually prints/does. */
  output?: string;
}

export interface CalloutBlock {
  type: "callout";
  tone: Tone;
  title?: string;
  text: string;
}

export interface ListBlock {
  type: "list";
  title?: string;
  style?: "bullet" | "number" | "check";
  items: string[];
}

export interface StepsBlock {
  type: "steps";
  title?: string;
  steps: { title: string; text: string; code?: string; language?: string }[];
}

export interface TableBlock {
  type: "table";
  title?: string;
  caption?: string;
  columns: string[];
  rows: string[][];
}

/** Side-by-side comparison, e.g. open-loop vs closed-loop. */
export interface CompareBlock {
  type: "compare";
  title?: string;
  columns: {
    heading: string;
    tone?: "positive" | "negative" | "neutral";
    points: string[];
  }[];
}

/** A worked robotics example: the "where does this actually show up" block. */
export interface ExampleBlock {
  type: "example";
  title: string;
  scenario: string;
  steps?: string[];
  result?: string;
}

/** Mounts a real interactive widget from the simulator registry. */
export interface InteractiveBlock {
  type: "interactive";
  /** Key resolved by src/components/interactive/registry.ts */
  widget: string;
  title?: string;
  instructions?: string;
  config?: Record<string, unknown>;
}

/** Self-check with an inline reveal — distinct from the graded lesson quiz. */
export interface CheckBlock {
  type: "check";
  question: string;
  answer: string;
  hint?: string;
}

export interface ChallengeBlock {
  type: "challenge";
  title: string;
  text: string;
  /** Slug of a full Challenge record, if this mini-challenge has one. */
  challengeSlug?: string;
  hints?: string[];
}

export interface SummaryBlock {
  type: "summary";
  points: string[];
}

/** Pulls the ten "content quality" questions into a structured panel. */
export interface DeepDiveBlock {
  type: "deepdive";
  title?: string;
  entries: { question: string; answer: string }[];
}

export type LessonBlock =
  | ProseBlock
  | HeadingBlock
  | LadderBlock
  | FlowBlock
  | DiagramBlock
  | MathBlock
  | CodeBlock
  | CalloutBlock
  | ListBlock
  | StepsBlock
  | TableBlock
  | CompareBlock
  | ExampleBlock
  | InteractiveBlock
  | CheckBlock
  | ChallengeBlock
  | SummaryBlock
  | DeepDiveBlock;

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

/**
 * Every project page renders these sections in this order. The order is fixed
 * by the platform, not by the author, so a learner who has done one project
 * knows exactly where to look in the next one.
 */
export const PROJECT_SECTION_ORDER = [
  "overview",
  "architecture",
  "theory",
  "build",
  "code",
  "test",
  "troubleshooting",
  "challenge",
  "result",
] as const;

export type ProjectSectionId = (typeof PROJECT_SECTION_ORDER)[number];

export const PROJECT_SECTION_LABEL: Record<ProjectSectionId, string> = {
  overview: "Project overview",
  architecture: "System architecture",
  theory: "Theory you need",
  build: "Build it",
  code: "The code",
  test: "Test it",
  troubleshooting: "Troubleshooting",
  challenge: "Take it further",
  result: "Expected result",
};

export interface ProjectSection {
  id: ProjectSectionId;
  blocks: LessonBlock[];
}

export interface HardwareItem {
  name: string;
  qty: number;
  note?: string;
  optional?: boolean;
}

export interface SoftwareItem {
  name: string;
  note?: string;
  url?: string;
}

// ---------------------------------------------------------------------------
// Reference content
// ---------------------------------------------------------------------------

export interface LessonRef {
  courseSlug: string;
  lessonSlug: string;
  title: string;
}

export interface TroubleCause {
  cause: string;
  likelihood: "high" | "medium" | "low";
  checks: string[];
  fix: string;
}

export interface ChallengeTestCase {
  input: string;
  expected: string;
  explanation?: string;
}

export interface LinkRef {
  label: string;
  href: string;
}
