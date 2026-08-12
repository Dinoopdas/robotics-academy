import type {
  ChallengeTestCase,
  HardwareItem,
  LessonBlock,
  LessonRef,
  LinkRef,
  ProjectSection,
  SoftwareItem,
  TroubleCause,
} from "./types";

/**
 * Typed readers for the JSON-encoded String columns. Every one of these is
 * total: a malformed or empty column yields the fallback rather than throwing,
 * because a single bad content row should degrade one card, not take down a
 * page. Writes go through `encode` so the shape stays symmetric.
 */
function decode<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function encode(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export const parseStrings = (raw: string | null | undefined): string[] => {
  const value = decode<unknown>(raw, []);
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
};

export const parseBlocks = (raw: string | null | undefined): LessonBlock[] =>
  decode<LessonBlock[]>(raw, []);

export const parseProjectSections = (raw: string | null | undefined): ProjectSection[] =>
  decode<ProjectSection[]>(raw, []);

export const parseHardware = (raw: string | null | undefined): HardwareItem[] =>
  decode<HardwareItem[]>(raw, []);

export const parseSoftware = (raw: string | null | undefined): SoftwareItem[] =>
  decode<SoftwareItem[]>(raw, []);

export const parseLessonRefs = (raw: string | null | undefined): LessonRef[] =>
  decode<LessonRef[]>(raw, []);

export const parseCauses = (raw: string | null | undefined): TroubleCause[] =>
  decode<TroubleCause[]>(raw, []);

export const parseTestCases = (raw: string | null | undefined): ChallengeTestCase[] =>
  decode<ChallengeTestCase[]>(raw, []);

export const parseLinks = (raw: string | null | undefined): LinkRef[] =>
  decode<LinkRef[]>(raw, []);

export const parseConfig = (raw: string | null | undefined): Record<string, unknown> =>
  decode<Record<string, unknown>>(raw, {});

/**
 * Flattens blocks into plain prose for the search index. Code bodies are
 * deliberately excluded — indexing them makes every Python lesson match every
 * query containing "import" — but titles, filenames and annotations are kept
 * because those are what people actually search for.
 */
export function blocksToSearchText(blocks: LessonBlock[]): string {
  const out: string[] = [];

  const push = (value?: string) => {
    if (value) out.push(value);
  };

  for (const block of blocks) {
    switch (block.type) {
      case "prose":
        push(block.text);
        break;
      case "heading":
        push(block.text);
        push(block.kicker);
        break;
      case "ladder":
        push(block.title);
        block.rungs.forEach((r) => {
          push(r.label);
          push(r.text);
        });
        break;
      case "flow":
        push(block.title);
        block.nodes.forEach((n) => {
          push(n.label);
          push(n.detail);
        });
        break;
      case "diagram":
        push(block.title);
        push(block.caption);
        break;
      case "math":
        push(block.title);
        push(block.note);
        block.where?.forEach((w) => push(w.meaning));
        break;
      case "code":
        // Body omitted on purpose; see docstring above.
        push(block.title);
        push(block.filename);
        push(block.language);
        block.annotations?.forEach((a) => push(a.text));
        break;
      case "callout":
        push(block.title);
        push(block.text);
        break;
      case "list":
        push(block.title);
        block.items.forEach(push);
        break;
      case "steps":
        push(block.title);
        block.steps.forEach((s) => {
          push(s.title);
          push(s.text);
        });
        break;
      case "table":
        push(block.title);
        push(block.caption);
        push(block.columns.join(" "));
        block.rows.forEach((row) => push(row.join(" ")));
        break;
      case "compare":
        push(block.title);
        block.columns.forEach((c) => {
          push(c.heading);
          c.points.forEach(push);
        });
        break;
      case "example":
        push(block.title);
        push(block.scenario);
        block.steps?.forEach(push);
        push(block.result);
        break;
      case "interactive":
        push(block.title);
        push(block.instructions);
        break;
      case "check":
        push(block.question);
        push(block.answer);
        break;
      case "challenge":
        push(block.title);
        push(block.text);
        break;
      case "summary":
        block.points.forEach(push);
        break;
      case "deepdive":
        push(block.title);
        block.entries.forEach((e) => {
          push(e.question);
          push(e.answer);
        });
        break;
    }
  }

  return normaliseText(out.join(" "));
}

/** Strips inline markup and collapses whitespace so the index stays clean. */
export function normaliseText(input: string): string {
  return input
    .replace(/\$[^$]*\$/g, " ") // inline maths
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> label
    .replace(/[*`_#>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Rough reading-time estimate used when a lesson does not declare one. */
export function estimateMinutes(blocks: LessonBlock[]): number {
  const words = blocksToSearchText(blocks).split(" ").length;
  const interactives = blocks.filter(
    (b) => b.type === "interactive" || b.type === "check" || b.type === "challenge",
  ).length;
  const code = blocks.filter((b) => b.type === "code").length;
  return Math.max(4, Math.round(words / 190 + interactives * 3 + code * 1.5));
}
