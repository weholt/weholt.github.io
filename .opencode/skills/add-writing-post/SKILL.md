---
name: add-writing-post
description: >-
  Publish a writing post on weholt.org by adding article content under
  src/content/articles/. Use when the user wants a new article on /writing/, a
  blog post, or an essay. Content-only — never templates, layouts, or themes.
compatibility: opencode
metadata:
  project: weholt-org
---

# Add a writing post

Writing posts appear on `/writing/` when `status` is `"published"`. Each post lives in its own folder under `src/content/articles/`.

## Critical

We do not accept AI slop on this site. See **personal-homepage-content** (Critical) and [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). Write in Thomas's voice — concrete details, no generic LLM filler.

## Hard boundaries

See **content-boundaries**. Allowed:

- `src/content/articles/{id}/index.json` — metadata
- `src/content/articles/{id}/body.en.md` — English body
- `src/content/articles/{id}/body.no.md` — Norwegian body
- Images under `public/images/` (e.g. `public/images/medium/{id}/`)

Markdown bodies are **content**, not templates. Both language files are **required** by validation.

## Workflow

1. **Choose `id`** — lowercase kebab-case (e.g. `my-new-post`). Folder name = `id`.
2. **Read a similar article** — e.g. `src/content/articles/atomic-framework/`.
3. **Create `index.json`** — see template below.
4. **Create `body.en.md` and `body.no.md`** — Markdown only; no YAML frontmatter.
5. **Set `status`: `"published"`** for the post to appear on `/writing/`.
6. **Set `order` and `date`** — list sorts by pin status, then `order`, then `date`.
7. **Run `npm run validate`**.

## `index.json` template

```json
{
  "id": "my-new-post",
  "order": 20,
  "title": {
    "en": "Article title",
    "no": "Artikkel tittel"
  },
  "summary": {
    "en": "Card summary for listings and meta description.",
    "no": "Kort sammendrag for lister og meta."
  },
  "date": "2026-05-28",
  "coverImage": "/images/medium/my-new-post/cover.jpg",
  "tags": ["python", "writing"],
  "status": "published",
  "featured": false
}
```

## Optional metadata

| Field | Use |
|-------|-----|
| `pinned` | `true` to stick to top of article lists |
| `pinOrder` | Sort among pinned posts (lower first) |
| `featured` | Highlights on homepage |
| `status: "draft"` | Hidden from `/writing/` |

Use **publish-or-archive-content** to change visibility after creation.

## Markdown body tips

- Use `##` / `###` for headings (the page template renders the title from JSON).
- Local images: `![](/images/medium/my-new-post/photo.jpg)`
- Fenced code blocks for code samples.
- Run **fix-article-links** if bodies contain broken legacy URLs.

## Photography overlap

Photo essays also show on `/photography/` under **Photo stories** unless:

- The article `id` matches a gallery `id` in `galleries.json`, or
- The `id` is listed in `NON_PHOTOGRAPHY_ARTICLE_IDS` in `src/lib/photos.ts`

For a photo-heavy post with an album grid, use **add-photography-post** and **wire-photography-gallery**.
