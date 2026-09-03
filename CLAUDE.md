# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Agent Skills Manager — a Next.js 16 (App Router) demo app for creating, browsing, and sharing AI agent "skills". It intentionally showcases four different rendering/data patterns side by side (see Architecture below), backed by Postgres via Prisma 7.

## Commands

```bash
npm run dev      # next dev (also regenerates the AGENTS.md/CLAUDE.md agent-rules block if missing)
npm run build    # next build
npm run start    # next start (production server)
npm run lint     # eslint
```

Database (Prisma 7, uses the new `prisma.config.ts` instead of the old `package.json#prisma` block):

```bash
npx prisma generate               # regenerate client (also runs automatically via postinstall)
npx prisma migrate dev --name x   # create + apply a migration in dev
npx prisma studio                 # inspect data
docker compose up -d              # start local Postgres (skills-db, port 5432, db "skills_db")
```

Tests (Vitest + React Testing Library, jsdom environment; config in `vitest.config.mts` / `vitest.setup.ts`). Test files live under `tests/` at the repo root, mirroring the `app/` structure (e.g. `tests/components/CopyButton.test.tsx` tests `app/components/CopyButton.tsx`) rather than sitting next to the source files:

```bash
npm run test         # vitest run (single run)
npm run test:watch   # vitest (watch mode)
npx vitest run tests/components/CopyButton.test.tsx   # run a single test file
```

`@` resolves to `app/` in tests too (aliased separately in `vitest.config.mts` since Vitest doesn't read `tsconfig.json` paths) — import source files via `@/...` from `tests/`, not relative paths. Note `vitest` itself is also pulled in transitively via `@prisma/composer` → `alchemy` → `@effect/vitest`, but the project's own test setup is pinned as an explicit devDependency — don't rely on the transitive copy.

Local Postgres from `docker-compose.yml` expects `DATABASE_URL` (or `DATABASE_URL_LOCAL`, see `.env`) pointing at `postgres://postgres:postgres@localhost:5432/skills_db`.

## Architecture

**This is a modified Next.js build with breaking API changes** — read `AGENTS.md` / the generated warning block before assuming any API matches your training data, and consult `node_modules/next/dist/docs/` for the actual current behavior of anything Next.js-specific (routing, data fetching, config) before writing code that touches it.

### Rendering patterns (the point of the demo)

Each page comments which pattern it demonstrates — preserve this when editing:

- `app/skills/page.tsx` and `app/skills/[id]/page.tsx` — **ISR**, `export const revalidate = 60`, data fetched directly with Prisma inside the Server Component.
- `app/dashboard/page.tsx` and `app/dashboard/skills/**` — **CSR**, `"use client"` pages that call the JSON API routes (`/api/skills*`) with `credentials: "include"`.
- `app/actions/skill.ts` — Server Actions (`"use server"`) used for mutations (create/update/delete), called from client components; each does its own ownership check (`authorId !== userId`) before mutating.
- `app/skills/skills.ts` — an unrelated in-memory mock/demo module (`SKILLS` array, artificial `setTimeout` delays); not wired to Prisma or the real skill pages — don't confuse it with the real data path.

### Auth

Hand-rolled, not NextAuth/Clerk/etc:

- `app/lib/auth.ts` — bcrypt password hashing, and a **base64 JSON token** (not a real JWT — no signature) with an expiry embedded as `exp`, stored in an httpOnly `auth_token` cookie. `getCurrentUser()` is the server-side helper for Server Components/Actions; `verifyToken()` is used directly in API routes.
- `app/api/auth/{login,register,logout,me}/route.ts` — issue/clear the cookie.
- `app/hooks/useAuth.tsx` — client-side `AuthContext`/`useAuth()`, wraps the app via `app/components/Providers.tsx` in the root layout. Calls `/api/auth/me` on mount to hydrate auth state; `login`/`register`/`logout` hit the API routes and update context state directly (don't re-fetch `/me` after them).
- Route-level ownership checks are duplicated per-endpoint (API routes and server actions each re-check `authorId === userId`) rather than centralized — follow the existing pattern when adding new mutations.

### Data layer

- `prisma/schema.prisma` — two models, `User` and `Skill` (skills `onDelete: Cascade` from user). Table/column names are snake_case via `@map`/`@@map`; keep using Prisma's camelCase field names in code.
- `app/lib/prisma.ts` — singleton client using `@prisma/adapter-pg` (driver adapter) over a `pg.Pool`, with the standard dev-mode `globalThis` caching to survive HMR.

### Layout/UI

- Root layout (`app/layout.tsx`) wraps everything in `Providers` (auth context) and renders shared `Header`/`Footer`.
- Styling is Tailwind v4 (via `@tailwindcss/postcss`) + DaisyUI components (`data-theme="dark"` set on `<html>`); prefer existing DaisyUI class patterns (`card`, `btn`, `navbar`, `badge`, etc.) over hand-rolled CSS.
- Path alias: `@/*` maps to `app/*` (see `tsconfig.json`), not to a top-level `src/`.

### Agent skill definitions

`.agents/skills/`, `.claude/skills/`, `.cursor/skills/`, `.devin/skills/` each carry an identical `prisma-composer` `SKILL.md` — reference material for a *different* Prisma product (`@prisma/composer`) that this app does not actually use (the app talks to Postgres directly via `@prisma/client`/`prisma-pg`). Don't assume Composer APIs apply to this codebase's Prisma usage.
