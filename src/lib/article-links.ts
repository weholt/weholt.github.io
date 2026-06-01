const LEGACY_ARTICLE_PATTERNS: Array<{ pattern: RegExp; articleId: string }> = [
  { pattern: /photographic-journey-and-why-fujifilm/i, articleId: "photographic-journey-fujifilm" },
  { pattern: /fuji-film-simulations-why-shoot-jpegs-raw/i, articleId: "fuji-film-simulations" },
  { pattern: /capture-one-a-review-of-sorts/i, articleId: "capture-one-vs-lightroom" },
  {
    pattern: /capture-one-praise-some-critical-thoughts-one-year-later/i,
    articleId: "capture-one-one-year-later"
  },
  { pattern: /fujifilm-vintage-lenses-x-e3-helios-44m/i, articleId: "fujifilm-helios-44m" },
  { pattern: /fujinon-18-135mm-the-holiday-lens/i, articleId: "fujinon-18-135mm" },
  { pattern: /lindesnes-lighthouse/i, articleId: "lindesnes-lighthouse" },
  { pattern: /akrehamn-at-karmoy/i, articleId: "akrehamn-karmoy" },
  { pattern: /i-want-to-ride-my-bicycle/i, articleId: "ride-my-bicycle" },
  { pattern: /nightshoots-with-x-t3-and-xf-56mm/i, articleId: "nightshoots-x-t3" },
  { pattern: /tromso-in-august-of/i, articleId: "tromso-august-2021" },
  { pattern: /optyx-faster-culling-with-fancy-ai/i, articleId: "optyx-faster-culling" },
  { pattern: /crete-2022|trip-to-crete-greece/i, articleId: "trip-to-crete-2022" },
  { pattern: /lofoten-with-visma/i, articleId: "lofoten-visma-2022" },
  { pattern: /upgrading-postgresql/i, articleId: "upgrading-postgresql-docker" },
  { pattern: /thomas-python-true|thomas-python/i, articleId: "thomas-python-true" },
  { pattern: /starting-over/i, articleId: "starting-over" },
  { pattern: /malaga-the-summer-of-2019/i, articleId: "malaga-summer-2019" }
];

const EXTERNAL_URL_REPLACEMENTS: Record<string, string> = {
  "http://topazlabs.com/denoise-ai-2/": "https://www.topazlabs.com/topaz-photo-ai",
  "https://topazlabs.com/denoise-ai-2/": "https://www.topazlabs.com/topaz-photo-ai",
  "https://learn.captureone.com/tutorials/color-editor-co11/":
    "https://support.captureone.com/hc/en-us/articles/360002601358-The-Color-Editor-overview",
  "https://github.com/weholt/django-sveve": "https://github.com/weholt?tab=repositories",
  "https://github.com/weholt/massiviu": "https://github.com/weholt?tab=repositories",
  "http://youtube.com/sinnabryggern": "https://www.youtube.com/sinnabryggern",
  "http://weholt.org/category/developer-diary/": "/writing/",
  "https://weholt.org/category/developer-diary/": "/writing/"
};

const LEGACY_HOST_PATTERN = /^https?:\/\/(?:www\.)?weholt\.org/i;

export function articleIdFromLegacyUrl(url: string): string | undefined {
  const normalized = url.replace(/\*/g, "");
  let pathname = "";

  try {
    pathname = decodeURIComponent(new URL(normalized).pathname);
  } catch {
    const match = normalized.match(/weholt\.org(\/[^)\s"'*]*)/i);
    pathname = match?.[1] || "";
  }

  if (/\/category\/developer-diary\/?$/i.test(pathname)) return "__writing__";
  if (/\/category\//i.test(pathname)) return undefined;

  for (const entry of LEGACY_ARTICLE_PATTERNS) {
    if (entry.pattern.test(pathname)) return entry.articleId;
  }

  return undefined;
}

export function resolveLegacyUrl(url: string): string | undefined {
  const articleId = articleIdFromLegacyUrl(url);
  if (articleId === "__writing__") return "/writing/";
  if (articleId) return `/articles/${articleId}/`;
  return undefined;
}

export function normalizeExternalUrl(url: string): string | null {
  const trimmed = url.trim().replace(/\*+$/, "");
  if (EXTERNAL_URL_REPLACEMENTS[trimmed]) return EXTERNAL_URL_REPLACEMENTS[trimmed];

  if (LEGACY_HOST_PATTERN.test(trimmed)) {
    const local = resolveLegacyUrl(trimmed);
    if (local) return local;
    return null;
  }

  return trimmed;
}

export function fixArticleLinks(content: string) {
  let next = content;

  next = next.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, rawUrl) => {
    const normalized = normalizeExternalUrl(rawUrl.replace(/\*/g, ""));
    if (normalized === null) return text;
    return `[${text}](${normalized})`;
  });

  next = next.replace(/(?<!\]\()https?:\/\/[^\s<>"')\]]+/g, (url) => normalizeExternalUrl(url) ?? url);

  next = next.replace(
    /^\*PS! For the best experience, read this story over at weholt\.org\. Medium keeps messing up when I import a story from my main blog\.\*\s*$/gim,
    ""
  );

  next = next.replace(
    /^For more photos & videos read \[the original post\]\([^)]+\) over at my website :-+\)\s*$/gim,
    ""
  );

  next = next.replace(
    /^\*Originally published at[\s\S]*?(?:weholt\.org[^)\n]*\)[^\n]*|weholt\.org\/[^)\n]*\))\.?\*?\s*$/gim,
    ""
  );

  next = next.replace(/\*Originally published at \*\[[^\]]*\]\(\/articles\/[^)]+\)\*\.\*/g, "");

  next = next.replace(
    /^\*Originally published at \[http:\/\/weholt\.org[^\]]*\]\([^)]+\)\.? Head on over there for hi-res version of the photos\.\s*$/gim,
    ""
  );

  next = next.replace(
    /Follow my developer diary over at \[http:\/\/weholt\.org\/category\/developer-diary\/\]\([^)]+\)\./g,
    "More developer articles are in [Writing](/writing/)."
  );

  next = next.replace(
    /For all the latest articles, follow me over at my personal blog as well, at \[weholt\.org\]\([^)]+\)\./g,
    "More articles are available in [Writing](/writing/)."
  );

  next = next.replace(
    /https:\/\/docs\.google\.com\/spreadsheets\/d\/1R7Zau2LIoy5vd5sPXrIGmtGbrSGlj_fPYPPG2rsWMFg\/htmlview\?[^)\s]+/g,
    "https://fujixweekly.com/recipes/"
  );

  next = next.replace(/\n{3,}/g, "\n\n");
  return next.trimEnd() + "\n";
}
