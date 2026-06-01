import { Marked } from "marked";
import { createHighlighter, type BundledLanguage, type Highlighter } from "shiki";

const SUPPORTED_LANGS = [
  "bash",
  "shell",
  "yaml",
  "sql",
  "python",
  "javascript",
  "typescript",
  "json",
  "dockerfile",
  "text"
] as const satisfies BundledLanguage[];

const THEME = "github-dark";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [THEME],
    langs: [...SUPPORTED_LANGS]
  });
  return highlighterPromise;
}

function detectLanguage(code: string, hint?: string): BundledLanguage | "text" {
  const normalized = hint.trim().toLowerCase().replace(/^language-/, "");
  if (normalized) {
    if (normalized === "yml") return "yaml";
    if (normalized === "sh" || normalized === "console" || normalized === "shell-session") return "bash";
    if (SUPPORTED_LANGS.includes(normalized as BundledLanguage)) {
      return normalized as BundledLanguage;
    }
  }

  const trimmed = code.trim();
  const lines = trimmed.split("\n");
  const firstLine = lines[0]?.trim() ?? "";

  if (/^\$\s/.test(firstLine)) return "bash";
  if (/^#\s*(inside|in)\s+the container/i.test(trimmed)) return "bash";
  if (/^(version:|services:|volumes:|  db:|  [a-zA-Z_-]+:)/m.test(trimmed)) return "yaml";
  if (/^(dropdb|createdb|psql|pg_dump|docker|find|cp|touch)\b/i.test(firstLine.replace(/^\$\s*/, ""))) {
    return "bash";
  }
  if (/^\/var\/lib\//.test(firstLine)) return "bash";
  if (/^(SELECT|CREATE|DROP|INSERT|UPDATE|DELETE)\b/i.test(trimmed)) return "sql";

  return "text";
}

async function highlightCode(code: string, hint = "") {
  const highlighter = await getHighlighter();
  const language = detectLanguage(code, hint);
  const loaded = highlighter.getLoadedLanguages().includes(language) ? language : "text";

  return highlighter.codeToHtml(code.replace(/\n$/, ""), {
    lang: loaded,
    theme: THEME
  });
}

const inlineMarked = new Marked({ gfm: true, breaks: false });

type Segment =
  | { type: "markdown"; content: string }
  | { type: "code"; content: string; lang: string };

function splitMarkdownSegments(markdown: string): Segment[] {
  const segments: Segment[] = [];
  const fencePattern = /```([^\n]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fencePattern.exec(markdown)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "markdown", content: markdown.slice(lastIndex, match.index) });
    }
    segments.push({ type: "code", content: match[2] ?? "", lang: match[1]?.trim() ?? "" });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < markdown.length) {
    segments.push({ type: "markdown", content: markdown.slice(lastIndex) });
  }

  return segments;
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const segments = splitMarkdownSegments(markdown);
  const htmlParts = await Promise.all(
    segments.map(async (segment) => {
      if (segment.type === "code") {
        return highlightCode(segment.content, segment.lang);
      }
      const trimmed = segment.content.trim();
      if (!trimmed) return "";
      return inlineMarked.parse(segment.content) as string;
    })
  );

  return htmlParts.join("");
}
