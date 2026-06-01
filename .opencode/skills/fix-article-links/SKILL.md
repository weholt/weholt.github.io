---
name: fix-article-links
description: >-
  Fix broken or legacy links inside weholt.org article markdown bodies by running
  npm run fix-article-links. Updates src/content/articles/*/body.*.md only.
  Content-only — never templates, layouts, or themes.
compatibility: opencode
metadata:
  project: weholt-org
---

# Fix article links

Repairs markdown links in article bodies: legacy host URLs, known dead externals, and obsolete footers.

## Hard boundaries

**Allowed output:** changes to `src/content/articles/*/body.en.md` and `body.no.md` only.

**Never edit:** `src/lib/article-links.ts`, pages, layouts, components, or styles unless the user explicitly requests a code change.

See **content-boundaries**.

## Workflow

1. Run `npm run fix-article-links` from the repo root.
2. Review the console list of updated files.
3. Run `npm run validate`.
4. If the user reported a specific broken link, grep article bodies to confirm it was fixed or stripped.

## What the script does

Implemented in `src/lib/article-links.ts` (read-only for agents):

- Maps known legacy `weholt.org` article paths → `/articles/{id}/`
- Strips links to unmigrated legacy URLs (keeps link text)
- Replaces known dead external URLs with current equivalents
- Removes obsolete “originally published at…” footers

## Manual fixes

If a link is not in the mapping table, **do not change application code**. Either:

- Edit the markdown by hand in the relevant `body.*.md`, or
- Ask the user whether the target should become a local `/articles/.../` path or plain text.

## When to use

- After editing articles that reference old site URLs
- When link audit reports broken internal references
- Before publishing a draft that was copied from an old blog export
