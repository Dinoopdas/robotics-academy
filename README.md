# Robotics Academy

An interactive robotics learning platform: sixteen levels from "what is a robot?" to designing,
programming, simulating and troubleshooting real robotic systems.

> **Taking over this project?** Start with **[HANDOVER.md](HANDOVER.md)** — how to run it, how the
> database and deployment fit together, how to add content, and the mistakes that already cost a
> day of debugging. Credentials are handed over separately in `CREDENTIALS.local.md`, which is
> deliberately not in this repository.

---

## Running it

You need [Node.js 20.9+](https://nodejs.org) and a PostgreSQL database.

If you do not have one, this provisions a free hosted database in about ten seconds with no signup,
writing `DATABASE_URL` straight into your `.env`:

```bash
npx create-db@latest create --env .env
```

Then:

```bash
npm install
npm run setup
npm run dev
```

Open <http://localhost:3000>.

`npm run setup` generates the Prisma client, creates the tables and loads the entire curriculum —
16 tracks, 24 courses, 28 lessons, 74 glossary terms and a 153-document search index. It validates
every cross-reference first and refuses to write anything if one is broken.

> A `create-db` database that is never claimed is **deleted after 24 hours**. For anything you want
> to keep, create a free Neon or Supabase project instead.

> **Before deploying**, replace `AUTH_SECRET` in `.env` with a real random value:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
> ```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply `schema.prisma` to the database |
| `npm run db:seed` | Validate and load content from `src/content` |
| `npm run db:reset` | Wipe and reload everything |
| `npm run db:studio` | Browse the database in Prisma Studio |

---

## Architecture

```
src/
├── app/                    Routes (Next.js App Router)
│   ├── learn/[course]/[lesson]/   The lesson reader
│   ├── projects/[slug]/           Nine-section project pages
│   ├── simulations/[slug]/        Standalone simulators
│   ├── challenges/[slug]/         Practice problems
│   ├── glossary/[slug]/           Two definitions per term
│   ├── troubleshooting/[slug]/    Symptom → cause → check → fix
│   ├── admin/                     Content management (admin only)
│   └── api/search/                Search endpoint
├── content/                Curriculum source — typed TypeScript
├── components/
│   ├── lesson/             Block renderer, quiz, outline
│   ├── interactive/        Simulators (lazy-loaded)
│   ├── diagrams/           Inline SVG schematics
│   ├── admin/, auth/, site/, ui/
└── lib/
    ├── content/            Block types and JSON accessors
    ├── actions/            Server actions (auth, progress, admin)
    ├── auth/               Sessions, password hashing
    ├── db.ts, queries.ts, search.ts, highlight.ts, math.ts
```

### Content lives in two places, on purpose

The curriculum is authored as **typed TypeScript** in `src/content` and loaded into the database by
`npm run db:seed`. Authoring in code buys three things a CMS cannot:

- **Cross-references are checked before anything is written.** `validateContent()` verifies every
  prerequisite slug, glossary reference, skill link and quiz answer key. A typo is a failed seed,
  not a dead link discovered by a learner.
- **Content is reviewable in a pull request** and refactorable with the type checker.
- **`db:reset` is reproducible.**

The **admin area edits the database rows** — the right tool for fixing a sentence without a deploy.
The two are complementary, and the trade-off is explicit: re-running the seeder resets content to
the files, so anything worth keeping should be moved back into `src/content`.

> `db:seed` also clears user progress, because progress rows reference lesson IDs that are recreated
> on each seed. Accounts themselves are preserved.

### Lessons are blocks, not markdown

A lesson is a JSON array of typed blocks (`prose`, `math`, `code`, `interactive`, `table`,
`ladder`, `flow`, …). This costs some authoring convenience and buys:

1. A maths block, a code block and a simulator are first-class things with their own affordances.
2. The admin CMS can edit one block at a time without a markdown parser.
3. The search indexer extracts meaningful prose and skips code bodies — otherwise every Python
   lesson matches every query containing `import`.

See `src/lib/content/types.ts` for the full block model.

### Rendering decisions

- **Syntax highlighting** runs on the server (Shiki). Both themes are emitted as CSS variables and
  swapped by the theme class, so switching theme needs no re-highlighting and no client bundle.
- **Maths** renders to HTML on the server (KaTeX). Robotics is maths-heavy enough that a
  client-side renderer would delay first paint on every lesson.
- **Simulators** are code-split and loaded on demand. A lesson embeds one; bundling all eleven into
  every page would ship hundreds of kilobytes nobody uses.

### Code execution

The Python playground runs **CPython compiled to WebAssembly (Pyodide) in the visitor's browser**.
User code never reaches the server, so there is no sandbox to escape. Pyodide (~10 MB) is fetched
only on the first "Run" click.

### Auth

Stateless signed JWTs (`jose`) in an httpOnly, SameSite=Lax cookie; passwords hashed with bcrypt at
cost 12. The token carries only id, email, name and role — anything authoritative is re-read from
the database inside the server action that needs it, so a stale token cannot grant access that has
since been revoked. Sign-in uses a constant-shape response and a real hash comparison either way, so
timing and wording do not reveal whether an address is registered.

**Browsing never requires an account.** Signing in adds progress, quiz scores, the skill tree,
achievements, bookmarks and streaks.

The first account created on a fresh install becomes the admin, so there is no shipped password.

---

## Deploying

### GitHub Pages will not work

Pages serves static files only, and this app is server-rendered on every route. Next.js
[explicitly lists](https://nextjs.org/docs/app/guides/static-exports#unsupported-features) three
things it uses as unsupported by `output: 'export'`:

| Used here | Where |
| --- | --- |
| `cookies()` | `getSession()` in the root layout, on every request |
| Server Actions | Sign-in, progress, quiz grading, admin edits |
| Route Handlers using `Request` | `/api/search` |

A static export would drop authentication, progress tracking, quiz marking, search and the admin
area — everything except reading. **Put the repository on GitHub, host the running app elsewhere.**

### Deploying to Vercel

1. **Create a Postgres database.** Neon, Supabase and Prisma Postgres all have free tiers big
   enough for this (~1 MB seeded). **Pick the same region as your Vercel deployment** — every page
   runs several queries, so a cross-continent database turns a 300 ms page into a 5 second one.
2. **Load the schema and content** from your machine, pointed at the new database:
   ```bash
   DATABASE_URL="<your-connection-string>" npm run db:push
   DATABASE_URL="<your-connection-string>" npm run db:seed
   ```
3. **Import the GitHub repo** on Vercel. It detects Next.js; no build settings to change.
4. **Set environment variables** in the Vercel project:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | your Postgres connection string |
   | `AUTH_SECRET` | a fresh 48-byte random string (see below) |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

5. **Deploy.** Then open the site and sign up — the first account becomes the admin.

Leave `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` unset in production. Letting the first sign-up
become admin means no password is ever written into a config file.

### Somewhere with a persistent disk

Railway, Render and Fly.io give the app a real filesystem and long-running process. The same
Postgres setup applies — the app no longer supports SQLite.

### Things that actually break deploys

These are all handled in the repo already; they are listed because they are non-obvious.

- **`postinstall: prisma generate`** — the generated client is gitignored, so a fresh clone has no
  client at all and the build fails without this.
- **Connection pool size** — `next build` fans out across parallel workers and serverless runs many
  concurrent instances, each with its own pool. Total connections are `pools × max`. A pool of 10
  became ~70 connections during a build and the database refused them. `src/lib/db.ts` drops the
  pool to 1 for builds and serverless.
- **`NEXT_PUBLIC_SITE_URL`** — it is inlined at build time, so setting it after deploying does
  nothing until you redeploy. Canonical links, Open Graph tags and the sitemap all depend on it.

### Before any deploy

- Generate a fresh `AUTH_SECRET`; the one in `.env` is a development placeholder:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```
- Confirm `NEXT_PUBLIC_SITE_URL` is the real domain
- Note that Vercel's free Hobby plan is for personal, non-commercial use

---

## What is built, and what is not

Being explicit matters more than looking complete.

### Working

Homepage · 16-level roadmap · course and lesson reader · 28 lessons with quizzes · 5 projects ·
11 interactive simulators · 5 challenges · 74 glossary terms · 7 troubleshooting entries ·
ranked search across everything · skill tree · progress tracking, streaks and achievements ·
authentication · admin CMS · sitemap, robots, JSON-LD structured data · dark and light themes ·
responsive down to 375 px.

### Deliberately not built yet

Ten courses are seeded **unpublished** with a published outline. They appear on the roadmap so the
path shows its real scope, and clicking one lands on an honest "being written, here is the syllabus"
page rather than an empty shell dressed as a lesson.

Also not built, and not faked anywhere in the UI:

- **3D robot models** (Three.js / React Three Fiber). Current simulators are 2D SVG and genuinely
  functional; 3D is additive, not a prerequisite.
- **Automated challenge grading.** Challenges ship with test cases, hints and worked solutions;
  the runner executes your code but does not yet assert against the cases.
- **Certificates** for completed paths. Achievements and badges work.
- **Community features** and the **AI tutor**.

### Adding content

Add a `LessonSource` to a file in `src/content/courses/`, then `npm run db:seed`. The validator will
tell you about any broken reference before it writes anything.

To add a simulator: build the component, register its key in
`src/components/interactive/registry.tsx`, and reference it from an `interactive` block or a
`SimulationSource`.
