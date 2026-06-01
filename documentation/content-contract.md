# Content Contract

The repository is the CMS. Content is stored as JSON and Markdown, images are stored under `public/images`, and pages are generated statically by Astro.

## Critical

We do not accept AI slop on this site. All copy must sound like Thomas wrote it — specific, honest, and human.

Before drafting or publishing visible text, read [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) and avoid those patterns.

Reject or rewrite any prose that reads generic, over-polished, or machine-generated.

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
