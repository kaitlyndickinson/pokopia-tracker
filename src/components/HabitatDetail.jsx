export default function HabitatDetail({ habitat, isBuilt, onToggle, onClose }) {
  if (!habitat) return null;
  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <span className="habitat-id large">#{habitat.id}</span>
        <h2>{habitat.name}</h2>
        <span className={`category-badge cat-${habitat.category.toLowerCase().replace(/[^a-z]/g, "-")}`}>
          {habitat.category}
        </span>

        <section>
          <h4>🪵 Materials Required</h4>
          <ul className="materials-list">
            {habitat.materials.map((m, i) => (
              <li key={i}>
                <span className="mat-name">{m.name}</span>
                <span className="mat-qty">×{m.quantity}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4>🐾 Pokémon Attracted ({habitat.pokemon.length})</h4>
          <div className="pokemon-grid">
            {habitat.pokemon.map((p, i) => (
              <div key={i} className="pokemon-chip">{p}</div>
            ))}
          </div>
        </section>

        <button
          className={`toggle-btn full-width ${isBuilt ? "unmark" : "mark"}`}
          onClick={() => onToggle(habitat.id)}
        >
          {isBuilt ? "✕ Mark as Not Built" : "✓ Mark as Built"}
        </button>
      </div>
    </div>
  );
}