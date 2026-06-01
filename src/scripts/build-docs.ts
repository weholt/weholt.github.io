import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const docsDir = join(root, "docs");

function run(label: string, command: string, args: string[]) {
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

process.env.PUBLIC_SITE_URL ??= "https://weholt.github.io";
process.env.PUBLIC_BASE_PATH ??= "/";

console.log(`Generating site into ${docsDir}`);

run("validate content", "npm", ["run", "validate"]);
run("build static site", "npx", ["astro", "build"]);

console.log(`\nSite generated in ./docs`);
