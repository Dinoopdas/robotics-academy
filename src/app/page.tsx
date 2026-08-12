import Link from "next/link";

import { prisma } from "@/lib/db";
import { getPlatformStats, getRecommendation, getRoadmap } from "@/lib/queries";
import { getSession } from "@/lib/auth/session";
import {
  Badge,
  CardLink,
  Container,
  DifficultyBadge,
  LinkButton,
  Panel,
  SectionHeading,
} from "@/components/ui/primitives";
import { HeroArm } from "@/components/site/hero-arm";

export default async function HomePage() {
  const [stats, recommendation, tracks, session, featuredProjects, featuredSimulations] =
    await Promise.all([
      getPlatformStats(),
      getRecommendation(),
      getRoadmap(),
      getSession(),
      prisma.project.findMany({ orderBy: { position: "asc" }, take: 3 }),
      prisma.simulation.findMany({ orderBy: { position: "asc" }, take: 4 }),
    ]);

  const publishedTracks = tracks.filter((track) =>
    track.courses.some((course) => course.published),
  );

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="bg-grid relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-0" />

        <Container size="wide" className="relative py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <Badge tone="cyan">16 levels · zero to professional</Badge>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Learn robotics from zero to advanced —{" "}
                <span className="text-signal">by building real projects.</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg text-text-2">
                A structured path from “what is a robot?” to designing, programming, simulating and
                troubleshooting real robotic systems. Every concept is taught through the robotics
                problem that needs it.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href={recommendation?.href ?? "/learn"} size="lg">
                  {session ? "Continue learning" : "Start learning"}
                </LinkButton>
                <LinkButton href="/roadmap" variant="secondary" size="lg">
                  Browse the curriculum
                </LinkButton>
              </div>

              {recommendation ? (
                <Link
                  href={recommendation.href}
                  className="mt-6 inline-flex max-w-md items-center gap-3 rounded-lg border border-line bg-surface-1 px-4 py-3 transition hover:border-signal/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-signal-soft text-signal">
                    →
                  </span>
                  <span className="min-w-0">
                    <span className="label-tech block">{recommendation.reason}</span>
                    <span className="block truncate text-sm font-medium text-text-1">
                      {recommendation.title}
                    </span>
                  </span>
                </Link>
              ) : null}

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {[
                  { label: "Lessons", value: stats.lessons },
                  { label: "Projects", value: stats.projects },
                  { label: "Simulators", value: stats.simulations },
                  { label: "Glossary terms", value: stats.glossaryTerms },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="label-tech">{stat.label}</dt>
                    <dd className="mt-0.5 font-mono text-2xl font-semibold text-text-1">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative hidden lg:block">
              <HeroArm />
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Roadmap */}
      <Container size="wide" className="py-16">
        <SectionHeading
          eyebrow="The path"
          title="Sixteen levels, in order"
          description="Each level's outcome is the next one's prerequisite. Start at Level 0 with no prior knowledge, or jump in wherever you already are."
          action={
            <LinkButton href="/roadmap" variant="secondary" size="sm">
              Full roadmap
            </LinkButton>
          }
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((track) => {
            const publishedCourses = track.courses.filter((c) => c.published);
            const lessonTotal = publishedCourses.reduce((sum, c) => sum + c._count.lessons, 0);
            const ready = lessonTotal > 0;

            return (
              <CardLink
                key={track.id}
                href={`/roadmap#level-${track.level}`}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-signal">
                    LEVEL {track.level}
                  </span>
                  {ready ? (
                    <span className="font-mono text-[10px] text-text-3">{lessonTotal} lessons</span>
                  ) : (
                    <span className="font-mono text-[10px] text-amber">planned</span>
                  )}
                </div>
                <p className="mt-1.5 font-medium text-text-1 group-hover:text-signal">
                  {track.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-text-3">{track.subtitle}</p>
              </CardLink>
            );
          })}
        </div>
      </Container>

      {/* ------------------------------------------------------- How it works */}
      <section className="border-y border-line bg-surface-1">
        <Container size="wide" className="py-16">
          <SectionHeading
            eyebrow="The method"
            title="Learn → Understand → Simulate → Code → Build → Test → Troubleshoot"
            description="Reading about robotics does not make you a roboticist. Every major topic ends in something you build, run and debug."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Explanations that climb",
                body: "Every concept starts in plain language, becomes an engineering statement, then a mathematical model. Stop at whichever rung you need today and come back for the next one.",
                example: "“A motor turns the robot” → “A motor produces torque” → τ = Kt · I",
              },
              {
                title: "Interactive, not illustrated",
                body: "Tune a real PID controller and watch overshoot respond. Drag an inverse-kinematics target past the workspace boundary and see the solver report it honestly.",
                example: `${stats.simulations} simulators, embedded in the lessons that need them`,
              },
              {
                title: "Projects with the failures included",
                body: "Every project has a troubleshooting section written from the failures that actually happen — angled walls that return no echo, motors browning out the controller.",
                example: `${stats.projects} projects from blinking an LED to vision-guided picking`,
              },
            ].map((item) => (
              <Panel key={item.title} className="p-5">
                <h3 className="font-semibold text-text-1">{item.title}</h3>
                <p className="mt-2 text-sm text-text-2">{item.body}</p>
                <p className="mt-3 border-t border-line pt-3 font-mono text-xs text-text-3">
                  {item.example}
                </p>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------------- Courses */}
      <Container size="wide" className="py-16">
        <SectionHeading
          eyebrow="Available now"
          title="Courses ready to study"
          description="Written end to end, with quizzes, interactive exercises and worked examples."
          action={
            <LinkButton href="/learn" variant="secondary" size="sm">
              All courses
            </LinkButton>
          }
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publishedTracks
            .flatMap((track) =>
              track.courses
                .filter((course) => course.published)
                .map((course) => ({ course, track })),
            )
            .slice(0, 6)
            .map(({ course, track }) => (
              <CardLink key={course.id} href={`/learn/${course.slug}`} className="p-5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-text-3">L{track.level}</span>
                  <DifficultyBadge difficulty={course.difficulty} />
                </div>
                <h3 className="mt-2.5 font-semibold text-text-1 group-hover:text-signal">
                  {course.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-text-2">{course.subtitle}</p>
                <p className="mt-3 border-t border-line pt-3 font-mono text-xs text-text-3">
                  {course._count.lessons} lessons · {Math.round(course.estimatedMinutes / 60)} h
                </p>
              </CardLink>
            ))}
        </div>
      </Container>

      {/* --------------------------------------------------------- Simulators */}
      <section className="border-y border-line bg-surface-1">
        <Container size="wide" className="py-16">
          <SectionHeading
            eyebrow="Simulations"
            title="Change a number, watch the robot respond"
            description="Every simulator runs in your browser. No installation, no account needed."
            action={
              <LinkButton href="/simulations" variant="secondary" size="sm">
                All simulators
              </LinkButton>
            }
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredSimulations.map((simulation) => (
              <CardLink
                key={simulation.id}
                href={`/simulations/${simulation.slug}`}
                className="p-5"
              >
                <Badge tone="cyan">{simulation.category}</Badge>
                <h3 className="mt-2.5 font-semibold text-text-1 group-hover:text-signal">
                  {simulation.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-sm text-text-2">{simulation.description}</p>
              </CardLink>
            ))}
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------------- Projects */}
      <Container size="wide" className="py-16">
        <SectionHeading
          eyebrow="Build something"
          title="Projects, from first LED to vision-guided picking"
          description="Each one follows the same nine sections — overview, architecture, theory, build, code, test, troubleshooting, challenge, expected result."
          action={
            <LinkButton href="/projects" variant="secondary" size="sm">
              All projects
            </LinkButton>
          }
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featuredProjects.map((project) => (
            <CardLink key={project.id} href={`/projects/${project.slug}`} className="p-5">
              <div className="flex items-center justify-between gap-2">
                <DifficultyBadge difficulty={project.difficulty} />
                <span className="font-mono text-xs text-text-3">~{project.estimatedHours} h</span>
              </div>
              <h3 className="mt-2.5 font-semibold text-text-1 group-hover:text-signal">
                {project.title}
              </h3>
              <p className="mt-1.5 line-clamp-3 text-sm text-text-2">{project.summary}</p>
            </CardLink>
          ))}
        </div>
      </Container>

      {/* -------------------------------------------------------------- CTA */}
      <Container size="wide" className="pb-20">
        <Panel className="bg-grid overflow-hidden">
          <div className="grid items-center gap-8 p-8 lg:grid-cols-[1.4fr_1fr] lg:p-12">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                A person with zero robotics knowledge should be able to finish this and build real
                systems.
              </h2>
              <p className="mt-3 max-w-xl text-text-2">
                That is the entire design goal. Browsing needs no account — create one only when you
                want progress tracking, quiz scores, the skill tree and your streak.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton href={session ? "/dashboard" : "/signup"} size="lg">
                  {session ? "Go to your dashboard" : "Create a free account"}
                </LinkButton>
                <LinkButton href="/learn" variant="secondary" size="lg">
                  Just start reading
                </LinkButton>
              </div>
            </div>

            <ul className="space-y-2.5">
              {[
                "Track every lesson, quiz and project you finish",
                "See your skill tree fill in as courses complete",
                "Earn achievements and keep a study streak",
                "Bookmark anything to come back to",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-text-2">
                  <span aria-hidden="true" className="mt-[3px] text-signal">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </Container>
    </>
  );
}
