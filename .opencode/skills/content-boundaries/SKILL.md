---
name: content-boundaries
description: >-
  Defines what files agents may edit for weholt.org content changes. Use before
  any content task to confirm scope — JSON and markdown under src/content/ and
  images under public/images/ only. Never templates, layouts, themes, or styles.
compatibility: opencode
metadata:
  project: weholt-org
---

# Weholt.org content boundaries

This site is a **JSON + Markdown CMS**. Agents add or update content by editing data files, not by changing Astro pages or CSS.

## Always allowed

| Area | Paths |
|------|-------|
| Projects | `src/content/projects/*.json` |
| Articles | `src/content/articles/{id}/index.json`, `body.en.md`, `body.no.md` |
| Profile / About | `src/content/profile/*.json` |
| Career | `src/content/career/*.json` |
| Education | `src/content/education/*.json` |
| Photography | `src/content/photography/*.json` |
| Images | `public/images/**` |

## Never edit (unless user explicitly asks for a code change)

- `src/pages/`, `src/layouts/`, `src/components/`
- `public/styles/`, themes, layouts in `site.json`
- `src/schemas/`, `src/lib/`, build config
- Import/archive scripts under `src/scripts/` (legacy; do not use for new content)

## Localization

User-visible strings use `{ "en": "...", "no": "..." }` unless the schema says otherwise (e.g. `expertise[]` is plain strings).

## After every content change

Run `npm run validate`. If the user wants a full check, run `npm run build`.

## Related skills

| Task | Skill |
|------|-------|
| New project | add-project |
| About / bio / career | update-about |
| Homepage hero | update-home-hero |
| New article | add-writing-post |
| Photo gallery | add-photography-post |
| Link article + gallery | wire-photography-gallery |
| Publish / draft / pin | publish-or-archive-content |
| Fix broken links in articles | fix-article-links |
| Validate | validate-content |
