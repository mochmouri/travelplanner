const CATEGORY_STYLES = {
  'must-see': { bg: 'bg-blue-900/40', text: 'text-blue-300', border: 'border-blue-800/50', label: '★ Must-see' },
  'optional':  { bg: 'bg-slate-800/40', text: 'text-slate-400', border: 'border-slate-700/50', label: 'Optional' },
  'food':      { bg: 'bg-amber-900/30', text: 'text-amber-300', border: 'border-amber-800/50', label: '🍽 Food' },
};

function formatDuration(mins) {
  if (!mins) return null;
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function PlaceCard({
  place,
  showDay = false,
  dayColor = null,
  onRemove,
  onCategoryChange,
  onMoveUp,
  onMoveDown,
  onMoveToDay,
  numDays,
  compact = false,
}) {
  const cat = CATEGORY_STYLES[place.category] || CATEGORY_STYLES['optional'];

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-150 ${cat.bg} ${cat.border}`}
      style={dayColor ? { borderLeftColor: dayColor, borderLeftWidth: 3 } : {}}
    >
      <div className="flex items-start gap-3">
        {/* Order indicator or drag handle */}
        <div className="flex-shrink-0 pt-0.5">
          {(onMoveUp || onMoveDown) ? (
            <div className="flex flex-col gap-0.5">
              <button
                onClick={onMoveUp}
                disabled={!onMoveUp}
                className="w-5 h-5 rounded text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:cursor-default flex items-center justify-center text-xs transition-colors"
              >▲</button>
              <button
                onClick={onMoveDown}
                disabled={!onMoveDown}
                className="w-5 h-5 rounded text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:cursor-default flex items-center justify-center text-xs transition-colors"
              >▼</button>
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-slate-100 text-sm leading-snug">{place.name}</p>
            {onRemove && (
              <button
                onClick={onRemove}
                className="flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors text-base leading-none mt-0.5"
              >×</button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {onCategoryChange ? (
              <select
                value={place.category}
                onChange={e => onCategoryChange(e.target.value)}
                className={`text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer
                  bg-transparent ${cat.text} ${cat.border} focus:outline-none`}
              >
                <option value="must-see">★ Must-see</option>
                <option value="optional">Optional</option>
                <option value="food">🍽 Food</option>
              </select>
            ) : (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cat.text} ${cat.border} bg-transparent`}>
                {cat.label}
              </span>
            )}
            {place.durationMinutes && (
              <span className="text-xs text-slate-500">⏱ {formatDuration(place.durationMinutes)}</span>
            )}
            {place.cuisine && (
              <span className="text-xs text-amber-400/80">{place.cuisine}</span>
            )}
            {showDay && place.day && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: dayColor || '#475569' }}
              >
                Day {place.day}
              </span>
            )}
          </div>

          {!compact && place.description && (
            <p className="text-xs text-slate-400 leading-relaxed">{place.description}</p>
          )}

          {!compact && place.notes && (
            <p className="text-xs text-amber-400/70 mt-1">{place.notes}</p>
          )}
        </div>
      </div>

      {/* Move-to-day controls */}
      {onMoveToDay && numDays > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pl-8">
          <span className="text-xs text-slate-500 self-center">Move to:</span>
          {Array.from({ length: numDays }, (_, i) => i + 1)
            .filter(d => d !== place.day)
            .map(d => (
              <button
                key={d}
                onClick={() => onMoveToDay(d)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-300
                  hover:bg-slate-600/60 transition-colors"
              >
                Day {d}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
