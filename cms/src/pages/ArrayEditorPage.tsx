import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { JsonEditor } from "../components/JsonEditor";
import { SaveBar } from "../components/SaveBar";
import { mediaUrl } from "../lib/mediaUrl";

type Props = {
  section: string;
  title: string;
  itemLabel: string;
  searchable?: boolean;
};

type Item = Record<string, unknown> & { id?: string; title?: { en?: string } };

export function ArrayEditorPage({ section, title, itemLabel, searchable }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [saved, setSaved] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    setLoading(true);
    setQuery("");
    setMessage(null);
    api
      .get<Item[]>(section)
      .then((value) => {
        setItems(value);
        setSaved(value);
        setSelectedId(value[0]?.id ?? null);
      })
      .catch((error) => {
        setMessage({ text: String(error), ok: false });
      })
      .finally(() => setLoading(false));
  }, [section]);

  const dirty = useMemo(() => JSON.stringify(items) !== JSON.stringify(saved), [items, saved]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      [item.id, item.title?.en, (item as { src?: string }).src]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, query]);

  const current = items.find((item) => item.id === selectedId) ?? null;

  function updateCurrent(next: Item) {
    if (!selectedId) return;
    setItems((prev) => prev.map((item) => (item.id === selectedId ? next : item)));
  }

  async function saveAll() {
    setSaving(true);
    setMessage(null);
    try {
      await api.save(section, items);
      setSaved(items);
      setMessage({ text: "Saved.", ok: true });
    } catch (error) {
      setMessage({ text: String(error), ok: false });
    } finally {
      setSaving(false);
    }
  }

  function addItem() {
    const id = `${itemLabel.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const next: Item = { id, title: { en: `New ${itemLabel}`, no: `Ny ${itemLabel}` } };
    setItems((prev) => {
      const updated = [...prev, next];
      setSelectedId(id);
      return updated;
    });
  }

  function removeCurrent() {
    if (!current?.id || !confirm(`Remove ${current.id}?`)) return;
    const removedId = current.id;
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== removedId);
      if (selectedId === removedId) {
        setSelectedId(updated[0]?.id ?? null);
      }
      return updated;
    });
  }

  return (
    <div>
      <h2>{title}</h2>
      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={() => void saveAll()}
        extra={
          <>
            <button className="btn" onClick={addItem}>
              Add {itemLabel.toLowerCase()}
            </button>
            {current && (
              <button className="btn btn-danger" onClick={removeCurrent}>
                Remove
              </button>
            )}
          </>
        }
      />
      {message && <div className={`status ${message.ok ? "ok" : "error"}`}>{message.text}</div>}

      {loading ? (
        <p className="loading-hint">Loading…</p>
      ) : (
      <div className="list-panel">
        <div>
          {searchable && (
            <input
              placeholder="Search…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="search-input"
            />
          )}
          <div className="item-list" style={{ maxHeight: "70vh", overflow: "auto" }}>
            {filtered.map((item) => (
              <button
                key={item.id}
                className={item.id === selectedId ? "active" : ""}
                onClick={() => setSelectedId(item.id ?? null)}
              >
                <div>{item.title?.en || item.id}</div>
                <div className="item-meta">{item.id}</div>
              </button>
            ))}
          </div>
          <div className="list-footer">
            {items.length} item(s)
            {query.trim() ? ` · ${filtered.length} shown` : ""}
          </div>
        </div>
        <div>
          {current ? (
            <div className="panel">
              {(current as { src?: string }).src && (
                <img
                  className="gallery-cover"
                  src={mediaUrl(String((current as { src?: string }).src))}
                  alt=""
                />
              )}
              <JsonEditor
                key={current.id}
                value={current}
                onChange={(value) => updateCurrent(value as Item)}
              />
            </div>
          ) : (
            <p>No items yet.</p>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
