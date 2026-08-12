import Link from "next/link";

import { Container, LinkButton } from "@/components/ui/primitives";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return (
    <Container size="prose" className="py-24 text-center">
      <Logo className="mx-auto h-12 w-12" />

      <p className="label-tech mt-6">Error 404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        That page is outside the workspace
      </h1>
      <p className="mx-auto mt-3 max-w-md text-text-2">
        The link is broken or the page has moved. The search covers every lesson, project, glossary
        term and troubleshooting entry — it is usually the fastest way back.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/">Back to the homepage</LinkButton>
        <LinkButton href="/roadmap" variant="secondary">
          Browse the roadmap
        </LinkButton>
      </div>

      <div className="mt-10 border-t border-line pt-6">
        <p className="label-tech mb-3">Common destinations</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: "All courses", href: "/learn" },
            { label: "Projects", href: "/projects" },
            { label: "Simulations", href: "/simulations" },
            { label: "Glossary", href: "/glossary" },
            { label: "Troubleshooting", href: "/troubleshooting" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-line bg-surface-1 px-3.5 py-1.5 text-sm text-text-2 transition hover:border-signal/50 hover:text-signal"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
