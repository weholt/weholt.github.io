---
name: validate-content
description: >-
  Validate weholt.org content JSON and markdown against schemas using npm run
  validate and optionally npm run build. Use after any content edit to catch
  missing files, bad paths, and schema errors before commit.
---

# Validate content

## Commands

```bash
npm run validate
```

Checks all content JSON against Zod schemas in `src/schemas/content.ts`, verifies article bodies exist, and confirms local image paths under `public/images/`.

Optional full static build:

```bash
npm run build
```

Runs validate first, then Astro build.

## When to run

After **every** content-only change:

- New or edited projects, articles, profile, career, education, photography JSON
- New images referenced from JSON
- Link fixes in markdown bodies

## Common errors and fixes

| Error | Fix |
|-------|-----|
| `missing article body` | Add `body.en.md` and `body.no.md` in the article folder |
| `image file does not exist` | Add file under `public/images/` or fix path to start with `/images/` |
| `unknown category` on photo | Use an id from `photography/categories.json` |
| `unknown photo id` in gallery | Add photo to `photos.json` before referencing in `galleries.json` |
| `schema validation failed` | Compare field shape to a sibling entry or `src/schemas/content.ts` |

## Hard boundaries

Validation is read-only. Fixing errors means editing **content files** only (see **content-boundaries**), not schemas or validators, unless the user requests a code change.

## Dev preview

After validate passes, the user can run `npm run dev` to preview locally. Agents should not modify templates or themes while previewing content.
