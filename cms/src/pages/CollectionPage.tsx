import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, type ContentListItem } from "../api";
import { JsonEditor, type JsonEditorHandle } from "../components/JsonEditor";
import { SaveBar } from "../components/SaveBar";

type Props = {
  section: string;
  title: string;
};

export function CollectionPage({ section, title }: Props) {
  const editorRef = useRef<JsonEditorHandle>(null);
  const [items, setItems] = useState<ContentListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);
  const [saved, setSaved] = useState<unknown>(null);
  const [editorText, setEditorText] = useState("");
  const [saving, setSaving] = useState(false);
  const [newId, setNewId] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  const selectItem = useCallback(
    async (id: string) => {
      setSelectedId(id);
      const value = await api.get(section, id);
      setData(value);
      setSaved(value);
      setEditorText(JSON.stringify(value, null, 2));
    },
    [section]
  );

  const refreshList = useCallback(
    async (selectId?: string) => {
      setLoading(true);
      try {
        const list = await api.list(section);
        setItems(list);
        const next =
          selectId ?? (selectedId && list.some((item) => item.id === selectedId) ? selectedId : list[0]?.id ?? null);
        if (next) await selectItem(next);
        else {
          setSelectedId(null);
          setData(null);
          setSaved(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [section, selectedId, selectItem]
  );

  useEffect(() => {
    void refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when section changes
  }, [section]);

  const savedText = saved ? JSON.stringify(saved, null, 2) : "";
  const dirty = editorText !== savedText;

  async function save() {
    if (!selectedId) return;
    setSaving(true);
    setMessage(null);
    try {
      const parsed = JSON.parse(editorRef.current?.getText() ?? editorText);
      await api.save(section, parsed, selectedId);
      setData(parsed);
      setSaved(parsed);
      setMessage({ text: "Saved.", ok: true });
    } catch (error) {
      setMessage({ text: String(error), ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function createItem() {
    const id = newId.trim();
    if (!id) return;
    const localized = { en: "New entry", no: "Ny oppføring" };
    const templates: Record<string, Record<string, unknown>> = {
      career: {
        id,
        order: 0,
        period: "2026–present",
        role: localized,
        company: "Company",
        location: localized,
        description: localized,
        highlights: []
      },
      education: {
        id,
        order: 0,
        period: "2020–2024",
        institution: "Institution",
        title: localized,
        description: localized
      },
      projects: {
        id,
        order: 0,
        title: localized,
        summary: localized,
        description: localized,
        status: "draft",
        featured: false,
        tags: []
      }
    };
    const template = templates[section] ?? { id, order: 0 };
    try {
      await api.create(section, id, template);
      setNewId("");
      setMessage({ text: `Created ${id}.`, ok: true });
      await refreshList(id);
    } catch (error) {
      setMessage({ text: String(error), ok: false });
    }
  }

  async function deleteItem() {
    if (!selectedId || !confirm(`Delete ${selectedId}?`)) return;
    try {
      await api.remove(section, selectedId);
      setMessage({ text: `Deleted ${selectedId}.`, ok: true });
      await refreshList();
    } catch (error) {
      setMessage({ text: String(error), ok: false });
    }
  }

  return (
    <div>
      <h2>{title}</h2>
      {loading && <p>Loading…</p>}
      <div className="list-panel">
        <div>
          <div className="item-list">
            {items.map((item) => (
              <button
                key={item.id}
                className={item.id === selectedId ? "active" : ""}
                onClick={() => void selectItem(item.id)}
              >
                <div>{item.label || item.id}</div>
                <div className="item-meta">{item.id}</div>
              </button>
            ))}
          </div>
          <div className="toolbar toolbar-spaced">
            <input placeholder="new-id" value={newId} onChange={(event) => setNewId(event.target.value)} />
            <button className="btn" onClick={() => void createItem()}>
              Add
            </button>
          </div>
        </div>
        <div>
          {selectedId && data ? (
            <>
              <SaveBar
                dirty={dirty}
                saving={saving}
                onSave={() => void save()}
                extra={
                  <button className="btn btn-danger" onClick={() => void deleteItem()}>
                    Delete
                  </button>
                }
              />
              {message && <div className={`status ${message.ok ? "ok" : "error"}`}>{message.text}</div>}
              <div className="panel">
                <JsonEditor ref={editorRef} key={selectedId} value={data} onChange={setData} onTextChange={setEditorText} />
              </div>
            </>
          ) : (
            !loading && <p>Select or create an item.</p>
          )}
        </div>
      </div>
    </div>
  );
}
