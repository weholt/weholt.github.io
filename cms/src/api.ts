export type LocalizedString = { en: string; no: string };

export type SectionMeta = {
  id: string;
  label: string;
  kind: "singleton" | "collection" | "array" | "article";
  path: string;
};

export type ContentListItem = {
  id: string;
  label?: string;
  date?: string;
  status?: string;
};

export type MediaEntry = {
  name: string;
  path: string;
  url: string;
  type: "file" | "directory";
  size?: number;
};

export type ArticlePayload = {
  meta: Record<string, unknown>;
  bodyEn: string;
  bodyNo: string;
};

export type CommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || response.statusText);
  return data as T;
}

export const api = {
  sections: () => request<SectionMeta[]>("/api/sections"),
  list: (section: string) => request<ContentListItem[]>(`/api/content/${section}`),
  get: <T>(section: string, itemId?: string) =>
    request<T>(itemId ? `/api/content/${section}/${itemId}` : `/api/content/${section}`),
  save: (section: string, data: unknown, itemId?: string) =>
    request<{ ok: true }>(itemId ? `/api/content/${section}/${itemId}` : `/api/content/${section}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  create: (section: string, id: string, data: unknown) =>
    request<{ ok: true; id: string }>(`/api/content/${section}`, {
      method: "POST",
      body: JSON.stringify({ id, data })
    }),
  remove: (section: string, itemId: string) =>
    request<{ ok: true }>(`/api/content/${section}/${itemId}`, { method: "DELETE" }),
  media: (dir = "") => request<{ dir: string; entries: MediaEntry[] }>(`/api/media?dir=${encodeURIComponent(dir)}`),
  validate: () => request<CommandResult>("/api/validate", { method: "POST" }),
  generate: () => request<CommandResult>("/api/generate", { method: "POST" }),
  upload: async (files: File[], dest: string, autoName = false) => {
    const form = new FormData();
    for (const file of files) form.append("files", file);
    form.append("dest", dest);
    form.append("autoName", String(autoName));
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || response.statusText);
    return data as { uploaded: { name: string; path: string; url: string }[] };
  },
  uploadGallery: async (files: File[], galleryId: string) => {
    const form = new FormData();
    for (const file of files) form.append("files", file);
    form.append("galleryId", galleryId);
    const response = await fetch("/api/upload/gallery", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || response.statusText);
    return data as { uploaded: { name: string; url: string; photoId: string }[]; dest: string };
  }
};
