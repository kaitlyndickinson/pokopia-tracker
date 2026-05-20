import { useState, useMemo, useRef, memo } from "react";
import { habitats } from "../data/habitats";

const REGION_ABBR = {
  "Withered Wastelands": "WW",
  "Bleak Beach": "BB",
  "Rocky Ridges": "RR",
  "Sparkling Skylands": "SS",
  "Palette Town": "PT",
  "Dream Island": "DI",
};

const pokemonRegions = new Map();
for (const h of habitats) {
  for (const p of h.pokemon) {
    if (!pokemonRegions.has(p)) pokemonRegions.set(p, new Set());
    pokemonRegions.get(p).add(h.region);
  }
}

function PokemonRow({ name, caught, regions, onToggle, onSelect }) {
  return (
    <div className={`dex-row ${caught ? "dex-caught" : ""}`}>
      <button
        className="dex-catch-btn"
        onClick={() => onToggle(name)}
        aria-label={caught ? `Unmark ${name} as caught` : `Mark ${name} as caught`}
      >
        {caught ? "✓" : "○"}
      </button>
      <button className="dex-name-btn" onClick={() => onSelect(name)}>
        {name}
      </button>
      {regions && regions.size > 0 && (
        <div className="dex-region-tags">
          {[...regions].map(r => (
            <span key={r} className="dex-region-tag">{REGION_ABBR[r] ?? r}</span>
          ))}
        </div>
      )}
      <button className="dex-info-btn" onClick={() => onSelect(name)} aria-label={`View ${name} habitats`}>
        ›
      </button>
    </div>
  );
}

const PokemonRowMemo = memo(PokemonRow);

export default function PokedexView({
  allPokemon, caught, onToggle, onSelect,
  regions, regionFilter, onRegionChange, pokemonByRegion,
  onExport, onImport,
}) {
  const [search, setSearch] = useState("");
  const [caughtAtBottom, setCaughtAtBottom] = useState(true);
  const importRef = useRef(null);

  const regionFiltered = useMemo(() => {
    if (regionFilter === "all") return allPokemon;
    const regionSet = pokemonByRegion.get(regionFilter) || new Set();
    return allPokemon.filter(p => regionSet.has(p));
  }, [allPokemon, regionFilter, pokemonByRegion]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? regionFiltered.filter(p => p.toLowerCase().includes(q)) : regionFiltered;
  }, [regionFiltered, search]);

  const uncaught = useMemo(() => filtered.filter(p => !caught.has(p)), [filtered, caught]);
  const caughtList = useMemo(() => filtered.filter(p => caught.has(p)), [filtered, caught]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) onImport(file);
    e.target.value = "";
  }

  return (
    <div className="pokedex-view">
      <div className="controls">
        <input
          className="search-input"
          placeholder="Search Pokémon..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="dex-toolbar">
          <select
            className="region-select inline"
            value={regionFilter}
            onChange={e => onRegionChange(e.target.value)}
          >
            <option value="all">All Areas</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <label className="dex-sort-toggle">
            <input
              type="checkbox"
              checked={caughtAtBottom}
              onChange={e => setCaughtAtBottom(e.target.checked)}
            />
            Caught at bottom
          </label>
          <div className="csv-btns">
            <button className="csv-btn" onClick={onExport}>Export CSV</button>
            <button className="csv-btn" onClick={() => importRef.current.click()}>Import CSV</button>
            <input
              ref={importRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      <div className="pokedex-sections">
        {caughtAtBottom ? (
          <>
            {uncaught.length > 0 && (
              <section>
                <h2 className="section-heading needed-heading">
                  Still Needed <span className="count">{uncaught.length}</span>
                </h2>
                <div className="dex-list">
                  {uncaught.map(p => (
                    <PokemonRowMemo key={p} name={p} caught={false} regions={pokemonRegions.get(p)} onToggle={onToggle} onSelect={onSelect} />
                  ))}
                </div>
              </section>
            )}

            {caughtList.length > 0 && (
              <section>
                <h2 className="section-heading built-heading">
                  Caught <span className="count">{caughtList.length}</span>
                </h2>
                <div className="dex-list">
                  {caughtList.map(p => (
                    <PokemonRowMemo key={p} name={p} caught={true} regions={pokemonRegions.get(p)} onToggle={onToggle} onSelect={onSelect} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          filtered.length > 0 && (
            <section>
              <div className="dex-list">
                {filtered.map(p => (
                  <PokemonRowMemo key={p} name={p} caught={caught.has(p)} regions={pokemonRegions.get(p)} onToggle={onToggle} onSelect={onSelect} />
                ))}
              </div>
            </section>
          )
        )}

        {filtered.length === 0 && (
          <div className="empty-state">No Pokémon match your filters.</div>
        )}
      </div>
    </div>
  );
}
