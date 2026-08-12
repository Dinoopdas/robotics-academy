import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Every lesson, project, glossary term, challenge, simulation and
 * troubleshooting entry gets its own URL in the sitemap. Priorities reflect
 * how likely a page is to be the best answer to a search: a glossary entry for
 * "what is TCP" outranks the course index that merely links to it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, lessons, projects, glossary, challenges, simulations, troubleshooting] =
    await Promise.all([
      prisma.course.findMany({ select: { slug: true, updatedAt: true, published: true } }),
      prisma.lesson.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, course: { select: { slug: true, published: true } } },
      }),
      prisma.project.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.glossaryTerm.findMany({ select: { slug: true } }),
      prisma.challenge.findMany({ where: { published: true }, select: { slug: true } }),
      prisma.simulation.findMany({ where: { published: true }, select: { slug: true } }),
      prisma.troubleshootingEntry.findMany({ select: { slug: true } }),
    ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/roadmap`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/simulations`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/challenges`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${siteUrl}/troubleshooting`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${siteUrl}/skills`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  return [
    ...staticRoutes,
    ...courses
      .filter((course) => course.published)
      .map((course) => ({
        url: `${siteUrl}/learn/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ...lessons
      .filter((lesson) => lesson.course.published)
      .map((lesson) => ({
        url: `${siteUrl}/learn/${lesson.course.slug}/${lesson.slug}`,
        lastModified: lesson.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...glossary.map((term) => ({
      url: `${siteUrl}/glossary/${term.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...challenges.map((challenge) => ({
      url: `${siteUrl}/challenges/${challenge.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...simulations.map((simulation) => ({
      url: `${siteUrl}/simulations/${simulation.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...troubleshooting.map((entry) => ({
      url: `${siteUrl}/troubleshooting/${entry.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
