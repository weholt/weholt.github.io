import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type ArticlePayload } from "../api";
import { JsonEditor } from "../components/JsonEditor";
import { SaveBar } from "../components/SaveBar";

export function ArticleEditorPage() {
  const { id } = useParams();
  const [data, setData] = useState<ArticlePayload | null>(null);
  const [saved, setSaved] = useState<ArticlePayload | null>(null);
  const [tab, setTab] = useState<"meta" | "en" | "no">("meta");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<ArticlePayload>("articles", id).then((value) => {
      setData(value);
      setSaved(value);
    });
  }, [id]);

  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(saved), [data, saved]);

  async function save() {
    if (!id || !data) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.save("articles", data, id);
      setSaved(data);
      setMessage({ text: "Saved.", ok: true });
    } catch (error) {
      setMessage({ text: String(error), ok: false });
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <p>
        <Link to="/articles">← Articles</Link>
      </p>
      <h2>{id}</h2>
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} />
      {message && <div className={`status ${message.ok ? "ok" : "error"}`}>{message.text}</div>}
      <div className="tabs">
        <button className={tab === "meta" ? "active" : ""} onClick={() => setTab("meta")}>
          Metadata
        </button>
        <button className={tab === "en" ? "active" : ""} onClick={() => setTab("en")}>
          Body (EN)
        </button>
        <button className={tab === "no" ? "active" : ""} onClick={() => setTab("no")}>
          Body (NO)
        </button>
      </div>
      <div className="panel">
        {tab === "meta" && <JsonEditor value={data.meta} onChange={(meta) => setData({ ...data, meta: meta as Record<string, unknown> })} />}
        {tab === "en" && (
          <textarea
            value={data.bodyEn}
            onChange={(event) => setData({ ...data, bodyEn: event.target.value })}
            style={{ width: "100%", minHeight: "28rem", fontFamily: "Consolas, monospace" }}
          />
        )}
        {tab === "no" && (
          <textarea
            value={data.bodyNo}
            onChange={(event) => setData({ ...data, bodyNo: event.target.value })}
            style={{ width: "100%", minHeight: "28rem", fontFamily: "Consolas, monospace" }}
          />
        )}
      </div>
    </div>
  );
}
