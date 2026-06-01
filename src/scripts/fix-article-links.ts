import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fixArticleLinks } from "../lib/article-links";

const articlesRoot = join(process.cwd(), "src", "content", "articles");

function walkMarkdown(dir: string, files: string[] = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkMarkdown(path, files);
    else if (/body\.(en|no)\.md$/.test(name)) files.push(path);
  }
  return files;
}

function main() {
  const files = walkMarkdown(articlesRoot);
  let changed = 0;

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const updated = fixArticleLinks(original);
    if (updated !== original) {
      writeFileSync(file, updated, "utf8");
      changed += 1;
      console.log(`updated ${relative(process.cwd(), file)}`);
    }
  }

  console.log(`\nFixed links in ${changed}/${files.length} files.`);
}

main();
