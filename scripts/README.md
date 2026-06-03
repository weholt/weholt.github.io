# Project scripts

Helper scripts for setting up and running **weholt.org** (Astro site + local CMS).

## Setup (first time / fresh clone)

Installs `npm` dependencies for the repo root and `cms/`.

```bash
npm run setup
```

Or directly:

```bash
node scripts/setup.mjs
./scripts/setup.sh
```

### Options

| Flag | Description |
|------|-------------|
| `--e2e` | Also install the Chromium browser used by CMS e2e tests (`@playwright/cli`) |
| `--skip-root` | Only install `cms/` dependencies |
| `--skip-cms` | Only install root site dependencies |

Examples:

```bash
npm run setup:e2e
node scripts/setup.mjs --e2e
```

Windows PowerShell:

```powershell
.\scripts\setup.ps1
.\scripts\setup.ps1 -E2e
```

## After setup

| Task | Command |
|------|---------|
| Astro dev server | `npm run dev` → http://localhost:4321 |
| CMS editor | `npm run cms` → http://localhost:5174 (API on 3456) |
| Validate content | `npm run validate` |
| Build site | `npm run build` |
| CMS e2e tests | `cd cms && npm run test:e2e` |

Content tooling (import, EXIF, etc.) lives under `src/scripts/` and is invoked via `npm run` scripts in the root `package.json`.
