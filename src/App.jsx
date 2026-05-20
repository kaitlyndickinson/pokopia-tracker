import { useState, useEffect, useCallback, useRef } from "react";
import { habitats, categories } from "./data/habitats";
import { allPokemon } from "./data/pokemon";
import HabitatCard from "./components/HabitatCard";
import HabitatDetail from "./components/HabitatDetail";
import PokedexView from "./components/PokedexView";
import PokemonDetail from "./components/PokemonDetail";
import "./App.css";

const POKEMON_KEY = "pokopia-pokemon";
const CAUGHT_KEY = "pokopia-caught";
const EXPORT_KEY = "pokopia-last-export";


const REGIONS = [
  "Withered Wastelands",
  "Bleak Beach",
  "Rocky Ridges",
  "Sparkling Skylands",
  "Palette Town",
  "Dream Island",
];

function relativeTime(ts) {
  if (!ts) return "Never exported";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function getStatus(habitat, checked) {
  if (habitat.pokemon.length === 0) return "Not Started";
  const c = checked[habitat.id];
  if (!c || c.length === 0) return "Not Started";
  if (c.length >= habitat.pokemon.length) return "Completed";
  return "In Progress";
}

const getRegions = h => h.regions || (h.region ? [h.region] : []);

const pokemonByRegion = new Map(
  REGIONS.map(r => [
    r,
    new Set(habitats.filter(h => getRegions(h).includes(r)).flatMap(h => h.pokemon)),
  ])
);

// Pre-built lookup for sanitizing checked state on load
const habitatPokemonSet = Object.fromEntries(
  habitats.map(h => [h.id, new Set(h.pokemon)])
);

export default function App() {
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem("pokopia-tab") || "habitats"
  );

  const [checked, setChecked] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(POKEMON_KEY)) || {};
      const sanitized = {};
      for (const [id, list] of Object.entries(raw)) {
        if (habitatPokemonSet[id] && Array.isArray(list)) {
          sanitized[id] = list.filter(p => habitatPokemonSet[id].has(p));
        }
      }
      return sanitized;
    } catch { return {}; }
  });

  const [caught, setCaught] = useState(() => {
    try {
      const stored = localStorage.getItem(CAUGHT_KEY);
      return stored !== null ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const [selected, setSelected] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [dexRegionFilter, setDexRegionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [lastExported, setLastExported] = useState(() => {
    const v = localStorage.getItem(EXPORT_KEY);
    return v ? parseInt(v, 10) : null;
  });

  const toastTimerRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem("pokopia-tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(POKEMON_KEY, JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(CAUGHT_KEY, JSON.stringify([...caught]));
  }, [caught]);

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const togglePokemon = useCallback((habitatId, pokemonName) => {
    const isChecking = !(checked[habitatId] || []).includes(pokemonName);
    setChecked(prev => {
      const current = prev[habitatId] || [];
      const next = current.includes(pokemonName)
        ? current.filter(p => p !== pokemonName)
        : [...current, pokemonName];
      return { ...prev, [habitatId]: next };
    });
    if (isChecking) {
      setCaught(prev => { const n = new Set(prev); n.add(pokemonName); return n; });
    }
  }, [checked]);

  const bulkSetPokemon = useCallback((habitatId, list) => {
    setChecked(prev => ({ ...prev, [habitatId]: list }));
    if (list.length > 0) {
      setCaught(prev => {
        const next = new Set(prev);
        for (const p of list) next.add(p);
        return next;
      });
    }
  }, []);

  const toggleCaught = useCallback((name) => {
    setCaught(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleExportCsv = useCallback(() => {
    const lines = ["name,caught", ...allPokemon.map(p => `${p},${caught.has(p)}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pokopia-caught.csv";
    a.click();
    URL.revokeObjectURL(url);
    const now = Date.now();
    localStorage.setItem(EXPORT_KEY, now.toString());
    setLastExported(now);
  }, [caught]);

  const handleImportCsv = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.trim().split("\n").slice(1);
      const imported = new Set();
      for (const line of lines) {
        const comma = line.indexOf(",");
        if (comma === -1) continue;
        const name = line.slice(0, comma).trim();
        const val = line.slice(comma + 1).trim().toLowerCase();
        if (name && val === "true") imported.add(name);
      }
      const newChecked = {};
      for (const h of habitats) {
        const checkedInHabitat = h.pokemon.filter(p => imported.has(p));
        if (checkedInHabitat.length > 0) newChecked[h.id] = checkedInHabitat;
      }
      setCaught(imported);
      setChecked(newChecked);
      showToast(`Imported ${imported.size} Pokémon caught`);
    };
    reader.readAsText(file);
  }, [showToast]);

  const handleExportHabitatCsv = useCallback(() => {
    const lines = ["habitatId,pokemon"];
    for (const [id, list] of Object.entries(checked)) {
      if (list && list.length > 0) lines.push(`${id},${list.join("|")}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pokopia-habitats.csv";
    a.click();
    URL.revokeObjectURL(url);
    const now = Date.now();
    localStorage.setItem(EXPORT_KEY, now.toString());
    setLastExported(now);
  }, [checked]);

  const handleImportHabitatCsv = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.trim().split("\n").slice(1);
      const newChecked = {};
      for (const line of lines) {
        const comma = line.indexOf(",");
        if (comma === -1) continue;
        const id = line.slice(0, comma).trim();
        const pokemonList = line.slice(comma + 1).trim().split("|").filter(Boolean);
        if (id && pokemonList.length > 0) newChecked[id] = pokemonList;
      }
      setChecked(newChecked);
      setCaught(prev => {
        const next = new Set(prev);
        for (const list of Object.values(newChecked)) {
          for (const p of list) next.add(p);
        }
        return next;
      });
      const habitatCount = Object.keys(newChecked).length;
      const allCaughtFromImport = new Set(Object.values(newChecked).flat());
      showToast(`Imported ${habitatCount} habitats, ${allCaughtFromImport.size} Pokémon marked caught`);
    };
    reader.readAsText(file);
  }, [showToast]);

  const handleSelect = useCallback((h) => setSelected(h), []);
  const handleClose = useCallback(() => setSelected(null), []);
  const handleClosePokemon = useCallback(() => setSelectedPokemon(null), []);

  const isHabitats = activeTab === "habitats";

  const completedCount = habitats.filter(h => getStatus(h, checked) === "Completed").length;
  const caughtCount = caught.size;
  const progressCount = isHabitats ? completedCount : caughtCount;
  const progressTotal = isHabitats ? habitats.length : allPokemon.length;
  const progressLabel = isHabitats
    ? `${completedCount} / ${habitats.length} completed`
    : `${caughtCount} / ${allPokemon.length} caught`;

  const filtered = habitats.filter(h => {
    const status = getStatus(h, checked);
    if (filter === "built" && status !== "Completed") return false;
    if (filter === "needed" && status === "Completed") return false;
    if (categoryFilter !== "all" && h.category !== categoryFilter) return false;
    if (regionFilter !== "all" && !getRegions(h).includes(regionFilter)) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const needed = filtered.filter(h => {
    const s = getStatus(h, checked);
    return s === "Not Started" || s === "In Progress";
  });

  const done = filtered.filter(h => getStatus(h, checked) === "Completed");

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <span className="pokeball">✿</span>
          <div className="header-text">
            <h1>Pokopia<span className="accent">Tracker</span></h1>
            <p className="header-sub">Personal habitat and Pokémon tracker for Pokopia.</p>
          </div>
        </div>
        <div className="progress-section">
          <span className="progress-label">{progressLabel}</span>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${(progressCount / progressTotal) * 100}%` }}
            />
          </div>
        </div>
        <div className="tab-nav">
          <button
            className={`tab-btn ${isHabitats ? "active" : ""}`}
            onClick={() => setActiveTab("habitats")}
          >
            Habitats
          </button>
          <button
            className={`tab-btn ${!isHabitats ? "active" : ""}`}
            onClick={() => setActiveTab("pokedex")}
          >
            Pokédex
          </button>
        </div>
      </header>


      {isHabitats ? (
        <>
          <div className="controls">
            <div className="search-row">
              <input
                className="search-input"
                placeholder="Search habitats..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="habitat-csv-btns">
                <button className="csv-btn" onClick={handleExportHabitatCsv}>Export Habitats</button>
                <label className="csv-btn">
                  Import Habitats
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: "none" }}
                    onChange={e => {
                      if (e.target.files[0]) handleImportHabitatCsv(e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
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
        </>
      ) : (
        <PokedexView
          allPokemon={allPokemon}
          caught={caught}
          onToggle={toggleCaught}
          onSelect={setSelectedPokemon}
          regions={REGIONS}
          regionFilter={dexRegionFilter}
          onRegionChange={setDexRegionFilter}
          pokemonByRegion={pokemonByRegion}
          onExport={handleExportCsv}
          onImport={handleImportCsv}
        />
      )}

      <HabitatDetail
        habitat={selected}
        status={selected ? getStatus(selected, checked) : "Not Started"}
        checkedPokemon={selected ? (checked[selected.id] || []) : []}
        onTogglePokemon={togglePokemon}
        onBulkSet={bulkSetPokemon}
        onClose={handleClose}
      />

      <PokemonDetail
        pokemonName={selectedPokemon}
        onClose={handleClosePokemon}
      />

      <footer className="app-footer">
        <button
          className="reset-btn"
          onClick={() => {
            handleExportCsv();
            if (window.confirm("Your data has been exported. Are you sure you want to reset all progress?")) {
              setChecked({});
              setCaught(new Set());
              setLastExported(null);
              localStorage.clear();
            }
          }}
        >
          Reset Data
        </button>
        <p className="footer-export-note">Last exported: {relativeTime(lastExported)}</p>
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
