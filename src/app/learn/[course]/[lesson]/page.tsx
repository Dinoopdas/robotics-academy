import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCompletedLessonIds, getLessonWithNeighbours } from "@/lib/queries";
import { getSession } from "@/lib/auth/session";
import { parseBlocks, parseStrings } from "@/lib/content/parse";
import {
  Badge,
  Breadcrumbs,
  Container,
  DifficultyBadge,
  Panel,
} from "@/components/ui/primitives";
import { BlockList } from "@/components/lesson/blocks";
import { Quiz } from "@/components/lesson/quiz";
import { LessonProgressBar } from "@/components/lesson/progress-bar";
import { LessonOutline } from "@/components/lesson/outline";

export async function generateStaticParams() {
  const lessons = await prisma.lesson.findMany({
    select: { slug: true, course: { select: { slug: true } } },
  });
  return lessons.map((lesson) => ({ course: lesson.course.slug, lesson: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, title: true },
  });
  if (!course) return { title: "Lesson not found" };

  const lesson = await prisma.lesson.findUnique({
    where: { courseId_slug: { courseId: course.id, slug: lessonSlug } },
    select: { title: true, summary: true },
  });
  if (!lesson) return { title: "Lesson not found" };

  return {
    title: lesson.title,
    description: lesson.summary.slice(0, 160),
    openGraph: {
      title: `${lesson.title} — ${course.title}`,
      description: lesson.summary,
      type: "article",
    },
    alternates: { canonical: `/learn/${courseSlug}/${lessonSlug}` },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params;

  const data = await getLessonWithNeighbours(courseSlug, lessonSlug);
  if (!data) notFound();

  const { course, lesson, outline, position, previous, next } = data;

  const [session, completedIds] = await Promise.all([getSession(), getCompletedLessonIds()]);

  const blocks = parseBlocks(lesson.blocks);
  const objectives = parseStrings(lesson.objectives);
  const keyTerms = parseStrings(lesson.keyTerms);

  const glossaryTerms = keyTerms.length
    ? await prisma.glossaryTerm.findMany({
        where: { slug: { in: keyTerms } },
        select: { slug: true, term: true, abbreviation: true, simple: true },
      })
    : [];

  const returnTo = `/learn/${courseSlug}/${lessonSlug}`;
  const isComplete = completedIds.has(lesson.id);

  // Structured data so search engines can surface individual lessons as
  // learning resources rather than as generic pages.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.summary,
    educationalLevel: lesson.difficulty,
    timeRequired: `PT${lesson.estimatedMinutes}M`,
    isPartOf: { "@type": "Course", name: course.title },
    teaches: objectives,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-line bg-surface-1">
        <Container size="wide" className="py-4">
          <Breadcrumbs
            items={[
              { label: "Learn", href: "/learn" },
              { label: course.title, href: `/learn/${course.slug}` },
              { label: lesson.module.title },
            ]}
          />
        </Container>
      </div>

      <Container size="wide" className="py-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
          {/* ------------------------------------------------------- Article */}
          <article className="min-w-0">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={lesson.difficulty} />
                <Badge>{lesson.estimatedMinutes} min</Badge>
                <span className="font-mono text-xs text-text-3">
                  Lesson {position + 1} of {outline.length}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {lesson.title}
              </h1>
              <p className="mt-3 text-lg text-text-2">{lesson.summary}</p>
            </header>

            {objectives.length > 0 ? (
              <div className="mt-8 rounded-panel border border-line bg-surface-1 p-5">
                <p className="label-tech mb-3">Learning objectives</p>
                <ul className="space-y-2">
                  {objectives.map((objective) => (
                    <li key={objective} className="flex gap-2.5 text-sm">
                      <span aria-hidden="true" className="mt-[3px] shrink-0 text-signal">→</span>
                      <span className="text-text-2">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-10">
              <BlockList blocks={blocks} />
            </div>

            {lesson.quiz && lesson.quiz.questions.length > 0 ? (
              <div className="mt-12">
                <Quiz
                  quizId={lesson.quiz.id}
                  title={lesson.quiz.title}
                  passingScore={lesson.quiz.passingScore}
                  signedIn={Boolean(session)}
                  returnTo={returnTo}
                  questions={lesson.quiz.questions.map((question) => ({
                    id: question.id,
                    prompt: question.prompt,
                    kind: question.kind,
                    explanation: question.explanation,
                    // Correct answers are deliberately not sent to the client —
                    // grading happens server-side in submitQuizAction.
                    answers: question.answers.map((answer) => ({
                      id: answer.id,
                      text: answer.text,
                    })),
                  }))}
                />
              </div>
            ) : null}

            {glossaryTerms.length > 0 ? (
              <section className="mt-12">
                <p className="label-tech mb-3">Terms used in this lesson</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {glossaryTerms.map((term) => (
                    <Link
                      key={term.slug}
                      href={`/glossary/${term.slug}`}
                      className="group rounded-panel border border-line bg-surface-1 p-4 transition hover:border-signal/50"
                    >
                      <p className="font-medium text-text-1 group-hover:text-signal">
                        {term.term}
                        {term.abbreviation ? (
                          <span className="ml-1.5 font-mono text-xs text-text-3">
                            {term.abbreviation}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-text-3">{term.simple}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* ------------------------------------------------ Complete + nav */}
            <div className="mt-12 border-t border-line pt-8">
              <LessonProgressBar
                lessonId={lesson.id}
                isComplete={isComplete}
                signedIn={Boolean(session)}
                returnTo={returnTo}
                nextHref={next ? `/learn/${course.slug}/${next.slug}` : `/learn/${course.slug}`}
                nextLabel={next ? next.title : "Back to the course"}
              />

              <nav className="mt-6 grid gap-3 sm:grid-cols-2">
                {previous ? (
                  <Link
                    href={`/learn/${course.slug}/${previous.slug}`}
                    className="group rounded-panel border border-line bg-surface-1 p-4 transition hover:border-signal/50"
                  >
                    <span className="label-tech">← Previous</span>
                    <span className="mt-1 block font-medium text-text-1 group-hover:text-signal">
                      {previous.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}

                {next ? (
                  <Link
                    href={`/learn/${course.slug}/${next.slug}`}
                    className="group rounded-panel border border-line bg-surface-1 p-4 text-right transition hover:border-signal/50 sm:col-start-2"
                  >
                    <span className="label-tech">Next →</span>
                    <span className="mt-1 block font-medium text-text-1 group-hover:text-signal">
                      {next.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            </div>
          </article>

          {/* ------------------------------------------------------- Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <Panel className="overflow-hidden">
                <div className="border-b border-line bg-surface-2 px-4 py-2.5">
                  <p className="label-tech">{course.title}</p>
                </div>
                <LessonOutline
                  courseSlug={course.slug}
                  currentSlug={lesson.slug}
                  lessons={outline.map((item) => ({
                    slug: item.slug,
                    title: item.title,
                    moduleTitle: item.moduleTitle,
                    complete: completedIds.has(item.id),
                  }))}
                />
              </Panel>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
