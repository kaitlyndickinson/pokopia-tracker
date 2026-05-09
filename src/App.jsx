import { useState, useEffect } from "react";
import { habitats, categories } from "./data/habitats";
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...built]));
  }, [built]);

  const toggle = (id) => {
    setBuilt(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = habitats.filter(h => {
    if (filter === "built" && !built.has(h.id)) return false;
    if (filter === "needed" && built.has(h.id)) return false;
    if (categoryFilter !== "all" && h.category !== categoryFilter) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const needed = filtered.filter(h => !built.has(h.id));
  const done = filtered.filter(h => built.has(h.id));

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <span className="pokeball">◉</span>
          <h1>Pokopia<span className="accent">Tracker</span></h1>
        </div>
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{ width: `${(built.size / habitats.length) * 100}%` }}
          />
          <span className="progress-label">{built.size} / {habitats.length} built</span>
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
            <h2 className="section-heading needed-heading">
              Still Needed <span className="count">{needed.length}</span>
            </h2>
            <div className="habitat-grid">
              {needed.map(h => (
                <HabitatCard
                  key={h.id}
                  habitat={h}
                  isBuilt={false}
                  onToggle={toggle}
                  onClick={setSelected}
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
                  onClick={setSelected}
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
        onClose={() => setSelected(null)}
      />
    </div>
  );
}