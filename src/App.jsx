import { useState, useEffect, useMemo, useCallback } from "react";
import { habitats, categories } from "./data/habitats";

const REGIONS = [
  "Withered Wastelands",
  "Bleak Beach",
  "Rocky Ridges",
  "Sparkling Skylands",
  "Palette Town",
  "Dream Island",
];
import HabitatCard from "./components/HabitatCard";
import HabitatDetail from "./components/HabitatDetail";
import "./App.css";

const STORAGE_KEY = "pokopia-built";

export default function App() {
  const [built, setBuilt] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
    } catch {
      return new Set();
    }
  });
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "needed" | "built"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...built]));
  }, [built]);

  const toggle = useCallback((id) => {
    setBuilt(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((h) => setSelected(h), []);
  const handleClose = useCallback(() => setSelected(null), []);

  const filtered = useMemo(() => habitats.filter(h => {
    if (filter === "built" && !built.has(h.id)) return false;
    if (filter === "needed" && built.has(h.id)) return false;
    if (categoryFilter !== "all" && h.category !== categoryFilter) return false;
    if (regionFilter !== "all" && h.region !== regionFilter) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [built, filter, categoryFilter, regionFilter, search]);

  const needed = useMemo(() => filtered.filter(h => !built.has(h.id)), [filtered, built]);
  const done = useMemo(() => filtered.filter(h => built.has(h.id)), [filtered, built]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <span className="pokeball">✿</span>
          <div className="header-text">
            <h1>Pokopia<span className="accent">Tracker</span></h1>
            <p className="header-sub">your habitat companion</p>
          </div>
        </div>
        <div className="progress-section">
          <span className="progress-label">{built.size} / {habitats.length} built</span>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${(built.size / habitats.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="controls">
        <input
          className="search-input"
          placeholder="Search habitats..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-row">
          {["all", "needed", "built"].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "needed" ? "Still Needed" : "Built"}
            </button>
          ))}
        </div>
        <div className="filter-row category-row">
          <button
            className={`filter-btn small ${categoryFilter === "all" ? "active" : ""}`}
            onClick={() => setCategoryFilter("all")}
          >All Types</button>
          {categories.map(c => (
            <button
              key={c}
              className={`filter-btn small ${categoryFilter === c ? "active" : ""}`}
              onClick={() => setCategoryFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <main className="habitat-sections">
        {(filter === "all" || filter === "needed") && needed.length > 0 && (
          <section>
            <div className="section-header-row">
              <h2 className="section-heading needed-heading">
                Still Needed <span className="count">{needed.length}</span>
              </h2>
              <select
                className="region-select inline"
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
              >
                <option value="all">All Areas</option>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="habitat-grid">
              {needed.map(h => (
                <HabitatCard
                  key={h.id}
                  habitat={h}
                  isBuilt={false}
                  onToggle={toggle}
                  onClick={handleSelect}
                />
              ))}
            </div>
          </section>
        )}

        {(filter === "all" || filter === "built") && done.length > 0 && (
          <section>
            <h2 className="section-heading built-heading">
              Built <span className="count">{done.length}</span>
            </h2>
            <div className="habitat-grid">
              {done.map(h => (
                <HabitatCard
                  key={h.id}
                  habitat={h}
                  isBuilt={true}
                  onToggle={toggle}
                  onClick={handleSelect}
                />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="empty-state">No habitats match your filters.</div>
        )}
      </main>

      <HabitatDetail
        habitat={selected}
        isBuilt={selected ? built.has(selected.id) : false}
        onToggle={toggle}
        onClose={handleClose}
      />
    </div>
  );
}