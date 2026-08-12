# Robotics Academy

An interactive robotics learning platform: sixteen levels from "what is a robot?" to designing,
programming, simulating and troubleshooting real robotic systems.

---

## Running it

You need [Node.js 20.9+](https://nodejs.org). Nothing else — no database server, no Docker.

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

Then open <http://localhost:3000>.

`npm run setup` generates the Prisma client, creates the SQLite database and loads the entire
curriculum. It prints the admin account it creates (`SEED_ADMIN_EMAIL` in `.env`).

> **Before deploying anywhere**, change `AUTH_SECRET` in `.env` to a long random value:
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

### Somewhere with a persistent disk (SQLite stays)

Railway, Render or Fly.io give the app a real filesystem, so nothing changes: set `DATABASE_URL`
and `AUTH_SECRET`, mount a volume for the `.db` file, and run `npm run setup` once on first boot.

### Vercel / Netlify (serverless — needs Postgres)

Their filesystems are ephemeral, so SQLite reads would work and every write would silently vanish.
Move to Postgres first (below), then set `DATABASE_URL`, `AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL`
as environment variables in the dashboard. Neon, Supabase and Vercel Postgres all have free tiers.

### Before any deploy

- Generate a fresh `AUTH_SECRET` — the one in `.env` is a development placeholder
- Set `NEXT_PUBLIC_SITE_URL` to the real domain, or canonical links and the sitemap will point at localhost
- Change the seeded admin password, or remove `SEED_ADMIN_EMAIL` and let the first sign-up become admin

## Moving to PostgreSQL

SQLite is the default so the platform runs with zero setup. The schema is written to be portable —
no enums, no scalar lists, all structured values JSON-encoded — so switching needs no model changes:

1. `npm install @prisma/adapter-pg pg`
2. In `prisma/schema.prisma`, set `provider = "postgresql"`
3. In `src/lib/db.ts`, swap `PrismaBetterSqlite3` for `PrismaPg`
4. Set `DATABASE_URL` to your Postgres connection string
5. `npm run db:push && npm run db:seed`

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
