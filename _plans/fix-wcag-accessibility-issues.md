# Fix WCAG 2.1 accessibility findings

## Context

Running the `wcag-accessibility-review` skill against every user-facing page
and shared component turned up 12 concrete WCAG 2.1 violations (6 Level A,
6 Level AA). Three of the AA findings are color-contrast failures that were
verified with real computed contrast ratios (not estimates) by converting
this app's actual DaisyUI dark-theme OKLCH tokens to sRGB and applying the
WCAG relative-luminance formula — see the numbers below. This plan fixes
all 12 findings with minimal, targeted changes; it does not restructure the
app or touch functionality/behavior beyond what's needed to close each gap.

## Level A fixes

**1. Form labels not associated with inputs (1.3.1 / 3.3.2)**
Every `<label className="label"><span className="label-text">X</span></label>`
+ sibling `<input>`/`<textarea>` pair across the app's forms has no
`htmlFor`/`id` pairing. Add a matching `id` on each input/textarea and
`htmlFor` on its label. Applies to:
- `app/(auth)/login/page.tsx` — Email, Password
- `app/(auth)/register/page.tsx` — Name, Email, Password, Confirm Password
- `app/dashboard/skills/new/page.tsx` — Skill Name, Description, Skill Content
- `app/dashboard/skills/[id]/edit/page.tsx` — same three fields
(The "Make this skill public" checkbox already nests its `<input>` inside
its `<label>` — no change needed there.)

**2. No skip-to-main-content link (2.4.1)**
In `app/layout.tsx`: give the `<main>` element `id="main-content"`, and add
a visually-hidden-until-focused skip link as the first child inside
`<body>`/`<Providers>`, e.g. `className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-base-100"`, pointing at `href="#main-content"`.

**3. Hamburger menu toggle has no accessible name (4.1.2 / 1.1.1)**
`app/components/Header.tsx` — the mobile menu trigger div (`role="button"`
wrapping only an SVG) needs `aria-label="Toggle navigation menu"`.

**4. Avatar menu trigger's accessible name doesn't describe its purpose (4.1.2)**
Same file — the account-menu trigger div needs `aria-label="Account menu"`
(or similar). Its interaction model (CSS `:focus-within` reveal, no
onClick/onKeyDown) already makes the menu reachable and revealed by
keyboard focus alone, so no interaction-model rewrite is needed here — just
the missing name.

**5. Client-only pages share one page title app-wide (2.4.2)**
`metadata`/`generateMetadata` only work in Server Components, and `/login`,
`/register`, `/dashboard`, `/dashboard/skills/new`, and
`/dashboard/skills/[id]/edit` are all `"use client"` page components (this
Next.js build's own docs confirm this constraint —
`node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`).
Fix with a small Server Component `layout.tsx` per route segment that only
exports `metadata` and renders `{children}` — no changes to the existing
client page components:
- `app/(auth)/login/layout.tsx` → title "Sign In | Agent Skills Manager"
- `app/(auth)/register/layout.tsx` → title "Sign Up | Agent Skills Manager"
- `app/dashboard/layout.tsx` → title "Dashboard | Agent Skills Manager"
- `app/dashboard/skills/new/layout.tsx` → title "Create Skill | Agent Skills Manager"
- `app/dashboard/skills/[id]/edit/layout.tsx` → title "Edit Skill | Agent Skills Manager"

