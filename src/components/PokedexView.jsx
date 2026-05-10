import { useState, useMemo, memo } from "react";

function PokemonRow({ name, caught, onToggle, onSelect }) {
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
      <button className="dex-info-btn" onClick={() => onSelect(name)} aria-label={`View ${name} habitats`}>
        ›
      </button>
    </div>
  );
}

const PokemonRowMemo = memo(PokemonRow);

export default function PokedexView({ allPokemon, caught, onToggle, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? allPokemon.filter(p => p.toLowerCase().includes(q)) : allPokemon;
  }, [allPokemon, search]);

  const uncaught = useMemo(() => filtered.filter(p => !caught.has(p)), [filtered, caught]);
  const caughtList = useMemo(() => filtered.filter(p => caught.has(p)), [filtered, caught]);

  return (
    <div className="pokedex-view">
      <div className="controls">
        <input
          className="search-input"
          placeholder="Search Pokémon..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="pokedex-sections">
        {uncaught.length > 0 && (
          <section>
            <h2 className="section-heading needed-heading">
              Still Needed <span className="count">{uncaught.length}</span>
            </h2>
            <div className="dex-list">
              {uncaught.map(p => (
                <PokemonRowMemo key={p} name={p} caught={false} onToggle={onToggle} onSelect={onSelect} />
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
                <PokemonRowMemo key={p} name={p} caught={true} onToggle={onToggle} onSelect={onSelect} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="empty-state">No Pokémon match your search.</div>
        )}
      </div>
    </div>
  );
}
