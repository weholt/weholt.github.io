import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { api, type CommandResult } from "./api";
import { ArrayEditorPage } from "./pages/ArrayEditorPage";
import { ArticleEditorPage } from "./pages/ArticleEditorPage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { CollectionPage } from "./pages/CollectionPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GalleriesPage } from "./pages/GalleriesPage";
import { MediaPage } from "./pages/MediaPage";
import { SingletonPage } from "./pages/SingletonPage";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard" }]
  },
  {
    label: "Profile & site",
    items: [
      { to: "/profile/main", label: "Profile" },
      { to: "/profile/hero", label: "Home hero" },
      { to: "/profile/professional", label: "Professional" },
      { to: "/settings/site", label: "Site settings" }
    ]
  },
  {
    label: "Résumé",
    items: [
      { to: "/career", label: "Career" },
      { to: "/education", label: "Education" },
      { to: "/projects", label: "Projects" }
    ]
  },
  {
    label: "Writing",
    items: [{ to: "/articles", label: "Articles" }]
  },
  {
    label: "Photography",
    items: [
      { to: "/photography/categories", label: "Categories" },
      { to: "/photography/photos", label: "Photos" },
      { to: "/photography/galleries", label: "Galleries" },
      { to: "/media-library", label: "Media library" }
    ]
  }
] as const;

export default function App() {
  const [validation, setValidation] = useState<CommandResult | null>(null);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (import.meta.env.VITE_SKIP_VALIDATION === "1") return;
    api.validate().then(setValidation).catch(() => undefined);
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <header className="sidebar-brand">
          <p className="sidebar-kicker">Local editor</p>
          <h1>Weholt.org</h1>
          <p className="sidebar-tagline">Content &amp; media for the homepage</p>
        </header>
        <nav className="sidebar-nav" aria-label="CMS sections">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="nav-group">
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        {validation && (
          <div className={`status status-compact ${validation.ok ? "ok" : "error"}`}>
            {validation.ok ? "Content valid" : "Validation issues — run Validate on dashboard"}
          </div>
        )}
      </aside>
      <main className="main" ref={mainRef}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile/:id" element={<SingletonPage section="profile" />} />
          <Route path="/settings/:id" element={<SingletonPage section="settings" />} />
          <Route path="/career" element={<CollectionPage section="career" title="Career" />} />
          <Route path="/education" element={<CollectionPage section="education" title="Education" />} />
          <Route path="/projects" element={<CollectionPage section="projects" title="Projects" />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleEditorPage />} />
          <Route
            path="/photography/categories"
            element={<ArrayEditorPage key="photography/categories" section="photography/categories" title="Photo categories" itemLabel="Category" />}
          />
          <Route
            path="/photography/photos"
            element={<ArrayEditorPage key="photography/photos" section="photography/photos" title="Photos" itemLabel="Photo" searchable />}
          />
          <Route path="/photography/galleries" element={<GalleriesPage />} />
          <Route path="/media-library" element={<MediaPage />} />
        </Routes>
      </main>
    </div>
  );
}
