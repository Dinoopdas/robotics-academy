"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SEARCH_KIND_LABEL, type SearchKind } from "@/lib/enums";

interface Hit {
  kind: SearchKind;
  ref: string;
  url: string;
  title: string;
  summary: string;
  difficulty: string;
  excerpt: string;
}

const KIND_TONE: Record<string, string> = {
  lesson: "text-signal",
  course: "text-violet",
  project: "text-emerald",
  challenge: "text-amber",
  glossary: "text-text-3",
  simulation: "text-signal",
  troubleshooting: "text-rose",
};

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+K from anywhere, Escape to dismiss.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset when the dialog closes. Adjusting during render rather than in an
  // effect avoids a frame where the previous query's results are still shown.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setQuery("");
      setHits([]);
      setActive(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    // Focus after the dialog paints, otherwise the ref is still null.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Below the minimum length there is nothing to show, so derive it rather
  // than clearing state from an effect.
  const tooShort = query.trim().length < 2;
  const visibleHits = tooShort ? [] : hits;
  // An aborted request never reaches its finally block, so derive the spinner
  // rather than trusting the flag to have been cleared.
  const isLoading = !tooShort && loading;

  // Debounced fetch, with the in-flight request aborted when the query moves on
  // so a slow early response cannot overwrite a fast later one.
  useEffect(() => {
    if (query.trim().length < 2) return;

    const controller = new AbortController();

    // setLoading moves inside the timer: firing it synchronously would flash
    // the spinner on every keystroke, before the debounce has even elapsed.
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { hits: Hit[] };
        setHits(data.hits);
        setActive(0);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setHits([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const go = useCallback(
    (url: string) => {
      setOpen(false);
      router.push(url);
    },
    [router],
  );

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, visibleHits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (visibleHits[active]) go(visibleHits[active].url);
      else if (query.trim()) go(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-1 px-3 text-sm text-text-3 transition hover:border-line-strong hover:text-text-2 lg:w-64"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <span className="hidden lg:inline">Search robotics…</span>
        <kbd className="ml-auto hidden rounded border border-line bg-surface-2 px-1.5 font-mono text-[10px] text-text-3 lg:inline">
          Ctrl K
        </kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative w-full max-w-2xl overflow-hidden rounded-panel border border-line-strong bg-surface-1 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-text-3" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="What is TCP?  ·  ROS 2 publisher  ·  PID overshoot"
                className="h-14 w-full bg-transparent text-[15px] text-text-1 outline-none placeholder:text-text-3"
                aria-label="Search the platform"
              />
              {isLoading ? (
                <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-signal" />
              ) : null}
            </div>

            <div className="max-h-[52vh] overflow-y-auto scrollbar-slim">
              {visibleHits.length === 0 && !tooShort && !isLoading ? (
                <p className="px-4 py-10 text-center text-sm text-text-3">
                  Nothing matched “{query}”. Try a concept, a component or an error.
                </p>
              ) : null}

              {tooShort ? (
                <div className="px-4 py-6">
                  <p className="label-tech mb-3">Try searching for</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "inverse kinematics",
                      "PID tuning",
                      "ROS 2 topics",
                      "ultrasonic sensor",
                      "TF2",
                      "SLAM",
                      "servo control",
                      "degrees of freedom",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuery(suggestion)}
                        className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-text-2 transition hover:border-signal/50 hover:text-signal"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <ul>
                {visibleHits.map((hit, index) => (
                  <li key={`${hit.kind}-${hit.ref}`}>
                    <button
                      type="button"
                      onClick={() => go(hit.url)}
                      onMouseEnter={() => setActive(index)}
                      className={`flex w-full flex-col items-start gap-1 border-b border-line px-4 py-3 text-left transition ${
                        index === active ? "bg-surface-2" : ""
                      }`}
                    >
                      <div className="flex w-full items-center gap-2">
                        <span
                          className={`label-tech shrink-0 ${KIND_TONE[hit.kind] ?? "text-text-3"}`}
                        >
                          {SEARCH_KIND_LABEL[hit.kind]}
                        </span>
                        <span className="truncate text-sm font-medium text-text-1">{hit.title}</span>
                      </div>
                      <p className="line-clamp-2 text-xs text-text-3">{hit.excerpt}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-4 py-2.5">
              <span className="font-mono text-[11px] text-text-3">
                ↑↓ navigate · ↵ open · esc close
              </span>
              {query.trim() ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-signal hover:underline"
                >
                  See all results →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
