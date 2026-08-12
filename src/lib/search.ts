import "server-only";

import { prisma } from "@/lib/db";
import type { SearchKind as Kind } from "@/lib/enums";

export interface SearchHit {
  kind: Kind;
  ref: string;
  url: string;
  title: string;
  summary: string;
  difficulty: string;
  score: number;
  /** Short excerpt around the first match, for result previews. */
  excerpt: string;
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "do", "does", "for", "from",
  "how", "i", "in", "is", "it", "of", "on", "or", "the", "to", "what", "when",
  "where", "which", "why", "with", "work", "works",
]);

function tokenise(query: string): string[] {
  return normalise(query)
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ranking is done in application code over the denormalised SearchDoc table
 * rather than in SQL, because SQLite's LIKE cannot express "title matches are
 * worth more than body matches" and the corpus (a few thousand docs) is small
 * enough that scoring in memory is well under a millisecond.
 *
 * Score components, highest weight first:
 *   exact phrase in title  > all terms in title > term in title
 *   > exact phrase in body > term in body
 *   plus the doc's static `weight` so a course outranks a passing mention.
 */
export async function search(
  rawQuery: string,
  options: { kinds?: Kind[]; limit?: number } = {},
): Promise<SearchHit[]> {
  const query = normalise(rawQuery);
  if (query.length < 2) return [];

  const terms = tokenise(rawQuery);
  if (terms.length === 0) return [];

  const limit = options.limit ?? 25;

  // Pull only candidate rows: anything containing at least one term somewhere.
  const docs = await prisma.searchDoc.findMany({
    where: {
      AND: [
        options.kinds?.length ? { kind: { in: options.kinds } } : {},
        {
          OR: terms.flatMap((term) => [
            { title: { contains: term } },
            { body: { contains: term } },
            { keywords: { contains: term } },
          ]),
        },
      ],
    },
    take: 400,
  });

  const hits: SearchHit[] = [];

  for (const doc of docs) {
    const title = doc.title.toLowerCase();
    const body = doc.body;
    const keywords = doc.keywords;

    let score = doc.weight;
    let matchedTerms = 0;

    if (title.includes(query)) score += 120;
    if (body.includes(query)) score += 30;

    for (const term of terms) {
      let hit = false;

      if (title.includes(term)) {
        // Whole-word title matches beat substring matches ("ik" vs "quick").
        score += new RegExp(`\\b${escapeRegExp(term)}\\b`).test(title) ? 45 : 20;
        hit = true;
      }
      if (keywords.includes(term)) {
        score += 25;
        hit = true;
      }
      if (body.includes(term)) {
        const occurrences = countOccurrences(body, term);
        score += Math.min(18, 4 + occurrences * 2);
        hit = true;
      }
      if (hit) matchedTerms += 1;
    }

    // Documents that match every term are far more relevant than ones that
    // happen to contain a single common word.
    if (matchedTerms === terms.length) score += 40 * terms.length;
    else if (matchedTerms === 0) continue;

    // Shorter titles are usually the canonical page for a concept.
    score += Math.max(0, 20 - title.length / 4);

    hits.push({
      kind: doc.kind as Kind,
      ref: doc.ref,
      url: doc.url,
      title: doc.title,
      summary: doc.summary,
      difficulty: doc.difficulty,
      score,
      excerpt: buildExcerpt(doc.body, terms) || doc.summary,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1 && count < 12) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function buildExcerpt(body: string, terms: string[]): string {
  if (!body) return "";

  let index = -1;
  for (const term of terms) {
    index = body.indexOf(term);
    if (index !== -1) break;
  }
  if (index === -1) return body.slice(0, 150);

  const start = Math.max(0, index - 60);
  const end = Math.min(body.length, index + 110);
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
}

/** Grouped variant used by the full /search page. */
export async function searchGrouped(query: string) {
  const hits = await search(query, { limit: 60 });
  const groups = new Map<Kind, SearchHit[]>();

  for (const hit of hits) {
    const list = groups.get(hit.kind) ?? [];
    list.push(hit);
    groups.set(hit.kind, list);
  }

  return { hits, groups };
}
