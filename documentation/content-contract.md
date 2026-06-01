# Content Contract

The repository is the CMS. Content is stored as JSON and Markdown, images are stored under `public/images`, and pages are generated statically by Astro.

## Localization

Every visible short string should use this shape:

```json
{ "en": "English text", "no": "Norsk tekst" }
```

## Voice variants

Hero text can vary by voice profile:

```json
{
  "professional": { "en": "...", "no": "..." },
  "personal": { "en": "...", "no": "..." },
  "playful": { "en": "...", "no": "..." },
  "experimental": { "en": "...", "no": "..." }
}
```

Themes and layouts select the default voice.

## Image paths

Use `/images/...` in JSON. The renderer prefixes the configured Astro base path, so the same content works both for root GitHub Pages sites and project pages.
