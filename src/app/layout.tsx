import type { Metadata, Viewport } from "next";

import "./globals.css";

import { getSession } from "@/lib/auth/session";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { themeInitScript } from "@/components/site/theme";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Robotics Academy — Learn robotics from zero to advanced",
    template: "%s · Robotics Academy",
  },
  description:
    "A structured robotics curriculum: fundamentals, programming, electronics, sensors, kinematics, control, ROS 2, computer vision and industrial robotics — taught by building real projects.",
  keywords: [
    "learn robotics",
    "robotics course",
    "ROS 2 tutorial",
    "robot kinematics",
    "PID control",
    "industrial robotics",
    "robotics projects",
  ],
  openGraph: {
    type: "website",
    siteName: "Robotics Academy",
    title: "Learn robotics from zero to advanced — by building real projects",
    description:
      "Sixteen levels from absolute beginner to professional robotics engineering, with interactive simulators, code and hands-on projects.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Robotics Academy",
    description: "Learn robotics from zero to advanced — by building real projects.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#080b10" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-signal focus:px-4 focus:py-2 focus:text-surface-0"
        >
          Skip to content
        </a>

        <Header user={session ? { name: session.name, role: session.role } : null} />

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
