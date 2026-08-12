import Link from "next/link";

import { FOOTER_NAV } from "@/lib/navigation";
import { Container } from "@/components/ui/primitives";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-1">
      <Container size="wide" className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <span className="text-[15px] font-semibold tracking-tight">
                Robotics<span className="text-signal">Academy</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-text-2">
              A structured path from “what is a robot?” to designing, programming and
              troubleshooting real robotic systems.
            </p>
          </div>

          {FOOTER_NAV.map((group) => (
            <div key={group.heading}>
              <p className="label-tech mb-3">{group.heading}</p>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-text-2 transition hover:text-signal"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-text-3">
            Learn → Understand → Simulate → Code → Build → Test → Troubleshoot → Improve
          </p>
          <p className="text-xs text-text-3">
            Curriculum content is vendor-neutral. Robot manufacturer names are used only to
            illustrate industry practice.
          </p>
        </div>
      </Container>
    </footer>
  );
}
