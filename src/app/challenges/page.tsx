import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { Badge, CardLink, Container, DifficultyBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Robotics coding challenges",
  description:
    "Practice problems with test cases, hints and worked solutions — from filtering a noisy sensor to implementing A* path planning.",
};

export default async function ChallengesPage() {
  const challenges = await prisma.challenge.findMany({
    where: { published: true },
    orderBy: [{ position: "asc" }],
  });

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-12">
          <Badge tone="amber">Practice</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Challenges</h1>
          <p className="mt-3 max-w-2xl text-lg text-text-2">
            Small, self-contained problems with a stated input and output, test cases you can check
            against, progressive hints, and a worked solution that explains why the obvious
            implementation is subtly wrong.
          </p>
        </Container>
      </section>

      <Container size="wide" className="py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <CardLink
              key={challenge.id}
              href={`/challenges/${challenge.slug}`}
              className="flex flex-col p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <DifficultyBadge difficulty={challenge.difficulty} />
                <span className="font-mono text-[11px] text-text-3">{challenge.language}</span>
              </div>

              <h2 className="mt-3 font-semibold text-text-1 group-hover:text-signal">
                {challenge.title}
              </h2>
              <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-text-2">{challenge.prompt}</p>

              <p className="mt-3 border-t border-line pt-3 font-mono text-[11px] text-text-3">
                {challenge.category}
              </p>
            </CardLink>
          ))}
        </div>
      </Container>
    </>
  );
}
