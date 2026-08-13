# Robotics Academy — Handover Documentation

**For whoever maintains this next.** Assumes you can use a terminal, but not that you know this
project, Next.js, or Prisma. Read sections 1–3 to get it running; the rest is reference.

| | |
| --- | --- |
| **Repository** | https://github.com/Dinoopdas/robotics-academy |
| **Local path** | `C:\Users\dinoo\Desktop\Robotics-full-course\robotics-academy` |
| **Branch** | `main` |
| **Live site** | See `CREDENTIALS.local.md` (kept out of this repo) |
| **Credentials** | `CREDENTIALS.local.md` — **not** in git, ask the project owner |
| **Last updated** | 13 August 2026 |

---

## 1. What this is

A web-based robotics course. Sixteen levels from "what is a robot?" to industrial robotics, with
written lessons, quizzes, hands-on projects, interactive simulators, a glossary and a
troubleshooting knowledge base.

It is **not** a static site. It has a database, user accounts, progress tracking and a small
content-management area. That shapes everything else in this document.

### Current scale

| Thing | Count |
| --- | --- |
| Roadmap levels (tracks) | 16 |
| Courses | 24 (14 published, 10 outline-only) |
| Lessons | 28 |
| Quizzes | 28 |
| Projects | 5 |
| Interactive simulators | 11 |
| Glossary terms | 74 |
| Troubleshooting entries | 7 |
| Coding challenges | 5 |
| Search index documents | 153 |

### Technology

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16.3.0 |
| Language | TypeScript | 5.x |
| UI | React | 19.2.8 |
| Styling | Tailwind CSS | 4.x |
| Database | PostgreSQL | — |
| ORM | Prisma | 7.9.1 |
| Auth | Custom — `jose` JWT + `bcryptjs` | — |
| Code highlighting | Shiki (server-side) | 4.x |
| Maths rendering | KaTeX (server-side) | 0.18 |
| Hosting | Vercel | — |

Requires **Node.js 20.9 or newer** (developed on v24.15.0).

---

## 2. Get it running locally

```bash
cd /d C:\Users\dinoo\Desktop\Robotics-full-course\robotics-academy
npm install
npm run dev
```

Open <http://localhost:3000>.

`npm install` automatically runs `prisma generate` (a `postinstall` hook), which creates the
database client code in `src/generated/prisma`. That folder is **not** in git and is rebuilt on
every install — do not be alarmed that it is missing from a fresh clone.

### If you are starting from a fresh clone

You also need a `.env` file, which is deliberately not in git because it holds secrets:

1. Copy `.env.example` to `.env`
2. Fill in the values from `CREDENTIALS.local.md`
3. Run `npm run setup` (creates tables + loads all content)

### If you need your own database

```bash
npx create-db@latest create --env .env
```

