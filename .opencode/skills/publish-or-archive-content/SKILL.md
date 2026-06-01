---
name: publish-or-archive-content
description: >-
  Change visibility and prominence of weholt.org content by editing status,
  featured, pinned, and order fields in JSON under src/content/. Use to publish,
  draft, archive, pin, or reorder articles and projects. Content-only — never
  templates or themes.
compatibility: opencode
metadata:
  project: weholt-org
---

# Publish, archive, pin, and reorder

Change visibility by editing JSON metadata only — no template changes.

## Hard boundaries

See **content-boundaries**. Only edit content JSON:

- `src/content/articles/{id}/index.json`
- `src/content/projects/{id}.json`

Do not delete article folders unless the user explicitly asks to remove content entirely.

## Articles (`index.json`)

| Field | Values | Effect |
|-------|--------|--------|
| `status` | `draft` \| `published` \| `archived` | Only `published` appears on `/writing/` and photo essay lists |
| `featured` | boolean | Homepage and highlight treatment |
| `pinned` | boolean | Sticks to top of article lists |
| `pinOrder` | integer | Sort order among pinned posts (lower first) |
| `order` | integer | Sort among non-pinned posts |
| `date` | `YYYY-MM-DD` | Tie-breaker (newer first when order matches) |

Sort logic is in `src/lib/content.ts` → `compareArticles`. Prefer adjusting `order` / `pinOrder` over changing many dates.

## Projects (`projects/*.json`)

| Field | Values | Effect |
|-------|--------|--------|
| `status` | `featured` \| `active` \| `experimental` \| `historical` \| `archived` \| `draft` | Card labeling and grouping |
| `featured` | boolean | Homepage project highlights |
| `order` | integer | Sort on `/projects/` (ascending) |

## Common workflows

**Publish a draft article** → set `"status": "published"`.

**Hide without deleting** → set `"status": "draft"` or `"archived"`.

**Pin to top** → `"pinned": true`, set `"pinOrder"` lower than other pinned items.

**Unpin** → `"pinned": false`, remove or ignore `pinOrder`.

## Validation

Run `npm run validate` after edits.

## Bodies unchanged

Publishing does not require editing `body.en.md` / `body.no.md`. Those files must still exist for every article.
