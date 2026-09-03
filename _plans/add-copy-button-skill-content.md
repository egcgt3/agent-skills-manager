# Add a "Copy to Clipboard" button to the Skill Content block

## Context

`app/skills/[id]/page.tsx` is a Server Component (ISR, `revalidate = 60`) that fetches a skill via Prisma and renders its `content` inside a `<pre className="skill-content ...">` block. Users viewing a skill currently have to manually select and copy the raw text — there's no quick-copy affordance. We're adding an icon button next to the "Skill Content" heading that copies `skill.content` to the clipboard, with a brief checkmark confirmation.

Since the page has no `"use client"` directive (it does server-side data fetching), the copy interaction can't live inline — it needs a small extracted client component, following the existing pattern in this codebase where `app/components/Header.tsx` is a standalone `"use client"` component imported into otherwise-server layouts.

## Approach

**New file: `app/components/CopyButton.tsx`**
- `"use client"` component.
- Props: `{ text: string }`.
- State: `copied: boolean` (default `false`).
- `onClick`: `navigator.clipboard.writeText(text)`, then `setCopied(true)`, then `setTimeout(() => setCopied(false), 1500)`.
- Renders a DaisyUI icon button (`btn btn-ghost btn-sm` — match existing sizing conventions like the back-link in the same page) containing an inline SVG icon:
  - Default state: a "copy" icon (two overlapping rectangles), hand-rolled inline SVG matching the project's existing convention (see `app/components/Header.tsx` lines 14-27 — `xmlns`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `<path strokeLinecap strokeLinejoin strokeWidth d=.../>`, sized `h-5 w-5`).
  - `copied === true`: swap to a checkmark icon (same SVG conventions).
- Add an `aria-label` ("Copy skill content" / "Copied") for accessibility since it's icon-only.
- No new dependencies — no icon library is installed anywhere in this project; everything is hand-rolled SVG.

**Edit: `app/skills/[id]/page.tsx`**
- Import `CopyButton` from `@/components/CopyButton`.
- Change the "Skill Content" heading row (currently just `<h2 className="text-lg font-semibold mb-4">Skill Content</h2>`) to a flex row with the heading on the left and `<CopyButton text={skill.content} />` on the right, e.g.:
  ```tsx
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold">Skill Content</h2>
    <CopyButton text={skill.content} />
  </div>
  ```
- No other changes to this Server Component — passing `skill.content` as a prop to the client component is fine (plain string, serializable).

## Files touched

- `app/components/CopyButton.tsx` — new
- `app/skills/[id]/page.tsx` — edit the "Skill Content" header row (~lines 79-85)

## Verification

1. `npm run dev`, sign in / seed a skill with non-trivial content (or use the existing "First Skill" seed shown in the screenshot).
2. Visit `/skills/[id]` for that skill.
3. Confirm the copy icon appears next to "Skill Content", styled consistently with other DaisyUI buttons on the page.
4. Click it: paste clipboard contents elsewhere and confirm it matches `skill.content` exactly (including the YAML frontmatter and newlines).
5. Confirm the icon swaps to a checkmark for ~1.5s then reverts to the copy icon.
6. Run `npm run lint` to confirm no lint errors (unused vars, missing aria attributes, etc.).