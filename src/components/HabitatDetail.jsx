export default function HabitatDetail({ habitat, status, checkedPokemon, onTogglePokemon, onBulkSet, onClose }) {
  if (!habitat) return null;

  const statusClass = status.toLowerCase().replace(" ", "-");
  const allChecked = habitat.pokemon.length > 0 && checkedPokemon.length >= habitat.pokemon.length;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <span className="habitat-id large">#{habitat.id}</span>
        <h2>{habitat.name}</h2>
        <div className="detail-meta">
          <span className={`category-badge cat-${habitat.category.toLowerCase().replace(/[^a-z]/g, "-")}`}>
            {habitat.category}
          </span>
          <span className={`status-badge status-${statusClass}`}>{status}</span>
        </div>

        {habitat.materials.length > 0 && (
          <section>
            <h4>Materials Required</h4>
            <ul className="materials-list">
              {habitat.materials.map((m, i) => (
                <li key={i}>
                  <span className="mat-name">{m.name}</span>
                  <span className="mat-qty">×{m.quantity}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {habitat.pokemon.length > 0 ? (
          <section>
            <div className="pokemon-section-header">
              <h4>Pokemon ({checkedPokemon.length}/{habitat.pokemon.length} caught)</h4>
              <button
                className="mark-all-btn"
                onClick={() => onBulkSet(habitat.id, allChecked ? [] : [...habitat.pokemon])}
              >
                {allChecked ? "Clear all" : "Check all"}
              </button>
            </div>
            <div className="pokemon-grid">
              {habitat.pokemon.map((p, i) => {
                const isChecked = checkedPokemon.includes(p);
                return (
                  <button
                    key={i}
                    className={`pokemon-check ${isChecked ? "is-checked" : ""}`}
                    onClick={() => onTogglePokemon(habitat.id, p)}
                  >
                    <span className="check-icon">{isChecked ? "✓" : "○"}</span>
                    {p}
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <p className="no-pokemon-note">No pokemon data available for this habitat yet.</p>
        )}
      </div>
    </div>
  );
}
