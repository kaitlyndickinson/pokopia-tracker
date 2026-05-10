import { habitats } from "../data/habitats";

export default function PokemonDetail({ pokemonName, onClose }) {
  if (!pokemonName) return null;

  const relevantHabitats = habitats.filter(h => h.pokemon.includes(pokemonName));

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>{pokemonName}</h2>
        <p className="pkmn-habitat-count">
          Appears in <strong>{relevantHabitats.length}</strong> habitat{relevantHabitats.length !== 1 ? "s" : ""}
        </p>

        {relevantHabitats.map(h => (
          <section key={h.id} className="pkmn-habitat-entry">
            <div className="pkmn-habitat-header">
              <div>
                <span className="habitat-id large">#{h.id}</span>
                <h4 className="pkmn-habitat-name">{h.name}</h4>
                {h.region && <p className="habitat-region">{h.region}</p>}
              </div>
              <span className={`category-badge cat-${h.category.toLowerCase().replace(/[^a-z]/g, "-")}`}>
                {h.category}
              </span>
            </div>
            {h.materials.length > 0 && (
              <ul className="materials-list">
                {h.materials.map((m, i) => (
                  <li key={i}>
                    <span className="mat-name">{m.name}</span>
                    <span className="mat-qty">×{m.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
