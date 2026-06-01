---
name: update-home-hero
description: >-
  Update the weholt.org homepage hero (headline, subheadline, CTAs) by editing
  src/content/profile/hero.json only. Content-only — never templates, layouts,
  or themes.
---

# Update homepage hero

The homepage hero (`/` developer-clean and other layouts) reads from **`src/content/profile/hero.json`** only.

## Hard boundaries

**Allowed:** `src/content/profile/hero.json`

**Never edit:** `src/pages/index.astro`, layouts, components, styles, themes.

See **content-boundaries**.

## File structure

```json
{
  "eyebrow": { "en": "...", "no": "..." },
  "headline": {
    "professional": { "en": "...", "no": "..." },
    "personal": { "en": "...", "no": "..." },
    "playful": { "en": "...", "no": "..." },
    "experimental": { "en": "...", "no": "..." }
  },
  "subheadline": {
    "professional": { "en": "...", "no": "..." },
    "personal": { "en": "...", "no": "..." },
    "playful": { "en": "...", "no": "..." },
    "experimental": { "en": "...", "no": "..." }
  },
  "primaryCta": {
    "label": { "en": "...", "no": "..." },
    "href": "/projects/"
  },
  "secondaryCta": {
    "label": { "en": "...", "no": "..." },
    "href": "/writing/"
  }
}
```

## Voice variants

The active voice comes from `data-voice` on `<html>` (user shuffle or defaults in `site.json`). Each voice can have different headline/subheadline text.

When the user edits one voice only, leave other voices unchanged unless they ask to sync them.

## CTA links

`href` values are site paths like `/projects/` or `/writing/` — not full URLs.

## Validation

Run `npm run validate` after edits.

## Not in this file

- Bio paragraphs → **update-about** (`profile/main.json`)
- Expertise tags → `profile/professional.json`
- Site default theme/layout → `settings/site.json` (out of scope unless explicitly requested)
