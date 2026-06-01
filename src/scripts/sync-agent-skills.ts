import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, ".agents", "skills");

const targets = [
  { dir: join(root, ".cursor", "skills"), label: "cursor" },
  { dir: join(root, ".claude", "skills"), label: "claude" },
  { dir: join(root, ".opencode", "skills"), label: "opencode", opencode: true }
] as const;

function parseFrontmatter(content: string) {
  if (!content.startsWith("---\n")) return { frontmatter: "", body: content };

  const end = content.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: "", body: content };

  return {
    frontmatter: content.slice(4, end),
    body: content.slice(end + 5)
  };
}

function withOpencodeFrontmatter(frontmatter: string) {
  const lines = frontmatter.split("\n").filter(Boolean);
  const hasCompatibility = lines.some((line) => line.startsWith("compatibility:"));
  const hasMetadata = lines.some((line) => line.startsWith("metadata:"));

  if (hasCompatibility && hasMetadata) return lines.join("\n");

  const next = [...lines];
  if (!hasCompatibility) next.push("compatibility: opencode");
  if (!hasMetadata) {
    next.push("metadata:");
    next.push("  project: weholt-org");
  }
  return next.join("\n");
}

function syncSkillDirectory(targetRoot: string, name: string, opencode: boolean) {
  const sourceDir = join(sourceRoot, name);
  const targetDir = join(targetRoot, name);

  if (existsSync(targetDir)) rmSync(targetDir, { recursive: true, force: true });
  cpSync(sourceDir, targetDir, { recursive: true });

  const skillPath = join(targetDir, "SKILL.md");
  if (!opencode || !existsSync(skillPath)) return;

  const content = readFileSync(skillPath, "utf8");
  const { frontmatter, body } = parseFrontmatter(content);
  if (!frontmatter) return;

  const updated = `---\n${withOpencodeFrontmatter(frontmatter)}\n---\n${body}`;
  writeFileSync(skillPath, updated, "utf8");
}

function main() {
  if (!existsSync(sourceRoot)) {
    console.error("Missing canonical skills at .agents/skills/");
    process.exit(1);
  }

  const skillNames = readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(sourceRoot, name, "SKILL.md")));

  if (skillNames.length === 0) {
    console.error("No skills found in .agents/skills/");
    process.exit(1);
  }

  for (const target of targets) {
    mkdirSync(target.dir, { recursive: true });
    for (const name of skillNames) {
      syncSkillDirectory(target.dir, name, "opencode" in target && target.opencode === true);
      console.log(`synced ${name} → ${target.label}`);
    }
  }

  console.log(`\nSynced ${skillNames.length} skills to Cursor, Claude, and OpenCode.`);
}

main();
