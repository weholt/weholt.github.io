---
name: personal-homepage-content-editor
description: Use this skill when adding, editing, validating or reorganizing content for Thomas Weholt's static personal homepage. The site is a bilingual, employer-facing portfolio, writing platform, photography showcase and personal lab. Content is managed as flat files in Git and may be edited by agents through pull requests.
---

# Personal Homepage Content Editor Skill

## Purpose

Maintain the content files for Thomas Weholt's static personal homepage without breaking the separation between content, layout and theme.

The homepage is not a consulting sales page. It is an employer-facing portfolio and personal lab showing software development experience, Python/open-source interests, AI-assisted development work, writing and photography.

## Non-negotiable rules

0. **No AI slop.** We do not accept machine-generated filler on this site. Read [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) and write like a human — specific, honest, Thomas's voice. Reject generic, over-polished prose.

1. Do not edit layout, component or theme code when the task is only to add or update content.
2. Use many small content files instead of one large JSON file.
3. Keep public content bilingual unless the user explicitly requests otherwise.
4. Every visible text field must support both English and Norwegian using `{ "en": "...", "no": "..." }`.
5. Use stable lowercase kebab-case IDs.
6. Do not rename IDs, folders or slugs unless the task explicitly asks for a migration.
7. Do not publish phone numbers, private addresses or sensitive personal information unless explicitly requested.
8. Images must live under `public/images/` and be referenced as `/images/...`.
9. Long articles use `index.json`, `body.en.md` and `body.no.md`.
10. Do not invent detailed career facts, employment history, education, certifications or project claims.
11. Do not mark draft content as published unless explicitly requested.
12. Prefer pull requests over direct commits to `main`.
13. When unsure, add content as `draft` and include a clear note in the agent report.

## Repository structure

Expected content paths:

```text
src/content/settings/
src/content/profile/
src/content/professional/
src/content/career/
src/content/education/
src/content/projects/
src/content/articles/
src/content/photography/
public/images/
```

Expected image paths:

```text
public/images/profile/
public/images/projects/<project-id>/
public/images/articles/<article-id>/
public/images/photography/<category-or-gallery>/
```

## Content types

### Settings

Use `src/content/settings/` for site-wide configuration, navigation, voice profiles and status lists.

Agents may update settings only when asked to change global behavior, labels, status values, navigation, theme defaults or language behavior.

### Profile

Use `src/content/profile/` for identity, biography, hero text and tone variants.

Profile content should be honest, employer-facing and reusable across layouts.

Do not over-optimize profile text for one layout.

### Professional content

Use `src/content/professional/` for expertise, opportunity areas and work interests.

Do not use sales language such as `hire me for services`, `packages`, `rates` or `book a consultation` unless the user explicitly changes the site purpose.

Preferred framing:

```text
What I would like to work on
Work I am interested in
Areas where I can contribute
Technical focus areas
```

### Career

Use one file per career entry:

```text
src/content/career/<company-or-role-id>.json
```

Each entry must include:

```json
{
  "id": "stable-id",
  "period": "YYYY-YYYY",
  "role": {
    "en": "Role",
    "no": "Rolle"
  },
  "company": "Company",
  "location": "Location",
  "description": {
    "en": "English description",
    "no": "Norsk beskrivelse"
  },
  "highlights": ["tag", "tag"],
  "order": 10
}
```

### Education

Use one file per education entry:

```text
src/content/education/<education-id>.json
```

Keep education factual and concise.

### Projects

Use one file per project:

```text
src/content/projects/<project-id>.json
```

Allowed project statuses:

```text
featured
active
experimental
historical
archived
draft
```

Use this structure:

```json
{
  "id": "project-id",
  "title": {
    "en": "Project title",
    "no": "Project title"
  },
  "summary": {
    "en": "Short English summary",
    "no": "Kort norsk sammendrag"
  },
  "description": {
    "en": "Longer English description",
    "no": "Lengre norsk beskrivelse"
  },
  "repo": "repo-name",
  "url": "https://github.com/weholt/repo-name",
  "image": "/images/projects/project-id/cover.jpg",
  "status": "draft",
  "featured": false,
  "tags": ["Python", "Django"],
  "order": 100
}
```

Project status meaning:

```text
featured: should be highlighted strongly
active: current or maintained enough to show normally
experimental: interesting but exploratory
historical: old but worth showing as part of the story
archived: kept for history, not presented as active
draft: incomplete entry, not ready for public prominence
```

When adding a project, create the project file first. Only add images if the image files are available or supplied. If no image is available, either omit `image` or use a known placeholder path that exists.

### Articles

Use a folder per article:

```text
src/content/articles/<article-id>/index.json
src/content/articles/<article-id>/body.en.md
src/content/articles/<article-id>/body.no.md
```

The article metadata file must use this structure:

```json
{
  "id": "article-id",
  "title": {
    "en": "English title",
    "no": "Norsk tittel"
  },
  "summary": {
    "en": "English summary",
    "no": "Norsk sammendrag"
  },
  "date": "YYYY-MM-DD",
  "status": "draft",
  "coverImage": "/images/articles/article-id/cover.jpg",
  "body": {
    "en": "body.en.md",
    "no": "body.no.md"
  },
  "tags": ["tag"],
  "featured": false,
  "order": 100
}
```

Allowed article statuses:

```text
published
draft
archived
```

Do not put long article bodies inside JSON.

