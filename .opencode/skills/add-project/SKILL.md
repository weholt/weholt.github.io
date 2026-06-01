---
name: add-project
description: >-
  Add or update a project entry on weholt.org by editing JSON under
  src/content/projects/. Use when the user wants a new project on the Projects
  page, to feature a repo, or to update project metadata. Content-only — never
  templates, layouts, or themes.
compatibility: opencode
metadata:
  project: weholt-org
---

# Add a project

## Hard boundaries

**Only edit content files.** Allowed:

- `src/content/projects/*.json`
- Image files under `public/images/` when adding a project thumbnail

**Never edit:** `src/pages/`, `src/layouts/`, `src/components/`, `public/styles/`, `src/content/settings/site.json`, or any Astro/CSS/JS templates.

See **content-boundaries** for the full allow/deny list.

## Workflow

1. **Read a sibling project** in `src/content/projects/` (e.g. `atomic-framework.json`) and match its shape.
2. **Choose `id`** — lowercase kebab-case; filename must be `{id}.json`.
3. **Pick `order`** — lower numbers appear first on `/projects/`. Check existing `order` values.
4. **Write the JSON file** with bilingual `en` / `no` for every localized field.
5. **Validate** — run `npm run validate` (see **validate-content** skill).

## Required fields

| Field | Notes |
|-------|-------|
| `id` | Same as filename stem |
| `title`, `summary`, `description` | `{ "en": "...", "no": "..." }` |
| `status` | `featured` \| `active` \| `experimental` \| `historical` \| `archived` \| `draft` |
| `order` | Integer sort key |
| `tags` | String array |
| `featured` | Boolean — highlights on homepage project lists |

Optional: `repo` (GitHub repo slug), `url` (full https URL), `image` (`/images/...` or https URL).

## Template

```json
{
  "id": "my-project",
  "order": 10,
  "title": {
    "en": "My Project",
    "no": "Mitt prosjekt"
  },
  "summary": {
    "en": "One-line card summary.",
    "no": "Én linje kort sammendrag."
  },
  "description": {
    "en": "Slightly longer description for detail views.",
    "no": "Litt lengre beskrivelse for detaljvisning."
  },
  "repo": "my-project",
  "url": "https://github.com/weholt/my-project",
  "image": "/images/projects/my-project.jpg",
  "status": "active",
  "featured": false,
  "tags": ["python", "tools"]
}
```

## Images

- Local paths must start with `/images/` and the file must exist under `public/images/`.
- External https image URLs are allowed (see existing projects).

## Optional: linked writing post

If the project also has a long article, use **add-writing-post** separately. Project JSON and article JSON are independent.
