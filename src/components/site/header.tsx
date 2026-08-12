"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { LEARN_AREAS, PRIMARY_NAV, RESOURCE_NAV } from "@/lib/navigation";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme";
import { Logo } from "./logo";

interface HeaderProps {
  user: { name: string; role: string } | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<"learn" | "resources" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Any navigation closes whatever was open. Adjusting during render rather
  // than in an effect means the menu never paints open on the new page first.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMenu(null);
    setMobileOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-0/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Robotics Academy home">
          <Logo className="h-7 w-7" />
          <span className="hidden text-[15px] font-semibold tracking-tight sm:block">
            Robotics<span className="text-signal">Academy</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 md:flex" onMouseLeave={() => setMenu(null)}>
          {PRIMARY_NAV.map((item) => {
            const dropdown =
              item.href === "/learn" ? "learn" : item.href === "/resources" ? "resources" : null;

            return (
              <div key={item.href} className="relative">
                <Link
                  href={dropdown === "resources" ? "/glossary" : item.href}
                  onMouseEnter={() => setMenu(dropdown as "learn" | "resources" | null)}
                  onFocus={() => setMenu(dropdown as "learn" | "resources" | null)}
                  className={cn(
                    "flex h-9 items-center gap-1 rounded-lg px-3 text-sm transition",
                    isActive(item.href)
                      ? "bg-surface-2 text-text-1"
                      : "text-text-2 hover:bg-surface-2 hover:text-text-1",
                  )}
                >
                  {item.label}
                  {dropdown ? (
                    <svg viewBox="0 0 24 24" className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  ) : null}
                </Link>

                {dropdown === "learn" && menu === "learn" ? (
                  <div className="absolute top-full left-0 w-[36rem] pt-2">
                    <div className="grid grid-cols-2 gap-1 rounded-panel border border-line-strong bg-surface-1 p-2 shadow-2xl">
                      {LEARN_AREAS.map((area) => (
                        <Link
                          key={area.href}
                          href={area.href}
                          className="rounded-lg px-3 py-2 transition hover:bg-surface-2"
                        >
                          <span className="block text-sm font-medium text-text-1">{area.label}</span>
                          <span className="block text-xs text-text-3">{area.blurb}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {dropdown === "resources" && menu === "resources" ? (
                  <div className="absolute top-full left-0 w-72 pt-2">
                    <div className="rounded-panel border border-line-strong bg-surface-1 p-2 shadow-2xl">
                      {RESOURCE_NAV.map((res) => (
                        <Link
                          key={res.href}
                          href={res.href}
                          className="block rounded-lg px-3 py-2 transition hover:bg-surface-2"
                        >
                          <span className="block text-sm font-medium text-text-1">{res.label}</span>
                          <span className="block text-xs text-text-3">{res.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />

          {user ? (
            <Link
              href="/dashboard"
              className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-1 pr-3 pl-1.5 text-sm transition hover:border-signal/50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-signal font-mono text-xs font-bold text-surface-0">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-24 truncate sm:inline">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="flex h-9 items-center rounded-lg px-3 text-sm text-text-2 transition hover:bg-surface-2 hover:text-text-1"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex h-9 items-center rounded-lg bg-signal px-3.5 text-sm font-medium text-surface-0 transition hover:bg-signal-strong"
              >
                Start free
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-2 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-line bg-surface-1 md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid grid-cols-2 gap-1">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href === "/resources" ? "/glossary" : item.href}
                  className="rounded-lg px-3 py-2.5 text-sm text-text-1 transition hover:bg-surface-2"
                >
                  {item.label}
                  <span className="block text-xs text-text-3">{item.description}</span>
                </Link>
              ))}
            </div>
            {!user ? (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
                <Link
                  href="/login"
                  className="flex h-10 items-center justify-center rounded-lg border border-line text-sm"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex h-10 items-center justify-center rounded-lg bg-signal text-sm font-medium text-surface-0"
                >
                  Start free
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
