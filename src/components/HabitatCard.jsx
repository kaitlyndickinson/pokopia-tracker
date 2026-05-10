import { memo } from "react";

function HabitatCard({ habitat, isBuilt, onToggle, onClick }) {
  return (
    <div
      className={`habitat-card ${isBuilt ? "built" : ""}`}
      onClick={() => onClick(habitat)}
    >
      <div className="card-header">
        <span className="habitat-id">#{habitat.id}</span>
        <span className={`category-badge cat-${habitat.category.toLowerCase().replace(/[^a-z]/g, "-")}`}>
          {habitat.category}
        </span>
      </div>
      <div className="card-body">
        <h3 className="habitat-name">{habitat.name}</h3>
        {habitat.region && <p className="habitat-region">{habitat.region}</p>}
        <p className="pokemon-preview">
          {habitat.pokemon.slice(0, 3).join(", ")}
          {habitat.pokemon.length > 3 && ` +${habitat.pokemon.length - 3} more`}
        </p>
      </div>
      <button
        className={`toggle-btn ${isBuilt ? "unmark" : "mark"}`}
        onClick={e => { e.stopPropagation(); onToggle(habitat.id); }}
      >
        {isBuilt ? "✓ Built" : "+ Mark Built"}
      </button>
    </div>
  );
}

export default memo(HabitatCard);