Gives you a free PostgreSQL database in about ten seconds with no signup and writes the connection
string into `.env`. **An unclaimed database is deleted after 24 hours** — fine for experimenting,
not for anything real. For permanence, claim it or use a free [Neon](https://neon.tech) or
[Supabase](https://supabase.com) project.

Then `npm run setup`.

---

## 3. The three places this project lives

Understanding this prevents most confusion.

```
YOUR COMPUTER                GITHUB                      VERCEL
─────────────                ──────                      ──────
source code        ──push──▶ source code      ──build──▶ the live website
.env (secrets)     ✗ never                                env vars (secrets)
                             │                            │
                             └── auto-deploys on push ────┘

                    ┌──────────────────────────────┐
                    │   PostgreSQL database        │
                    │   (Prisma Postgres, us-east) │
                    └──────────────────────────────┘
                         ▲                    ▲
                   your computer          the live site
                   (npm run dev)          (both share ONE database)
```

**Both your local dev server and the live site talk to the same database.** There is no separate
staging database. If you delete content locally, it disappears from the live site too. Be careful
with `npm run db:seed` and `npm run db:reset`.

> If you want a safe place to experiment, run `npx create-db@latest create --env .env` to get a
> throwaway database, work against that, and restore the real connection string when finished.

---

## 4. Database

### What is stored

Two kinds of data, and the distinction matters:

| Kind | Examples | Source of truth |
| --- | --- | --- |
| **Content** | Courses, lessons, quizzes, projects, glossary | The TypeScript files in `src/content` |
| **User data** | Accounts, progress, quiz scores, achievements | The database only |

Content is *authored in code* and loaded into the database by a seed script. User data exists
**only** in the database and has no backup — treat it accordingly.

### Commands

| Command | What it does | Safe? |
| --- | --- | --- |
| `npm run db:push` | Applies schema changes to the database | Yes |
| `npm run db:seed` | Reloads all content from `src/content` | **Deletes all progress** |
| `npm run db:studio` | Opens a visual database browser | Yes, read-only unless you edit |
| `npm run db:reset` | Wipes everything and reloads | **Destroys all user data** |

> `db:seed` deletes and recreates every lesson. Because progress rows point at lesson IDs, it also
> clears user progress. User *accounts* survive; their progress does not. There is no way around
> this short of writing a proper migration.

### Inspecting the database

```bash
npm run db:studio
```

Opens a browser UI at <http://localhost:5555> where you can view and edit any table.

### Schema changes

The schema is `prisma/schema.prisma`. After editing:

```bash
npx prisma generate
npm run db:push
```

Two constraints on the schema that look odd but are deliberate:

- **No enums.** Status and kind columns are `String`, constrained by TypeScript unions in
  `src/lib/enums.ts`.
- **No list columns.** Arrays and structured values are JSON-encoded strings, read back through
  typed helpers in `src/lib/content/parse.ts`.

Both began as SQLite limitations. They were kept after the move to PostgreSQL because they make the
schema portable — the migration needed zero model changes. If you add a column, follow the pattern.

---

## 5. Deployment

### How it works

Vercel watches the GitHub repository. **Every push to `main` triggers a rebuild and deploys
automatically.** There is no manual deploy step.

```bash
cd /d C:\Users\dinoo\Desktop\Robotics-full-course\robotics-academy
git add -A
git commit -m "describe what you changed"
git push
```

Then watch the build at <https://vercel.com/dashboard>. Takes 2–4 minutes.

### Environment variables

Set in **Vercel → your project → Settings → Environment Variables**. Values are in
`CREDENTIALS.local.md`.

| Variable | Purpose | Consequence if wrong |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Site fails entirely |
| `AUTH_SECRET` | Signs session cookies | Everyone is logged out; sessions break |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL | Wrong links in sitemap and social previews |

> `NEXT_PUBLIC_SITE_URL` is **baked in at build time**. Changing it in Vercel does nothing until you
> redeploy. Any variable prefixed `NEXT_PUBLIC_` behaves this way and is visible in the browser, so
> never put a secret behind that prefix.

### Deploying to a different host

Vercel is not special here. Anything that runs Node.js works: Railway, Render, Fly.io, a VPS. The
requirements are Node 20.9+, the three environment variables, `npm install && npm run build`, then
`npm start`.

**GitHub Pages will never work.** It serves static files only, and this app renders every page on
the server, uses cookies, and has server actions. A static export would drop authentication,
progress, quizzes, search and the admin area.

---

## 6. Making changes

### Editing a lesson's wording — two ways

**Through the website** (quick fixes, no deploy):
Sign in as an admin → **Admin** → pick a course → pick a lesson → edit → Save. Changes appear
immediately and search is re-indexed.

**Through the code** (the durable way):
Edit the relevant file in `src/content/courses/`, then `npm run db:seed`.

> These two can fight each other. `db:seed` overwrites the database with what is in the files, so
> any admin-panel edit is lost the next time someone seeds. **Treat the files as the source of
> truth** and use the admin panel only for urgent fixes you then copy back into the files.

### Adding a lesson

1. Open the right file in `src/content/courses/` — e.g. `orientation.ts` for Level 0
2. Add a `LessonSource` object to a module's `lessons` array
3. Run `npm run db:seed`
4. Check it at `/learn/<course-slug>/<lesson-slug>`

The seed **validates everything before writing**. If you reference a glossary term, course or
challenge that does not exist, it prints the problem and refuses to seed. That is intentional — it
turns a broken link into an error you see immediately.

A minimal lesson:

```ts
{
  slug: "what-is-torque",
  title: "What is torque?",
  summary: "One sentence shown in listings and search results.",
  estimatedMinutes: 10,
  objectives: ["Define torque", "Calculate it for a robot joint"],
  keyTerms: ["torque"],          // must exist in src/content/glossary.ts
  blocks: [
    { type: "prose", text: "Torque is **turning force**." },
    { type: "math", latex: "\\tau = r \\times F" },
    { type: "summary", points: ["Torque is rotational force"] },
  ],
}
```

### Lesson block types

Lessons are arrays of typed blocks, not markdown. Full definitions in `src/lib/content/types.ts`.

| Block | Purpose |
| --- | --- |
| `prose` | A paragraph |
| `heading` | Section break |
| `ladder` | Same idea explained at increasing depth |
| `flow` | Arrow diagram of a process |
| `diagram` | Named SVG schematic |
| `math` | KaTeX formula with symbol definitions |
| `code` | Syntax-highlighted code with per-line notes |
| `callout` | Note, tip, warning, common mistake, insight |
| `list` / `steps` / `table` / `compare` | Structured content |
| `example` | Worked robotics example |
| `interactive` | Embeds a simulator |
| `check` | Question with a hidden answer |
| `challenge` | Exercise with optional hints |
| `summary` | Closing bullet points |
| `deepdive` | Question-and-answer panel |

Inline formatting inside text fields: `**bold**`, `` `code` ``, `*italic*`, `$maths$`,
`[label](/link)`.

### Available simulators

Reference by key in an `interactive` block:

`arm-fk` · `arm-ik` · `dof-explorer` · `frame-viewer` · `transform-visualiser` · `pid-simulator` ·
`diff-drive` · `pwm-visualiser` · `ohms-law` · `sensor-sim` · `python-playground`

```ts
{ type: "interactive", widget: "pid-simulator", title: "Tune it yourself" }
```

### Available diagrams

`mobile-robot-anatomy` · `joint-types` · `accuracy-repeatability` · `workspace-shell` ·
`quadrature` · `ik-two-solutions` · `tcp-frames`

### Adding a simulator

1. Write the component in `src/components/interactive/`
2. Add a lazy import and a `case` in `src/components/interactive/registry.tsx`
3. Reference it from a lesson, or add a `SimulationSource` in `src/content/practice.ts`

### Publishing a planned course

Ten courses exist with a syllabus but no lessons. They show on the roadmap marked "being written"
and their pages say so honestly. To publish one: add modules and lessons in
`src/content/courses/planned.ts`, remove `planned: true`, delete the `outline`, then `npm run db:seed`.

---

## 7. Where everything lives

```
robotics-academy/
├── prisma/
│   ├── schema.prisma          Database structure
│   └── seed.ts                Loads content into the database
├── src/
│   ├── content/               ← ALL COURSE CONTENT (edit here)
│   │   ├── courses/           Lessons, grouped by subject
│   │   ├── glossary.ts        74 terms
│   │   ├── projects.ts        Hands-on projects
│   │   ├── practice.ts        Challenges, simulators, troubleshooting
│   │   ├── skills.ts          Skill tree + achievements
│   │   ├── tracks.ts          The 16 roadmap levels
│   │   └── index.ts           Aggregates + validates cross-references
│   ├── app/                   Pages and URLs
│   ├── components/
│   │   ├── lesson/            Renders lesson blocks; quiz
│   │   ├── interactive/       The simulators
│   │   ├── diagrams/          SVG schematics
│   │   └── ui/                Buttons, cards, badges
│   └── lib/
│       ├── db.ts              Database connection
│       ├── auth/              Sessions and passwords
│       ├── actions/           Server-side write operations
│       ├── queries.ts         Shared database reads
│       └── search.ts          Search ranking
├── .env                       SECRETS — never committed
└── CREDENTIALS.local.md       SECRETS — never committed
```

**Folder-to-URL mapping:** `src/app/projects/[slug]/page.tsx` serves `/projects/anything`. The
square brackets mean "any value here".

---

## 8. Things that will bite you

Each of these cost real debugging time. They are fixed in the code; this is so you understand *why*
the code looks the way it does, and do not undo them.

### Database connection limits

`next build` runs several workers in parallel, and each opens its own connection pool. Total
connections are `workers × pool size`. A pool of 10 became ~70 connections and the database refused
them — **the build failed outright**. `src/lib/db.ts` caps the pool at 1 during builds and on
serverless. Do not raise it.

### The generated Prisma client is not in git

`src/generated/prisma` is gitignored, so a fresh clone has no database client. The `postinstall`
script regenerates it on every `npm install`. Remove that script and every deploy breaks.

### Sessions outlive their accounts

Sessions are stateless JWTs. If a user is deleted — or the database is reset — their cookie stays
valid and the app used to render a blank page. `requireUserPage` and `getLiveSession` now confirm
the user still exists and redirect to sign-in. Keep that check.

### Everything is dynamic

Every page is server-rendered per request, because the root layout reads cookies to show sign-in
state. Do not expect static-site behaviour or attempt `output: 'export'`.

### Local development feels slow

The database is in the US. From India each query is a long round trip, so local pages can take
several seconds. **The live site is fast** because Vercel and the database sit in the same region.
Do not chase this as a performance bug.

### Never commit secrets

`.env` and `CREDENTIALS.local.md` are gitignored. This matters: a default admin password was once
committed in `.env.example`, and it stayed readable in the public git history even after removal.
The account was deleted and the seed script now refuses weak passwords. **Git history is
permanent** — if a live secret is ever committed, rotate it rather than just deleting the line.

---

## 9. Accounts and access

### Admin access

Whoever signs up **first** on a fresh database becomes the admin automatically. There is no default
admin account and no password stored anywhere — deliberate, given the leak described above.

To make an existing user an admin:

```bash
npm run db:studio
```

Open the `User` table, find the row, change `role` from `USER` to `ADMIN`, save.

### What admins can do

- Edit course titles, descriptions and publication status
- Edit any lesson's text, blocks and metadata
- See platform statistics

Admins **cannot** create courses or modules. That is on purpose — new content goes through
`src/content` so cross-references get validated.

---

## 10. What is built, and what is not

### Working

Homepage · 16-level roadmap · courses and lessons · quizzes with server-side marking · 5 projects ·
11 simulators · coding challenges · glossary · troubleshooting · ranked search · skill tree ·
progress tracking, streaks and achievements · sign-up and sign-in · admin editing · sitemap and SEO
metadata · dark and light themes · responsive to 375 px.

### Not built — and not faked in the interface

- **10 of 24 courses have no lessons.** They appear on the roadmap with a published syllabus and are
  clearly labelled "being written". This is honest, not broken.
- **3D robot models.** Simulators are 2D SVG and fully functional.
- **Automatic challenge marking.** Challenges have test cases, hints and solutions; the code runner
  executes your code but does not check it against the cases.
- **Certificates** for completing a path. Achievements and badges do work.
- **Community features** and the **AI tutor** described in the original brief.

### If a visitor reports a bug

1. Check the Vercel dashboard for build or runtime errors
2. Reproduce locally with `npm run dev`
3. `npm run typecheck` and `npm run lint` catch a surprising amount
4. `/troubleshooting` on the site documents robotics problems, not software ones

---

## 11. Routine tasks

| Task | How |
| --- | --- |
| Fix a typo in a lesson | Admin panel, or edit `src/content/courses/*.ts` + `npm run db:seed` |
| Add a lesson | Edit `src/content/courses/*.ts` + `npm run db:seed` |
| Add a glossary term | Edit `src/content/glossary.ts` + `npm run db:seed` |
| Deploy a change | `git add -A && git commit -m "..." && git push` |
| See who signed up | `npm run db:studio` → `User` table |
| Make someone an admin | `npm run db:studio` → `User` → set `role` to `ADMIN` |
| Change the site URL | Update `NEXT_PUBLIC_SITE_URL` in Vercel, then redeploy |
| Change the browser tab icon | Edit `src/app/icon.svg` (design it to read at 16px) |
| Change the site logo | Edit `src/components/site/logo.tsx` |
| Rotate the auth secret | New `AUTH_SECRET` in Vercel + redeploy (logs everyone out) |
| Check for errors | Vercel dashboard → Deployments → Runtime Logs |

---

## 12. Getting help

- **Next.js** — <https://nextjs.org/docs>. Version-matched docs also ship in
  `node_modules/next/dist/docs/`, which is more reliable than search results for this version.
- **Prisma** — <https://www.prisma.io/docs>
- **Tailwind CSS** — <https://tailwindcss.com/docs>

The code is commented where a decision is non-obvious. If something looks strange, the comment
above it usually explains what went wrong the other way.
