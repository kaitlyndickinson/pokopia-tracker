import { memo } from "react";

function HabitatCard({ habitat, status, checkedCount, onClick }) {
  const statusClass = status.toLowerCase().replace(" ", "-");
  return (
    <div
      className={`habitat-card status-${statusClass}`}
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
        {habitat.regions ? (
          <div className="habitat-region-tags">
            {habitat.regions.map(r => <span key={r} className="habitat-region-tag">{r}</span>)}
          </div>
        ) : habitat.region ? (
          <p className="habitat-region">{habitat.region}</p>
        ) : null}
        <p className="pokemon-preview">
          {habitat.pokemon.slice(0, 3).join(", ")}
          {habitat.pokemon.length > 3 && ` +${habitat.pokemon.length - 3} more`}
        </p>
      </div>
      <div className="card-footer">
        <span className={`status-badge status-${statusClass}`}>{status}</span>
        {habitat.pokemon.length > 0 && status !== "Completed" && (
          <span className="progress-fraction">{checkedCount}/{habitat.pokemon.length}</span>
        )}
      </div>
    </div>
  );
}

export default memo(HabitatCard);
