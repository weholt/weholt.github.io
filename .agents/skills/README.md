# Agent skills (canonical source)

Edit skills in **`.agents/skills/`**, then sync to Cursor, Claude Code, and OpenCode:

```bash
npm run sync-skills
```

## Locations after sync

| Tool | Path |
|------|------|
| **Edit here** | `.agents/skills/{name}/SKILL.md` |
| Cursor | `.cursor/skills/{name}/` |
| Claude Code | `.claude/skills/{name}/` |
| OpenCode | `.opencode/skills/{name}/` |

OpenCode copies get `compatibility: opencode` in `SKILL.md` frontmatter. The skill `name` field must match the directory name.

Supporting files (e.g. `frontend-design/LICENSE.txt`) are copied with each skill directory.

## Content skills

Content-only edits — no template/theme changes unless explicitly requested.

| Skill | Purpose |
|-------|---------|
| content-boundaries | Allow/deny list for content edits |
| personal-homepage-content | CMS overview; points to granular skills |
| add-project | New project on `/projects/` |
| update-about | About page (profile, career, education) |
| update-home-hero | Homepage hero (`hero.json`) |
| add-writing-post | New article on `/writing/` |
| add-photography-post | Galleries and photo essays |
| wire-photography-gallery | Connect on-disk images to JSON |
| publish-or-archive-content | Draft, publish, pin, reorder |
| fix-article-links | Repair markdown links in articles |
| validate-content | `npm run validate` / `build` |

## Open Design skills

Used with `design-systems/` and `DESIGN.md` for visual work on the site.

| Skill | Purpose |
|-------|---------|
| design-brief | Structured I-Lang brief → design spec / DESIGN.md |
| design-consultation | Design system kickoff from scratch |
| design-review | Visual audit and UI fixes |
| frontend-design | Distinctive production UI (Open Design aware) |
| web-design-guidelines | Vercel-style product UI standards |

## Related repo assets

- `design-systems/editorial/`, `linear-app/`, `vercel/` — reference tokens and components
- `DESIGN.md` — live site design contract (editorial-derived)

## Do not edit sync targets directly

Changes to `.cursor/skills/`, `.claude/skills/`, or `.opencode/skills/` are overwritten by `npm run sync-skills`. Always edit `.agents/skills/` first.
