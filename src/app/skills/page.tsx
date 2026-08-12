import type { Metadata } from "next";
import Link from "next/link";

import { getSkillTree } from "@/lib/queries";
import { Badge, Container, LinkButton, Panel, ProgressBar } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Robotics skill tree",
  description:
    "The robotics skill tree: what depends on what, from robotics literacy through programming, electronics and control to ROS 2, perception and advanced autonomy.",
};

const CATEGORY_TONE: Record<string, string> = {
  foundation: "text-signal border-signal/40",
  programming: "text-emerald border-emerald/40",
  electronics: "text-amber border-amber/40",
  math: "text-violet border-violet/40",
  control: "text-signal border-signal/40",
  perception: "text-emerald border-emerald/40",
  integration: "text-violet border-violet/40",
};

export default async function SkillsPage() {
  const skills = await getSkillTree();
  const signedIn = skills[0]?.signedIn ?? false;

  const byTier = new Map<number, typeof skills>();
  for (const skill of skills) {
    const list = byTier.get(skill.tier) ?? [];
    list.push(skill);
    byTier.set(skill.tier, list);
  }

  const tiers = [...byTier.keys()].sort((a, b) => a - b);
  const unlocked = skills.filter((skill) => skill.progress >= 100).length;

  // A skill is "available" once every parent is complete — the same rule the
  // recommendation panel uses, so the two can never disagree.
  const completeSlugs = new Set(skills.filter((s) => s.progress >= 100).map((s) => s.slug));
  const isAvailable = (skill: (typeof skills)[number]) =>
    skill.parents.length === 0 || skill.parents.every((parent) => completeSlugs.has(parent));

  return (
    <>
      <section className="bg-grid border-b border-line">
        <Container size="wide" className="py-12">
          <Badge tone="violet">Progression</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Skill tree</h1>
          <p className="mt-3 max-w-2xl text-lg text-text-2">
            Not a list — a dependency graph. Computer vision and navigation both build on ROS 2 and
            converge again at advanced robotics. Skill progress is derived from the lessons you have
            actually completed, so it can never disagree with your course progress.
          </p>

          {signedIn ? (
            <p className="mt-5 font-mono text-sm text-text-2">
              <span className="text-signal">{unlocked}</span> of {skills.length} skills complete
            </p>
          ) : (
            <div className="mt-6">
              <LinkButton href="/signup?next=/skills">
                Create an account to track your skills
              </LinkButton>
            </div>
          )}
        </Container>
      </section>

      <Container size="wide" className="py-12">
        <div className="space-y-4">
          {tiers.map((tier, tierIndex) => (
            <div key={tier}>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-xs font-semibold tracking-wide text-text-3 uppercase">
                  Tier {tier}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {byTier.get(tier)!.map((skill) => {
                  const available = isAvailable(skill);
                  const complete = skill.progress >= 100;

                  return (
                    <Panel
                      key={skill.id}
                      className={`p-4 transition ${
                        complete
                          ? "border-emerald/40 bg-emerald-soft/20"
                          : available
                            ? ""
                            : "opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-semibold text-text-1">{skill.name}</h2>
                        <span
                          className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                            CATEGORY_TONE[skill.category] ?? "text-text-3 border-line"
                          }`}
                        >
                          {skill.category}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm text-text-2">{skill.description}</p>

                      {signedIn ? (
                        <div className="mt-3">
                          <ProgressBar
                            value={skill.progress}
                            showLabel
                            size="sm"
                            tone={complete ? "emerald" : "signal"}
                          />
                        </div>
                      ) : null}

                      {skill.parents.length > 0 ? (
                        <p className="mt-3 border-t border-line pt-2.5 font-mono text-[10px] text-text-3">
                          needs: {skill.parents.join(", ")}
                        </p>
                      ) : null}

                      {skill.courses.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {skill.courses.map((courseSlug) => (
                            <Link
                              key={courseSlug}
                              href={`/learn/${courseSlug}`}
                              className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-text-3 transition hover:border-signal/50 hover:text-signal"
                            >
                              {courseSlug}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </Panel>
                  );
                })}
              </div>

              {tierIndex < tiers.length - 1 ? (
                <div className="mt-4 flex justify-center text-text-3" aria-hidden="true">
                  ↓
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
