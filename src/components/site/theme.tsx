"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ra-theme";

/**
 * Runs before first paint to apply the stored theme. Inlined as a blocking
 * script in <head> — a useEffect would run after hydration and produce a
 * visible flash of the wrong theme on every page load.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var dark = stored ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

/**
 * The `dark` class on <html> is the single source of truth — the blocking
 * script above sets it before paint. Subscribing to it with
 * useSyncExternalStore rather than mirroring it into component state means
 * there is no second copy to fall out of sync, and no setState-in-effect.
 */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getThemeSnapshot = () => document.documentElement.classList.contains("dark");

// The server cannot know the visitor's stored preference, so it reports null
// and the button renders its inert placeholder until hydration.
const getServerThemeSnapshot = () => null;

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const mounted = isDark !== null;

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private browsing with storage disabled — theme just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-2 transition hover:border-line-strong hover:text-text-1"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {/* Render nothing until mounted so server and client markup agree. */}
      {mounted ? (
        isDark ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}
