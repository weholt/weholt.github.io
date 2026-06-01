---
name: update-about
description: >-
  Update the About page on weholt.org by editing JSON under src/content/profile/,
  src/content/career/, and src/content/education/. Use when the user wants to
  change bio, expertise, career timeline, education, or contact info. Content-only
  — never templates, layouts, or themes.
---

# Update the About page

The About page (`/about/`) is driven entirely by JSON. **Do not edit** `src/pages/about.astro` or any layout/component/CSS.

## Hard boundaries

See **content-boundaries**. Allowed files:

| Area | Path |
|------|------|
| Profile & bios | `src/content/profile/main.json` |
| Expertise & opportunities | `src/content/profile/professional.json` |
| Career timeline | `src/content/career/*.json` (one file per role) |
| Education | `src/content/education/*.json` (one file per entry) |
| Portrait image | `public/images/profile/` |

## What each file controls

### `profile/main.json`

- `name`, `displayName`, `portraitImage`, `contact.email`, `socialLinks`
- Localized: `location`, `title`, `tagline`, `shortBio`, `mediumBio`, `longBio`
- **About page uses `longBio`** in the header section

### `profile/professional.json`

- `summary` — used on homepage and elsewhere, not the About header
- `expertise` — string array rendered as tags on About (**Technical focus**)
- `opportunities` — homepage section (edit only if user asks)

### `src/content/career/{id}.json`

One JSON file per job. Sorted by `order` (ascending).

Fields: `id`, `order`, `period`, `company`, `role`, `location`, `description`, `highlights[]` — text fields except `company`/`period` use `{ en, no }`.

### `src/content/education/{id}.json`

Same pattern: `id`, `order`, `period`, `institution`, `title`, `description` with bilingual strings.

## Common tasks

**Update bio text** → edit `longBio` (and optionally `mediumBio` / `shortBio`) in `main.json`.

**Add a skill** → append to `expertise[]` in `professional.json` (plain strings, not localized).

**New job** → create `src/content/career/{slug}.json`, set `order` relative to existing entries.

**New degree** → create `src/content/education/{slug}.json`.

**Change portrait** → replace file in `public/images/profile/` and update `portraitImage` path.

## Validation

Run `npm run validate` after edits (see **validate-content**).

## Homepage hero

Headlines and CTAs on `/` come from `profile/hero.json` — use **update-home-hero**, not this skill.
