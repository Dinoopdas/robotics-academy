import Link from "next/link";

import { cn } from "@/lib/cn";

/** Course outline sidebar, grouped by module and marking the current lesson. */
export function LessonOutline({
  courseSlug,
  currentSlug,
  lessons,
}: {
  courseSlug: string;
  currentSlug: string;
  lessons: { slug: string; title: string; moduleTitle: string; complete: boolean }[];
}) {
  const grouped: { module: string; lessons: typeof lessons }[] = [];

  for (const lesson of lessons) {
    const last = grouped.at(-1);
    if (last && last.module === lesson.moduleTitle) last.lessons.push(lesson);
    else grouped.push({ module: lesson.moduleTitle, lessons: [lesson] });
  }

  return (
    <nav className="scrollbar-slim max-h-[calc(100dvh-12rem)] overflow-y-auto p-2">
      {grouped.map((group) => (
        <div key={group.module} className="mb-3 last:mb-0">
          <p className="px-2 py-1.5 font-mono text-[10px] font-semibold tracking-wide text-text-3 uppercase">
            {group.module}
          </p>
          <ul>
            {group.lessons.map((lesson) => {
              const current = lesson.slug === currentSlug;
              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/learn/${courseSlug}/${lesson.slug}`}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition",
                      current
                        ? "bg-signal-soft font-medium text-signal"
                        : "text-text-2 hover:bg-surface-2 hover:text-text-1",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full",
                        lesson.complete ? "bg-emerald" : current ? "bg-signal" : "bg-line-strong",
                      )}
                    />
                    <span className="flex-1 leading-snug">{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
