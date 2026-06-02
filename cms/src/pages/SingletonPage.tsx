import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { JsonEditor, type JsonEditorHandle } from "../components/JsonEditor";
import { SaveBar } from "../components/SaveBar";

type Props = {
  section: "profile" | "settings";
};

export function SingletonPage({ section }: Props) {
  const { id } = useParams();
  const sectionId = `${section}/${id}`;
  const editorRef = useRef<JsonEditorHandle>(null);
  const [data, setData] = useState<unknown>(null);
  const [saved, setSaved] = useState<unknown>(null);
  const [editorText, setEditorText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    api.get(sectionId).then((value) => {
      setData(value);
      setSaved(value);
      setEditorText(JSON.stringify(value, null, 2));
    });
  }, [sectionId]);

  const savedText = saved ? JSON.stringify(saved, null, 2) : "";
  const dirty = editorText !== savedText;

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const raw = editorRef.current?.getText() ?? editorText;
      const parsed = JSON.parse(raw);
      await api.save(sectionId, parsed);
      setData(parsed);
      setSaved(parsed);
      setEditorText(JSON.stringify(parsed, null, 2));
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
      <h2>{sectionId}</h2>
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} />
      {message && <div className={`status ${message.ok ? "ok" : "error"}`}>{message.text}</div>}
      <div className="panel">
        <JsonEditor ref={editorRef} key={sectionId} value={data} onChange={setData} onTextChange={setEditorText} />
      </div>
    </div>
  );
}
