import { Star, Coffee, CircleDot, ChevronUp, ChevronDown, MoveRight } from 'lucide-react';

const CATEGORY_META = {
  'must-see': { label: 'Must-see',  Icon: Star,       textClass: 'text-white',   borderClass: 'border-white/20' },
  'optional':  { label: 'Optional',  Icon: CircleDot,  textClass: 'text-zinc-400', borderClass: 'border-zinc-700' },
  'food':      { label: 'Food',      Icon: Coffee,     textClass: 'text-zinc-300', borderClass: 'border-zinc-600' },
};

function fmt(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}

export default function PlaceCard({
  place,
  dayColor = null,
  onRemove,
  onCategoryChange,
  onMoveUp,
  onMoveDown,
  onMoveToDay,
  numDays,
  compact = false,
}) {
  const meta = CATEGORY_META[place.category] || CATEGORY_META['optional'];
  const { Icon } = meta;

  return (
    <div
      className={`rounded-lg border bg-zinc-950 transition-all duration-150 ${meta.borderClass}`}
      style={dayColor ? { borderLeftColor: dayColor, borderLeftWidth: 2 } : {}}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Reorder buttons */}
          {(onMoveUp !== undefined || onMoveDown !== undefined) && (
            <div className="flex flex-col gap-0.5 flex-shrink-0 pt-0.5">
              <button
                onClick={onMoveUp}
                disabled={!onMoveUp}
                className="text-zinc-700 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-default transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!onMoveDown}
                className="text-zinc-700 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-default transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-white text-sm leading-snug tracking-tight">{place.name}</p>
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="flex-shrink-0 text-zinc-700 hover:text-white transition-colors mt-0.5"
                  aria-label="Remove"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onCategoryChange ? (
                <select
                  value={place.category}
                  onChange={e => onCategoryChange(e.target.value)}
                  className={`text-xs px-2 py-0.5 rounded border bg-transparent cursor-pointer
                    focus:outline-none ${meta.textClass} ${meta.borderClass}`}
                >
                  <option value="must-see">Must-see</option>
                  <option value="optional">Optional</option>
                  <option value="food">Food</option>
                </select>
              ) : (
                <span className={`flex items-center gap-1 text-xs ${meta.textClass}`}>
                  <Icon size={10} />
                  {meta.label}
                </span>
              )}

              {place.durationMinutes && (
                <span className="text-xs text-zinc-600">{fmt(place.durationMinutes)}</span>
              )}

              {place.cuisine && (
                <span className="text-xs text-zinc-500">{place.cuisine}</span>
              )}
            </div>

            {!compact && place.description && (
              <p className="text-xs text-zinc-500 leading-relaxed mt-2">{place.description}</p>
            )}

            {!compact && place.notes && (
              <p className="text-xs text-zinc-400 mt-1.5 border-l border-zinc-700 pl-2">{place.notes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Move-to-day row */}
      {onMoveToDay && numDays > 1 && (
        <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
          <MoveRight size={11} className="text-zinc-700" />
          <span className="text-xs text-zinc-700">Move to:</span>
          {Array.from({ length: numDays }, (_, i) => i + 1)
            .filter(d => d !== place.day)
            .map(d => (
              <button
                key={d}
                onClick={() => onMoveToDay(d)}
                className="text-xs px-2 py-0.5 rounded border border-zinc-800 text-zinc-400
                  hover:border-zinc-600 hover:text-white transition-colors"
              >
                Day {d}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
