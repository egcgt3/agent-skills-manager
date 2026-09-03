# Switch to a real signed JWT

## Context

`app/lib/auth.ts` currently issues an **unsigned** token: `generateToken()` base64-encodes a JSON payload (`{userId, email, name, exp}`), and `verifyToken()` just decodes it and checks `exp` — there is no cryptographic signature. The code even self-flags this with a comment: *"In production, use a proper JWT library."* Anyone can forge a valid-looking `auth_token` cookie for any user id, which is a full authentication bypass.

Separately, `app/actions/skill.ts`'s three Server Actions (`createSkill`, `updateSkill`, `deleteSkill`) accept a `userId` parameter passed directly from the client (sourced from `useAuth()`'s `user.id` in the calling page) instead of deriving identity from the verified session server-side. Signing the token alone wouldn't close this — a client could still invoke these actions with someone else's `userId`. Per user confirmation, this plan also fixes that.

## Approach

**1. Add `jose` as a dependency** (`npm install jose`) — the standard modern JWT library for Next.js; unlike `jsonwebtoken` it works in both the Node and Edge runtimes.

**2. New required env var: `AUTH_JWT_SECRET`** — add a securely random value to `.env` (e.g. generated via `openssl rand -base64 32`). Used as the HMAC (HS256) signing key.

**3. Rewrite the token functions in `app/lib/auth.ts`**:
- Replace the base64 `generateToken`/`verifyToken` pair with `jose`'s `SignJWT` / `jwtVerify`, keyed by a `TextEncoder`-derived secret from `process.env.AUTH_JWT_SECRET` (throw clearly at first use if the env var is missing).
- `generateToken` becomes `async`: builds the JWT with `.setProtectedHeader({ alg: "HS256" })`, `.setIssuedAt()`, `.setExpirationTime(...)` (reuse the existing `AUTH_TOKEN_EXPIRY_HOURS` env var, e.g. `` `${TOKEN_EXPIRY_HOURS}h` ``), and signs it.
- `verifyToken` becomes `async`: calls `jwtVerify(token, secret)` and returns `null` on any failure (bad signature, expired, malformed) — no more manual `Date.now()` expiry check, since `jwtVerify` enforces `exp` itself.
- `TokenPayload` keeps the same shape (`userId`, `email`, `name`) other callers already depend on.
- `getCurrentUser()` (already `async`, currently unused elsewhere in the app) just needs its internal call `await`ed.

**4. Await the now-async functions at existing call sites** (all already run inside `async` route handlers, so this is mechanical):
- `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts` — `await generateToken(...)`
- `app/api/auth/me/route.ts`, `app/api/skills/route.ts`, `app/api/skills/[id]/route.ts` — `await verifyToken(token)`

**5. Fix the Server Actions to stop trusting a client-supplied `userId`** (`app/actions/skill.ts`):
- Drop the `userId: number` parameter from `createSkill`, `updateSkill`, `deleteSkill`.
- Call `getCurrentUser()` (from `app/lib/auth.ts`) at the top of each; return `{ success: false, error: "Not authenticated" }` if there's no valid session.
- Keep the existing ownership check (`existing.authorId !== userId`) in `updateSkill`/`deleteSkill`, just sourced from the verified session instead of the parameter.
- Update the three call sites to drop the now-removed argument:
  - `app/dashboard/skills/new/page.tsx`: `createSkill(data, user!.id)` → `createSkill(data)`
  - `app/dashboard/skills/[id]/edit/page.tsx`: `updateSkill(skillId, data, user.id)` → `updateSkill(skillId, data)`
  - `app/dashboard/page.tsx`: `deleteSkill(id, user.id)` → `deleteSkill(id)`

## Files touched

- `app/lib/auth.ts` — core rewrite (jose-based signing/verification)
- `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`, `app/api/auth/me/route.ts` — await the async auth functions
- `app/api/skills/route.ts`, `app/api/skills/[id]/route.ts` — await `verifyToken`
- `app/actions/skill.ts` — derive the user from `getCurrentUser()` instead of a parameter
- `app/dashboard/skills/new/page.tsx`, `app/dashboard/skills/[id]/edit/page.tsx`, `app/dashboard/page.tsx` — drop the now-unnecessary `user.id` argument
- `.env` — add `AUTH_JWT_SECRET`
- `package.json` — add `jose`

## Verification

1. `npm install jose`; add `AUTH_JWT_SECRET` to `.env`.
2. `npm run dev`; register/login and confirm the `auth_token` cookie is now a real 3-part JWT (`header.payload.signature`), inspectable via browser devtools → Application → Cookies.
3. Exercise the full flow while logged in: view `/dashboard`, create a skill, edit it, delete it — all should keep working with no `userId` argument left in the client calls.
4. Tamper test: hand-edit one character of the `auth_token` cookie value and confirm the app now treats the request as unauthenticated (the old base64 scheme would have silently accepted a similarly crafted payload).
5. Confirm there's no remaining path for a client to pass an arbitrary `userId` into `createSkill`/`updateSkill`/`deleteSkill`.
6. `npm run lint` and `npm run test` — both should stay green (no existing test touches `app/lib/auth.ts` or `app/actions/skill.ts`, so nothing there needs updating).