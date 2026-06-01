---
name: wire-photography-gallery
description: >-
  Wire an existing photo shoot on weholt.org into galleries.json and photos.json
  when image files already exist under public/images/medium/. Use after adding
  images locally or creating an article folder — content JSON only, no templates.
---

# Wire a photography gallery

Connects **files on disk** to the photography CMS arrays. Use when images already live in `public/images/medium/{gallery-id}/` but are not yet in JSON.

## Hard boundaries

See **content-boundaries**. Edit only:

- `src/content/photography/photos.json`
- `src/content/photography/galleries.json`
- Optionally `src/content/articles/{gallery-id}/index.json` for cover image path

Never edit pages, layouts, components, or styles.

## Prerequisites

- Gallery id chosen (kebab-case, e.g. `my-trip-2026`)
- Images named consistently, e.g. `image-001.jpg`, `image-002.jpg`, …
- Files present at `public/images/medium/{gallery-id}/`

## Workflow

1. **List image files** in `public/images/medium/{gallery-id}/` and sort by filename.
2. **For each file**, append a photo object to `photos.json`:
   - `id`: `{gallery-id}-{NNN}` (three-digit suffix)
   - `src`: `/images/medium/{gallery-id}/{filename}`
   - `alt`, `title`, `caption` with `en` and `no`
   - `categories` from `categories.json`
3. **Append gallery** to `galleries.json`:
   - `id` matches folder name
   - `coverImage` → first image path
   - `images` → ordered list of photo ids
   - Set `order` relative to existing galleries
4. **If an article exists** with the same `id`, set its `coverImage` in `index.json` to match.
5. **Run `npm run validate`**.

## ID alignment

When `galleries.json` entry `id` equals `articles/{id}/index.json` `id`:

- Gallery appears under **Photo albums** on `/photography/`
- The article does **not** also appear under **Photo stories** (by design)

Use the same `id` when the album and long-form post are one unit.

## Large galleries

`photos.json` is one large array. Edit carefully:

- Valid JSON (commas between objects, no trailing comma on last item)
- Unique photo `id`s across the whole file
- Prefer appending at end unless user wants featured grid placement (first 12 slots)

## Related skills

- **add-photography-post** — templates and page behavior
- **add-writing-post** — optional essay body
- **validate-content** — must pass after wiring
