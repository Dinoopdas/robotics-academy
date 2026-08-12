import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The project sits inside a directory that holds unrelated apps, so pin the
  // workspace root instead of letting Turbopack infer it from a stray lockfile.
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  experimental: {
    // shiki ships a large grammar set; bundling it server-side keeps the
    // highlighter warm between requests instead of re-resolving on each call.
    optimizePackageImports: ["shiki"],
  },
};

export default nextConfig;