When adding a draft article, use `status: "draft"` and add a clear outline in both Markdown files.

### Photography

Use `src/content/photography/categories.json` for categories and `src/content/photography/images.json` for image metadata.

Allowed photography categories:

```text
fujifilm
portraits
travel
street
landscape
```

Image entries should use this structure:

```json
{
  "id": "stable-image-id",
  "src": "/images/photography/category/file.jpg",
  "alt": {
    "en": "English alt text",
    "no": "Norsk alt-tekst"
  },
  "title": {
    "en": "English title",
    "no": "Norsk tittel"
  },
  "caption": {
    "en": "English caption",
    "no": "Norsk bildetekst"
  },
  "categories": ["fujifilm", "street"],
  "camera": "Fujifilm X-T5",
  "lens": "XF 16-55mm f/2.8",
  "date": "YYYY-MM-DD",
  "status": "draft",
  "featured": false,
  "order": 100
}
```

Image status meaning:

```text
published: visible in public gallery
hidden: valid but intentionally hidden
draft: not ready yet
```

## Language rules

Use English and Norwegian for all public labels, summaries, descriptions, titles, captions and article bodies.

Norwegian should be Bokmål unless the user explicitly asks for Nynorsk.

If the user supplies content in only one language, create a careful translation for the other language and note that it was translated by the agent.

Do not mix English and Norwegian in the same field unless it is a name, technology or proper noun.

## Tone and voice rules

The site supports these voice profiles:

```text
professional
personal
playful
experimental
```

Use tone variants only for high-impact copy such as hero headlines, intros and section openers.

Do not create four variants for every small field. Most factual content should use a normal localized string.

Recommended mapping:

```text
developer-clean -> professional
minimal-nordic -> professional
photo-noir -> personal
editorial -> personal
weird-lab -> experimental
brutalist -> playful or experimental
```

## ID and slug rules

Use lowercase kebab-case.

Good:

```text
serpentarium-core
ambivalent-ai-relationship
atomic-framework
wagtail-image-uploader
```

Bad:

```text
SerpentariumCore
ambivalent_ai_relationship
article1
new-project-final-final
```

IDs are permanent. Do not rename them casually.

## Image rules

All referenced images must exist before content is marked as published.

Image references must start with `/images/`.

Good:

```text
/images/projects/serpentarium-core/cover.jpg
```

Bad:

```text
../images/project.jpg
public/images/project.jpg
C:\Users\Thomas\Pictures\project.jpg
```

Do not hotlink production images from Unsplash or other external services. Development placeholders are acceptable only when clearly marked as draft or development images.

## Privacy rules

Do not publish:

```text
phone number
private home address
personal identification numbers
private family details beyond what is already intentionally public
private employer/internal project details
confidential work information
```

Email may be public:

```text
thomas@weholt.org
```

## Agent workflow

When performing a content edit:

1. Identify the content type.
2. Locate the correct folder.
3. Create or update the smallest possible file.
4. Preserve existing IDs and slugs.
5. Add both English and Norwegian text.
6. Keep status as `draft` unless publication was requested.
7. Verify image paths.
8. Run validation if available.
9. Report exactly what changed.

## Validation commands

Use single-line commands.

```bash
npm run validate
```

```bash
npm run build
```

If a dedicated image validator exists:

```bash
npm run validate:images
```

If a dedicated content validator exists:

```bash
npm run validate:content
```

## Common task recipes

### Add a new project

1. Create `src/content/projects/<project-id>.json`.
2. Add bilingual title, summary and description.
3. Add tags.
4. Set `status` to `draft` unless told otherwise.
5. Add `repo` and `url` if known.
6. Add image only if the image file exists.
7. Run validation.

### Add a new article

1. Create `src/content/articles/<article-id>/`.
2. Create `index.json`.
3. Create `body.en.md`.
4. Create `body.no.md`.
5. Set status to `draft` unless publication was requested.
6. Add cover image only if available.
7. Run validation.

### Add a new photograph

1. Copy image to `public/images/photography/<category-or-gallery>/`.
2. Add metadata to `src/content/photography/images.json`.
3. Add bilingual alt text.
4. Add at least one category.
5. Set status to `draft` unless publication was requested.
6. Run validation.

### Update profile text

1. Edit `src/content/profile/main.json` for factual biography updates.
2. Edit `src/content/profile/hero.json` for tone/hero copy changes.
3. Keep professional facts neutral.
4. Keep tone variants short.
5. Run validation.

### Change positioning from employer-facing to service-sales

Do not do this unless explicitly requested.

If requested, update:

```text
src/content/professional/opportunities.json
src/content/profile/hero.json
navigation labels if needed
page section labels if needed
```

## Output report format

After editing content, report in this format:

```markdown
# Content update report

## Changed files

- `path/to/file.json` — short explanation.
- `path/to/file.md` — short explanation.

## Status

- Validation: passed / failed / not run.
- Build: passed / failed / not run.

## Notes

- Any assumptions.
- Any missing images.
- Any content left as draft.
```

## Default site positioning

Use this as the mental model for all content decisions:

```text
Thomas Weholt is a senior software developer from Norway with long experience in enterprise systems and Workforce Management, a strong private/open-source focus on Python, Django, Wagtail, Linux, automation and developer tooling, and a current interest in AI-assisted development workflows. The site should present a credible professional profile while preserving a personal, curious, experimental tone.
```
