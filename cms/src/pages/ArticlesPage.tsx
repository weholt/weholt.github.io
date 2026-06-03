import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, type ContentListItem } from "../api";

export function ArticlesPage() {
  const [items, setItems] = useState<ContentListItem[]>([]);
  const [newId, setNewId] = useState("");

  async function refresh() {
    setItems(await api.list("articles"));
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createArticle() {
    const id = newId.trim();
    if (!id) return;
    const today = new Date().toISOString().slice(0, 10);
    await api.create("articles", id, {
      meta: {
        id,
        title: { en: "New article", no: "Ny artikkel" },
        summary: { en: "Summary", no: "Sammendrag" },
        date: today,
        status: "draft",
        tags: [],
        featured: false,
        pinned: false,
        order: 0
      },
      bodyEn: "# New article\n",
      bodyNo: "# Ny artikkel\n"
    });
    setNewId("");
    await refresh();
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Articles</h2>
      </header>
      <div className="toolbar">
        <input placeholder="new-article-id" value={newId} onChange={(event) => setNewId(event.target.value)} />
        <button className="btn" onClick={() => void createArticle()}>
          Create article
        </button>
      </div>
      <div className="panel">
        {items.map((item) => (
          <div key={item.id} className="article-row">
            <div>
              <Link to={`/articles/${item.id}`}>{item.label || item.id}</Link>
              <div className="item-meta">
                {item.date} · {item.status}
              </div>
            </div>
            <Link to={`/articles/${item.id}`}>Edit</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
