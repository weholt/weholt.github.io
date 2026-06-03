import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { FileDropZone } from "../components/FileDropZone";
import { JsonEditor } from "../components/JsonEditor";
import { SaveBar } from "../components/SaveBar";
import { mediaUrl } from "../lib/mediaUrl";

type Gallery = Record<string, unknown> & {
  id?: string;
  title?: { en?: string };
  coverImage?: string;
  images?: string[];
};

type Photo = Record<string, unknown> & {
  id?: string;
  src?: string;
  title?: { en?: string };
};

export function GalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [savedGalleries, setSavedGalleries] = useState<Gallery[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    setLoading(true);
    setMessage(null);
    api
      .get<Gallery[]>("photography/galleries")
      .then((galleryList) => {
        setGalleries(galleryList);
        setSavedGalleries(galleryList);
        setSelectedId(galleryList[0]?.id ?? null);
      })
      .catch((error) => {
        setMessage({ text: String(error), ok: false });
      })
      .finally(() => setLoading(false));
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(galleries) !== JSON.stringify(savedGalleries),
    [galleries, savedGalleries]
  );

  const current = galleries.find((item) => item.id === selectedId) ?? null;

  function updateCurrent(next: Gallery) {
    if (!selectedId) return;
    setGalleries((prev) => prev.map((item) => (item.id === selectedId ? next : item)));
  }

  async function saveAll() {
    setSaving(true);
    setMessage(null);
    try {
      await api.save("photography/galleries", galleries);
      setSavedGalleries(galleries);
      setMessage({ text: "Galleries saved.", ok: true });
    } catch (error) {
      setMessage({ text: String(error), ok: false });
    } finally {
      setSaving(false);
    }
  }

  function addGallery() {
    const id = `gallery-${Date.now()}`;
    const next: Gallery = {
      id,
      order: galleries.length + 1,
      title: { en: "New gallery", no: "Nytt galleri" },
      description: { en: "", no: "" },
      categories: [],
      images: []
    };
    setGalleries((prev) => [...prev, next]);
    setSelectedId(id);
  }

  function removeCurrent() {
    if (!current?.id || !confirm(`Remove gallery ${current.id}?`)) return;
    const removedId = current.id;
    setGalleries((prev) => {
      const updated = prev.filter((item) => item.id !== removedId);
      if (selectedId === removedId) setSelectedId(updated[0]?.id ?? null);
      return updated;
    });
  }

  async function uploadImages(files: File[]) {
    if (!current?.id) {
      setMessage({ text: "Select a gallery first.", ok: false });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const result = await api.uploadGallery(files, current.id);
      const photos = await api.get<Photo[]>("photography/photos");
      const existingIds = new Set(photos.map((photo) => photo.id));
      const newPhotos: Photo[] = result.uploaded.map((file) => ({
        id: file.photoId,
        src: file.url,
        alt: { en: file.name, no: file.name },
        title: { en: file.name, no: file.name },
        categories: current.categories ?? [],
        tags: []
      }));
      const mergedPhotos = [
        ...photos,
        ...newPhotos.filter((photo) => photo.id && !existingIds.has(photo.id))
      ];
      const newIds = newPhotos.map((photo) => photo.id).filter(Boolean) as string[];
      const imageIds = [...(current.images ?? []), ...newIds.filter((id) => !(current.images ?? []).includes(id))];
      const updatedGallery: Gallery = { ...current, images: imageIds };

      await api.save("photography/photos", mergedPhotos);

      setGalleries((prev) => prev.map((item) => (item.id === current.id ? updatedGallery : item)));
      setSelectedId(current.id);
      setMessage({
        text: `Uploaded ${result.uploaded.length} image(s) to photos.json and linked them to "${current.id}". Save galleries to persist metadata.`,
        ok: true
      });
    } catch (error) {
      setMessage({ text: String(error), ok: false });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Galleries</h2>
        <p className="page-lead">
          Edit gallery metadata here. Image uploads are saved to <code>photos.json</code> and linked via{" "}
          <code>images</code> on the selected gallery.
        </p>
      </header>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={() => void saveAll()}
        extra={
          <>
            <button className="btn" onClick={addGallery} disabled={loading}>
              Add gallery
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
        <p className="loading-hint">Loading galleries…</p>
      ) : (
        <div className="list-panel">
          <div>
            <div className="item-list item-list-scroll">
              {galleries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === selectedId ? "active" : ""}
                  onClick={() => setSelectedId(item.id ?? null)}
                >
                  <div>{item.title?.en || item.id}</div>
                  <div className="item-meta">
                    {item.id} · {(item.images ?? []).length} photo(s)
                  </div>
                </button>
              ))}
            </div>
            <div className="list-footer">
              {galleries.length} gallery(ies)
            </div>
          </div>
          <div>
            {current ? (
              <div className="gallery-detail">
                {current.coverImage && (
                  <img
                    className="gallery-cover"
                    src={mediaUrl(String(current.coverImage))}
                    alt=""
                  />
                )}
                <div className="panel upload-panel">
                  <h3>Upload images to “{current.id}”</h3>
                  <FileDropZone
                    label={`Drop images for ${current.id} (saved under public/images/medium/${current.id}/)`}
                    onFiles={uploadImages}
                  />
                  {uploading && <p className="upload-status">Uploading…</p>}
                </div>
                <div className="panel">
                  <JsonEditor key={current.id} value={current} onChange={(value) => updateCurrent(value as Gallery)} />
                </div>
              </div>
            ) : (
              <p>No galleries yet. Add one to get started.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
