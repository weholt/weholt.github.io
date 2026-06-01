---
name: add-photography-post
description: >-
  Add photography to weholt.org by editing JSON in src/content/photography/ and
  optionally a linked article folder. Use for new photo galleries, albums, or
  photo essays on /photography/. Content-only — never templates, layouts, or themes.
compatibility: opencode
metadata:
  project: weholt-org
---

# Add a photography post

The Photography page combines **galleries** (album grids), **individual photos**, and optional **photo essays** (published articles).

## Hard boundaries

See **content-boundaries**. Allowed JSON:

- `src/content/photography/galleries.json` — album definitions
- `src/content/photography/photos.json` — every image record
- `src/content/photography/categories.json` — only when adding a new filter category
- `src/content/articles/{id}/` — optional photo essay (see **add-writing-post**)
- Image files under `public/images/medium/{gallery-id}/`

## Two patterns

### A) Gallery album (most common)

Best when the post is mainly a set of images (trip, shoot, series).

1. **Add images** to `public/images/medium/{gallery-id}/` (e.g. `image-001.jpg`).
2. **Append photo entries** to `photos.json` — one object per image.
3. **Append a gallery** to `galleries.json` listing photo `id`s in display order.
4. **Optional:** add a matching article in `src/content/articles/{gallery-id}/` for long-form text. If `gallery.id === article.id`, the essay is **not** duplicated in the Essays section (gallery card is enough).

For many images, use **wire-photography-gallery** after images are on disk.

### B) Photo essay only (no gallery)

A published article with photos in markdown, no `galleries.json` entry.

1. Use **add-writing-post** to create the article folder.
2. Ensure `status: "published"` and photo-related tags.
3. Article appears under **Photo stories** on `/photography/` unless excluded (see below).

## Photo entry template (`photos.json`)

```json
{
  "id": "my-trip-2026-001",
  "src": "/images/medium/my-trip-2026/image-001.jpg",
  "alt": {
    "en": "Description for accessibility",
    "no": "Beskrivelse for tilgjengelighet"
  },
  "title": {
    "en": "Optional title",
    "no": "Valgfri tittel"
  },
  "caption": {
    "en": "From \"My Trip 2026\"",
    "no": "Fra «My Trip 2026»"
  },
  "categories": ["travel", "fujifilm"],
  "camera": "Fujifilm X100V",
  "tags": ["norway", "travel"]
}
```

**ID convention:** `{gallery-id}-{NNN}` with zero-padded three digits (`001`, `002`, …).

**Categories** must exist in `categories.json` (`fujifilm`, `portraits`, `travel`, `street`, `landscape`).

## Gallery entry template (`galleries.json`)

```json
{
  "id": "my-trip-2026",
  "order": 4,
  "title": {
    "en": "My Trip 2026",
    "no": "Min tur 2026"
  },
  "description": {
    "en": "Short intro shown on the gallery card.",
    "no": "Kort intro på gallerikortet."
  },
  "coverImage": "/images/medium/my-trip-2026/image-001.jpg",
  "categories": ["travel", "landscape"],
  "images": ["my-trip-2026-001", "my-trip-2026-002"]
}
```

Every `images[]` id must exist in `photos.json`. `coverImage` must exist on disk or be a valid https URL.

## Featured grid

The **Selected frames** section shows the first 12 entries in `photos.json` array order.

## Validation

Run `npm run validate`. Common failures:

- Unknown category id on a photo
- Gallery references a missing photo id
- Image path missing under `public/`

## Exclusions from Photography essays

Articles are not listed under Photo stories if `id` is in `NON_PHOTOGRAPHY_ARTICLE_IDS` (`src/lib/photos.ts`), or if a gallery shares the same `id`.
