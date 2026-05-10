import { useState, useEffect, useMemo, useCallback } from "react";
import { habitats, categories } from "./data/habitats";
import HabitatCard from "./components/HabitatCard";
import HabitatDetail from "./components/HabitatDetail";
import "./App.css";

const POKEMON_KEY = "pokopia-pokemon";

const REGIONS = [
  "Withered Wastelands",
  "Bleak Beach",
  "Rocky Ridges",
  "Sparkling Skylands",
  "Palette Town",
  "Dream Island",
];

function getStatus(habitat, checked) {
  if (habitat.pokemon.length === 0) return "Not Started";
  const c = checked[habitat.id];
  if (!c || c.length === 0) return "Not Started";
  if (c.length >= habitat.pokemon.length) return "Completed";
  return "In Progress";
}

export default function App() {
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(POKEMON_KEY)) || {};
    } catch {
      return {};
    }
  });
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(POKEMON_KEY, JSON.stringify(checked));
  }, [checked]);

  const togglePokemon = useCallback((habitatId, pokemonName) => {
    setChecked(prev => {
      const current = prev[habitatId] || [];
      const next = current.includes(pokemonName)
        ? current.filter(p => p !== pokemonName)
        : [...current, pokemonName];
      return { ...prev, [habitatId]: next };
    });
  }, []);

  const bulkSetPokemon = useCallback((habitatId, list) => {
    setChecked(prev => ({ ...prev, [habitatId]: list }));
  }, []);

  const handleSelect = useCallback((h) => setSelected(h), []);
  const handleClose = useCallback(() => setSelected(null), []);

  const completedCount = useMemo(
    () => habitats.filter(h => getStatus(h, checked) === "Completed").length,
    [checked]
  );

  const filtered = useMemo(() => habitats.filter(h => {
    const status = getStatus(h, checked);
    if (filter === "built" && status !== "Completed") return false;
    if (filter === "needed" && status === "Completed") return false;
    if (categoryFilter !== "all" && h.category !== categoryFilter) return false;
    if (regionFilter !== "all" && h.region !== regionFilter) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [checked, filter, categoryFilter, regionFilter, search]);

  const needed = useMemo(
    () => filtered.filter(h => {
      const s = getStatus(h, checked);
      return s === "Not Started" || s === "In Progress";
    }),
    [filtered, checked]
  );

  const done = useMemo(
    () => filtered.filter(h => getStatus(h, checked) === "Completed"),
    [filtered, checked]
  );

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
          <span className="progress-label">{completedCount} / {habitats.length} completed</span>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${(completedCount / habitats.length) * 100}%` }}
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
              {f === "all" ? "All" : f === "needed" ? "Still Needed" : "Completed"}
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
                  status={getStatus(h, checked)}
                  checkedCount={(checked[h.id] || []).length}
                  onClick={handleSelect}
                />
              ))}
            </div>
          </section>
        )}

        {(filter === "all" || filter === "built") && done.length > 0 && (
          <section>
            <h2 className="section-heading built-heading">
              Completed <span className="count">{done.length}</span>
            </h2>
            <div className="habitat-grid">
              {done.map(h => (
                <HabitatCard
                  key={h.id}
                  habitat={h}
                  status="Completed"
                  checkedCount={(checked[h.id] || []).length}
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
        status={selected ? getStatus(selected, checked) : "Not Started"}
        checkedPokemon={selected ? (checked[selected.id] || []) : []}
        onTogglePokemon={togglePokemon}
        onBulkSet={bulkSetPokemon}
        onClose={handleClose}
      />
    </div>
  );
}