**6. Form errors aren't announced or linked to fields (3.3.1); no `<h1>` on login/register (1.3.1)**
- Add `role="alert"` to every `<div className="alert alert-error">` error
  banner: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`,
  `app/dashboard/skills/new/page.tsx`, `app/dashboard/skills/[id]/edit/page.tsx`.
- In `register/page.tsx`, the password-mismatch/length checks set `error`
  client-side before any server round trip — add `aria-invalid` on the
  relevant password/confirm-password inputs when that specific error is
  active, so the failure is tied to a field, not just a floating message.
- Promote the `<h2 className="card-title text-2xl justify-center">` on
  `login/page.tsx` and `register/page.tsx` to `<h1>` (same class, so no
  visual change) — each page currently has zero `<h1>`.

## Level AA fixes

**7/8/9. Contrast failures — global theme token override**
Verified via the WCAG relative-luminance formula against this app's actual
dark-theme OKLCH tokens (`node_modules/daisyui/theme/dark/object.js`). Add
an override block in `app/globals.css` scoped to `[data-theme="dark"]`,
after the `@plugin "daisyui";` line (source order gives it precedence at
equal specificity):

```css
[data-theme="dark"] {
  --color-secondary: oklch(54% 0.241 354.308);       /* was 65% — badge-secondary text 3.05:1 → 4.55:1 */
  --color-primary-content: oklch(99.8% 0.018 272.314); /* was 96% — btn/badge-primary text 4.14:1 → 4.59:1 */
  --color-primary-link: oklch(68% 0.233 277.117);      /* new token, links only */
}
.link-primary {
  color: var(--color-primary-link, var(--color-primary));
}
```
This fixes every current `badge-secondary`, `btn-primary`, `badge-primary`,
and `link-primary` usage app-wide (buttons, badges, the two "Sign up"/
"Sign in" links) with no JSX changes, and prevents any *new* usage of these
classes from silently reintroducing the failure. `--color-primary` itself
(used as button/badge backgrounds) is untouched, so button fill colors
don't change — only the text-on-primary and link-as-text cases shift.

**10. Submit spinners erase the button's accessible name (4.1.3 / 4.1.2)**
Standardize a small pattern and apply it everywhere a bare
`<span className="loading loading-spinner ...">` currently stands alone as
the only content of a button or a full-page loading state:
- Add `aria-hidden="true"` to the spinner span itself.
- Add a `sr-only` text node next to it describing the state (e.g. "Signing
  in…", "Creating…", "Saving…", "Loading…").
- Add `aria-busy={isSubmitting}` (or the equivalent loading flag) on the
  button/container.

Applies to: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`,
`app/dashboard/skills/new/page.tsx`, `app/dashboard/skills/[id]/edit/page.tsx`
(submit buttons), plus the full-page `isLoading` spinners in
`app/dashboard/page.tsx`, `app/dashboard/skills/new/page.tsx`,
`app/dashboard/skills/[id]/edit/page.tsx`, and the navbar spinner in
`app/components/Header.tsx`.

**11. Copy confirmation isn't reliably announced (4.1.3)**
`app/components/CopyButton.tsx` already flips its `aria-label` between
"Copy skill content" and "Copied" — add a visually-hidden
`aria-live="polite"` status element (e.g. a `sr-only` `<span>` inside the
component) that gets set to "Copied to clipboard" when `copied` is true, as
a robust fallback for screen readers that don't reliably re-announce a
label change on an already-focused element.

## Files touched

- `app/globals.css` — theme token overrides
- `app/layout.tsx` — skip link, `id="main-content"` on `<main>`
- `app/components/Header.tsx` — aria-labels on both dropdown triggers, spinner fix
- `app/components/CopyButton.tsx` — live-region status text
- `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx` — label association, `role="alert"`, h1 promotion, spinner fix
- `app/dashboard/page.tsx` — spinner fix
- `app/dashboard/skills/new/page.tsx`, `app/dashboard/skills/[id]/edit/page.tsx` — label association, `role="alert"`, spinner fix
- New: `app/(auth)/login/layout.tsx`, `app/(auth)/register/layout.tsx`, `app/dashboard/layout.tsx`, `app/dashboard/skills/new/layout.tsx`, `app/dashboard/skills/[id]/edit/layout.tsx`

## Verification

1. `npm run lint` and `npm run test` stay green.
2. `npm run dev`, then for each fixed page:
   - Tab from the top of `/`, `/skills`, `/login` confirming the skip link
     appears on first Tab and jumps focus to `<main>`.
   - Tab through the login/register/create-skill/edit-skill forms
     confirming each field's name is now announced (DevTools Accessibility
     pane → Computed Name, or a screen reader) and matches its visible label.
   - Confirm the hamburger and avatar menu triggers now expose a non-empty
     accessible name in the DevTools Accessibility pane.
   - Check each route's `<title>` in the browser tab is now distinct.
   - Trigger a form error (e.g. wrong login password) and confirm the error
     banner has `role="alert"`.
3. Re-run the exact contrast computation used during the review (OKLCH →
   sRGB → WCAG relative luminance) against the new token values to confirm
   `badge-secondary`, `btn-primary`/`badge-primary`, and `link-primary` all
   land ≥ 4.5:1 — already verified during planning (4.55:1, 4.59:1,
   4.75–5.03:1 respectively) but re-check after the CSS edit lands.
4. Re-run the `wcag-accessibility-review` skill against the same file list
   to confirm all 12 original findings are resolved and no new ones were
   introduced.
