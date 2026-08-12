import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseStrings, parseTestCases } from "@/lib/content/parse";
import { highlight } from "@/lib/highlight";
import {
  Badge,
  Breadcrumbs,
  Container,
  DifficultyBadge,
  Panel,
} from "@/components/ui/primitives";
import { ChallengeWorkspace } from "@/components/challenge/workspace";

export async function generateStaticParams() {
  const challenges = await prisma.challenge.findMany({ select: { slug: true } });
  return challenges.map((challenge) => ({ slug: challenge.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await prisma.challenge.findUnique({
    where: { slug },
    select: { title: true, prompt: true },
  });

  if (!challenge) return { title: "Challenge not found" };

  return {
    title: challenge.title,
    description: challenge.prompt.slice(0, 160),
    alternates: { canonical: `/challenges/${slug}` },
  };
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge) notFound();

  const hints = parseStrings(challenge.hints);
  const testCases = parseTestCases(challenge.testCases);
  const solutionHtml = await highlight(challenge.solution, challenge.language);

  return (
    <>
      <div className="border-b border-line bg-surface-1">
        <Container size="wide" className="py-4">
          <Breadcrumbs
            items={[{ label: "Challenges", href: "/challenges" }, { label: challenge.title }]}
          />
        </Container>
      </div>

      <Container size="wide" className="py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={challenge.difficulty} />
              <Badge>{challenge.category}</Badge>
              <Badge>{challenge.language}</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">{challenge.title}</h1>

            <div className="mt-5 space-y-5">
              <div>
                <p className="label-tech mb-2">The problem</p>
                <p className="prose-lesson">{challenge.prompt}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Panel className="p-4">
                  <p className="label-tech mb-1.5">Input</p>
                  <p className="font-mono text-sm text-text-2">{challenge.inputSpec}</p>
                </Panel>
                <Panel className="p-4">
                  <p className="label-tech mb-1.5">Output</p>
                  <p className="font-mono text-sm text-text-2">{challenge.outputSpec}</p>
                </Panel>
              </div>

              {testCases.length > 0 ? (
                <div>
                  <p className="label-tech mb-2">Test cases</p>
                  <div className="scrollbar-slim overflow-x-auto rounded-panel border border-line">
                    <table className="w-full min-w-[34rem] border-collapse text-sm">
                      <thead>
                        <tr className="bg-surface-2">
                          <th className="border-b border-line px-3.5 py-2 text-left font-mono text-[11px] tracking-wide text-text-2 uppercase">
                            Input
                          </th>
                          <th className="border-b border-line px-3.5 py-2 text-left font-mono text-[11px] tracking-wide text-text-2 uppercase">
                            Expected
                          </th>
                          <th className="border-b border-line px-3.5 py-2 text-left font-mono text-[11px] tracking-wide text-text-2 uppercase">
                            Why
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {testCases.map((testCase, index) => (
                          <tr key={index} className="border-b border-line last:border-0">
                            <td className="px-3.5 py-2 font-mono text-xs text-text-1">
                              {testCase.input}
                            </td>
                            <td className="px-3.5 py-2 font-mono text-xs text-emerald">
                              {testCase.expected}
                            </td>
                            <td className="px-3.5 py-2 text-text-2">{testCase.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <ChallengeWorkspace
                starterCode={challenge.starterCode}
                hints={hints}
                solutionHtml={solutionHtml}
                explanation={challenge.explanation}
              />
            </div>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Panel className="p-5">
              <p className="label-tech mb-2">How to work on this</p>
              <ol className="space-y-2 text-sm text-text-2">
                <li className="flex gap-2">
                  <span className="font-mono text-xs text-signal">1.</span>
                  <span>Read the input and output specification carefully — including the edge cases in the test table.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-xs text-signal">2.</span>
                  <span>Write your attempt in the editor and run it. It executes in your browser.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-xs text-signal">3.</span>
                  <span>Check your output against every test case, not just the first.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-xs text-signal">4.</span>
                  <span>Take hints one at a time. Only then read the solution — and read the explanation even if you got it right.</span>
                </li>
              </ol>
            </Panel>
          </aside>
        </div>
      </Container>
    </>
  );
}
