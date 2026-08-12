import "server-only";

import { createHighlighter, type Highlighter } from "shiki";

/**
 * Syntax highlighting runs on the server at render time, so no highlighter
 * ships to the browser. Both themes are emitted into the same markup as CSS
 * variables and globals.css swaps which one is visible — that way switching
 * theme does not require re-highlighting or a round trip.
 */

const THEMES = { light: "github-light", dark: "github-dark" } as const;

const LANGUAGES = [
  "python",
  "cpp",
  "c",
  "bash",
  "typescript",
  "javascript",
  "json",
  "yaml",
  "xml",
  "sql",
  "text",
] as const;

/** Aliases the content uses that are not Shiki language ids. */
const ALIASES: Record<string, string> = {
  arduino: "cpp",
  ino: "cpp",
  "c++": "cpp",
  py: "python",
  sh: "bash",
  shell: "bash",
  console: "bash",
  urdf: "xml",
  launch: "python",
  plaintext: "text",
  txt: "text",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  // One highlighter per process. Creating one per call loads every grammar
  // again and turns a 2 ms render into a 400 ms one.
  highlighterPromise ??= createHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: [...LANGUAGES],
  });
  return highlighterPromise;
}

export function normaliseLanguage(language: string): string {
  const key = language.toLowerCase().trim();
  const resolved = ALIASES[key] ?? key;
  return (LANGUAGES as readonly string[]).includes(resolved) ? resolved : "text";
}

export async function highlight(code: string, language: string): Promise<string> {
  const lang = normaliseLanguage(language);

  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, {
      lang,
      themes: THEMES,
      defaultColor: false,
      cssVariablePrefix: "--shiki-",
    });
  } catch {
    // A grammar failure should cost the colours, not the lesson.
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
