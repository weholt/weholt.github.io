import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "src", "content", "articles");

const LINK_PATTERN = /\[([^\]]*)\]\(([^)]+)\)|https?:\/\/[^\s\)<>"']+/g;

function walkMarkdown(dir: string, files: string[] = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkMarkdown(path, files);
    else if (/body\.(en|no)\.md$/.test(name)) files.push(path);
  }
  return files;
}

function extractLinks(content: string) {
  const links = new Set<string>();
  for (const match of content.matchAll(LINK_PATTERN)) {
    const url = match[2] || match[0];
    if (url.startsWith("http") || url.startsWith("/")) links.add(url.replace(/\*+$/, "").trim());
  }
  return [...links];
}

async function checkUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WeholtLinkChecker/1.0)" },
      signal: AbortSignal.timeout(15000)
    });
    return { url, status: response.status, ok: response.ok, finalUrl: response.url };
  } catch (error) {
    return { url, status: 0, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  const files = walkMarkdown(root);
  const allLinks = new Map<string, string[]>();

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const link of extractLinks(content)) {
      allLinks.set(link, [...(allLinks.get(link) || []), file]);
    }
  }

  const unique = [...allLinks.keys()].sort();
  console.log(`Found ${unique.length} unique links in ${files.length} files\n`);

  const weholt = unique.filter((url) => /weholt\.org/i.test(url));
  const local = unique.filter((url) => url.startsWith("/"));
  const external = unique.filter((url) => !url.startsWith("/") && !/weholt\.org/i.test(url));

  console.log(`weholt.org: ${weholt.length}`);
  console.log(`local paths: ${local.length}`);
  console.log(`external: ${external.length}\n`);

  console.log("=== weholt.org links ===");
  for (const url of weholt) console.log(url);

  console.log("\n=== Checking external links (sample/all) ===");
  const results = [];
  for (const url of external) {
    results.push(await checkUrl(url));
    await new Promise((r) => setTimeout(r, 200));
  }

  const broken = results.filter((r) => !r.ok);
  const ok = results.filter((r) => r.ok);

  console.log(`OK: ${ok.length}, Broken: ${broken.length}\n`);
  for (const item of broken.sort((a, b) => a.url.localeCompare(b.url))) {
    console.log(`FAIL ${item.status || "ERR"} ${item.url}${item.error ? ` (${item.error})` : ""}`);
  }
}

main().catch(console.error);
