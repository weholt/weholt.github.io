import { useEffect, useState } from "react";
import { api, type MediaEntry } from "../api";
import { FileDropZone } from "../components/FileDropZone";
import { mediaUrl } from "../lib/mediaUrl";

export function MediaPage() {
  const [dir, setDir] = useState("");
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [uploadDir, setUploadDir] = useState("");
  const [autoName, setAutoName] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh(currentDir = "") {
    setLoading(true);
    setError(null);
    try {
      const result = await api.media(currentDir);
      setDir(result.dir);
      setEntries(result.entries);
    } catch (err) {
      setError(String(err));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh("");
  }, []);

  async function upload(files: File[]) {
    const dest = uploadDir.trim() || dir;
    try {
      const result = await api.upload(files, dest, autoName);
      setMessage({ text: `Uploaded ${result.uploaded.length} file(s) to images/${dest || ""}`, ok: true });
      await refresh(dest);
    } catch (err) {
      setMessage({ text: String(err), ok: false });
    }
  }

  function openDirectory(entry: MediaEntry) {
    const next = entry.path.replace(/^images\/?/, "");
    void refresh(next);
  }

  function goUp() {
    const parts = dir.split("/").filter(Boolean);
    parts.pop();
    void refresh(parts.join("/"));
  }

  const folders = entries.filter((entry) => entry.type === "directory");
  const files = entries.filter((entry) => entry.type === "file");

  return (
    <div className="media-page">
      <h2>Media library</h2>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Browse and upload files under <code>public/images/</code>.
      </p>

      <div className="media-toolbar panel">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Current folder</label>
          <div className="toolbar">
            <code>images/{dir || "(root)"}</code>
            {dir && (
              <button type="button" className="btn" onClick={goUp}>
                Up
              </button>
            )}
            <button type="button" className="btn" onClick={() => void refresh(dir)} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && <div className="status error">{error}</div>}

      <section className="media-browser" aria-label="Folders and files">
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading…</p>
        ) : entries.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>This folder is empty.</p>
        ) : (
          <div className="media-grid">
            {folders.map((entry) => (
              <button
                key={entry.path}
                type="button"
                className="media-card media-card-folder"
                aria-label={`Open folder ${entry.name}`}
                onClick={() => openDirectory(entry)}
              >
                <div className="media-folder-icon" aria-hidden>
                  📁
                </div>
                <div className="meta">{entry.name}/</div>
              </button>
            ))}
            {files.map((entry) => (
              <div key={entry.path} className="media-card">
                <img src={mediaUrl(entry.path)} alt={entry.name} loading="lazy" />
                <div className="meta">
                  {entry.name}
                  <br />
                  <code>{entry.url}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <details className="panel media-upload-panel">
        <summary>Upload files</summary>
        <div className="grid-2" style={{ marginTop: "0.75rem" }}>
          <div className="field">
            <label>Upload destination (relative to images/)</label>
            <input
              placeholder="medium/my-gallery"
              value={uploadDir}
              onChange={(event) => setUploadDir(event.target.value)}
            />
          </div>
          <div className="field">
            <label>
              <input type="checkbox" checked={autoName} onChange={(event) => setAutoName(event.target.checked)} />{" "}
              Auto-name as image-001.jpg, image-002.jpg, …
            </label>
          </div>
        </div>
        <FileDropZone onFiles={upload} accept="image/*,.svg" />
        {message && <div className={`status ${message.ok ? "ok" : "error"}`}>{message.text}</div>}
      </details>
    </div>
  );
}
