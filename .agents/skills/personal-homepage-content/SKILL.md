---
name: personal-homepage-content
description: >-
  Overview of the weholt.org content CMS (JSON + Markdown under src/content/).
  Use for general content edits when unsure which specific skill applies. Prefer
  granular skills (add-project, update-about, add-writing-post, etc.) when the
  task is known. Content-only by default — never templates or themes unless asked.
---

# Personal homepage content

This site stores content as JSON and Markdown; Astro renders it statically.

## Critical

We do not accept AI slop on this site. All copy must sound like Thomas wrote it — specific, honest, and human.

Before drafting or publishing visible text, read [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) and avoid those patterns (hollow intros, filler transitions, vague enthusiasm, listicle voice, em-dash padding, etc.).

Reject or rewrite any prose that reads generic, over-polished, or machine-generated.

## Prefer specific skills

| Task | Skill |
|------|-------|
| Scope / allow list | content-boundaries |
| New project | add-project |
| About / career / education | update-about |
| Homepage hero | update-home-hero |
| New article | add-writing-post |
| Photo gallery | add-photography-post |
| Wire images to JSON | wire-photography-gallery |
| Publish / draft / pin | publish-or-archive-content |
| Fix article links | fix-article-links |
| Validate | validate-content |

## Prime rules

1. Do not change layout or theme code when only adding or editing content.
2. Add new content as new files when possible.
3. IDs: lowercase, kebab-case, URL-safe.
4. Visible strings: `{ "en": "...", "no": "..." }` unless schema says otherwise.
5. Images under `public/images/`; JSON paths start with `/images/`.
6. Article bodies in `body.en.md` and `body.no.md`, not inside JSON.
7. Run `npm run validate` after changes.

## Content folders

```text
src/content/profile/main.json
src/content/profile/hero.json
src/content/profile/professional.json
src/content/settings/site.json
src/content/career/*.json
src/content/education/*.json
src/content/projects/*.json
src/content/articles/<id>/index.json
src/content/articles/<id>/body.en.md
src/content/articles/<id>/body.no.md
src/content/photography/categories.json
src/content/photography/photos.json
src/content/photography/galleries.json
```

## Commands

```bash
npm run validate
npm run build
npm run sync-skills
```

## Agent report

When done, report: files changed, validation result, unresolved questions.
