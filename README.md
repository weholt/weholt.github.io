# Personal Homepage Astro Scaffold

Static personal homepage scaffold for a bilingual, file-based, agent-managed portfolio.

## Stack

Astro, TypeScript, Zod validation, Markdown article bodies, static GitHub Pages deployment, file-per-entry content.

## Quick start

```bash
npm run setup
```

Installs dependencies for the Astro site and the local CMS (`cms/`). On a fresh clone, run this once before anything else.

```bash
npm run dev
```

```bash
npm run validate
```

```bash
npm run build
```

```bash
npm run generate
```

Builds the full static site into `./docs/` for GitHub Pages (includes validation and sets `PUBLIC_SITE_URL` / `PUBLIC_BASE_PATH` for `weholt.github.io`).

```bash
npm run preview
```

## GitHub Pages build for a user site

Use this when deploying to `https://weholt.github.io/`.

```bash
PUBLIC_SITE_URL=https://weholt.github.io PUBLIC_BASE_PATH=/ npm run build
```

The static site is written to `docs/`. That folder is what GitHub Pages serves when the repository is configured to publish from the `/docs` folder on `main`. A `.nojekyll` file is included so GitHub skips Jekyll processing.

## GitHub Pages build for a project site

Use this when deploying to `https://weholt.github.io/<repo-name>/`.

```bash
PUBLIC_SITE_URL=https://weholt.github.io PUBLIC_BASE_PATH=/repo-name/ npm run build
```

## Content model

```text
src/content/profile/main.json
src/content/profile/hero.json
src/content/profile/professional.json
src/content/settings/site.json
src/content/career/*.json
src/content/education/*.json
src/content/projects/*.json
src/content/articles/<article-id>/index.json
src/content/articles/<article-id>/body.en.md
src/content/articles/<article-id>/body.no.md
src/content/photography/categories.json
src/content/photography/photos.json
src/content/photography/galleries.json
```

## Agent instructions

See `.agent/skills/personal-homepage-content/SKILL.md`.

## Local CMS (React editor)

Edit `src/content/` and upload images via the built-in CMS:

```bash
npm run setup    # if you have not already
npm run cms        # http://localhost:5174
```

See `cms/README.md` and `scripts/README.md` for details, e2e tests, and setup options.

## Human CMS option

A starter `.pages.yml` is included for Pages CMS. It is intentionally minimal and can be expanded after the content model settles.

## Layout and theme testing

Use query parameters while developing.

```text
/?layout=developer-clean&theme=nordic-dark&voice=professional&lang=en
```

```text
/?layout=editorial&theme=photo-noir&voice=personal&lang=no
```

```text
/?layout=photography-first&theme=weird-lab&voice=experimental&lang=en
```
