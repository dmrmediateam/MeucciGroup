"use client";

/* Removable summary of the applied search, shown above the results. */
export interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export default function ActiveFilterChips({ chips, onClear }: { chips: Chip[]; onClear: () => void }) {
  if (chips.length === 0) return null;
  return (
    <div className="lr-chips" role="list" aria-label="Active filters">
      {chips.map((chip) => (
        <button type="button" role="listitem" key={chip.key} className="lr-chip" onClick={chip.onRemove}>
          <span>{chip.label}</span>
          <span className="lr-chip__x" aria-hidden="true">×</span>
          <span className="visually-hidden">Remove</span>
        </button>
      ))}
      <button type="button" className="lr-chips__clear" onClick={onClear}>Clear all</button>
    </div>
  );
}
