import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/auth";
import { Breadcrumbs, Container, Panel } from "@/components/ui/primitives";
import { LessonEditor } from "@/components/admin/lesson-editor";

export const metadata: Metadata = {
  title: "Edit lesson",
  robots: { index: false, follow: false },
};

export default async function AdminLessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  await requireAdminPage(`/admin/lessons/${courseSlug}/${lessonSlug}`);

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, slug: true, title: true },
  });
  if (!course) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { courseId_slug: { courseId: course.id, slug: lessonSlug } },
  });
  if (!lesson) notFound();

  return (
    <Container size="wide" className="py-8">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: course.title, href: `/admin/courses/${course.slug}` },
          { label: lesson.title },
        ]}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{lesson.title}</h1>
        <Link
          href={`/learn/${course.slug}/${lesson.slug}`}
          target="_blank"
          className="text-sm text-signal hover:underline"
        >
          View public page ↗
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <LessonEditor
            lessonId={lesson.id}
            title={lesson.title}
            summary={lesson.summary}
            estimatedMinutes={lesson.estimatedMinutes}
            difficulty={lesson.difficulty}
            published={lesson.published}
            objectives={lesson.objectives}
            blocks={lesson.blocks}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Panel className="p-5">
            <p className="label-tech mb-2">Block types</p>
            <p className="mb-3 text-xs text-text-3">
              Every block needs a <code className="font-mono">type</code>. Available types:
            </p>
            <ul className="space-y-1 font-mono text-[11px] text-text-2">
              {[
                "prose · { text }",
                "heading · { text, level, kicker }",
                "ladder · { title, rungs[] }",
                "flow · { title, nodes[] }",
                "diagram · { name, title, caption }",
                "math · { latex, where[], note }",
                "code · { language, code, annotations[] }",
                "callout · { tone, title, text }",
                "list · { style, items[] }",
                "steps · { steps[] }",
                "table · { columns[], rows[][] }",
                "compare · { columns[] }",
                "example · { title, scenario, steps[] }",
                "interactive · { widget, config }",
                "check · { question, answer, hint }",
                "challenge · { title, text, hints[] }",
                "summary · { points[] }",
                "deepdive · { entries[] }",
              ].map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5">
            <p className="label-tech mb-2">Inline syntax</p>
            <ul className="space-y-1 font-mono text-[11px] text-text-2">
              <li>**bold**</li>
              <li>`code`</li>
              <li>*italic*</li>
              <li>$x = y$ (KaTeX)</li>
              <li>[label](/href)</li>
            </ul>
          </Panel>
        </aside>
      </div>
    </Container>
  );
}
