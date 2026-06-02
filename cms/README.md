# Weholt.org CMS

Local React app for managing site content and media files.

## Start

```bash
npm run cms
```

Or from the `cms/` folder:

```bash
npm install
npm run dev
```

- UI: http://localhost:5174
- API: http://localhost:3456

## What it manages

- Profile, hero, professional summary, site settings
- Career, education, projects
- Articles (metadata + EN/NO markdown bodies)
- Photography categories, photos, galleries
- Media library (`/media-library`) with drag-and-drop upload to `public/images/`

Edits write directly to `src/content/` and `public/images/`. Use **Validate content** on the dashboard before generating the site.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run cms` | Start CMS from project root |
| `npm run dev` | Start API + UI (in `cms/`) |
| `npm run build` | Build UI for production |
| `npm start` | API only (serves built UI from `cms/dist` if present) |
