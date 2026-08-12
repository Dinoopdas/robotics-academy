import { NextResponse } from "next/server";

import { search } from "@/lib/search";
import { SEARCH_KINDS, type SearchKind } from "@/lib/enums";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const kindParam = searchParams.getAll("kind").filter(
    (k): k is SearchKind => (SEARCH_KINDS as readonly string[]).includes(k),
  );

  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) ? Math.min(50, Math.max(1, limitParam)) : 12;

  const hits = await search(query, {
    kinds: kindParam.length ? kindParam : undefined,
    limit,
  });

  return NextResponse.json(
    { query, count: hits.length, hits },
    // Search results are content-derived and change only when content changes,
    // but the query space is unbounded — a short private cache is enough to
    // absorb keystroke bursts without serving anyone else's results.
    { headers: { "Cache-Control": "private, max-age=15" } },
  );
}
