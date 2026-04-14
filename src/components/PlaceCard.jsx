import { Star, Coffee, CircleDot, ChevronUp, ChevronDown, MoveRight, Map, Moon, Clock } from 'lucide-react';

const CATEGORY_META = {
  'must-see': { label: 'Must-see',      Icon: Star,      textClass: 'text-text',        borderClass: 'border-hi' },
  'optional':  { label: 'Optional',     Icon: CircleDot, textClass: 'text-muted',       borderClass: 'border-border' },
  'food':      { label: 'Food',         Icon: Coffee,    textClass: 'text-muted',        borderClass: 'border-hi' },
  'mosque':    { label: 'Prayer space', Icon: Moon,      textClass: 'text-mosque-text',  borderClass: 'border-mosque-border' },
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
      className={`rounded-lg border bg-surface transition-all duration-150 ${meta.borderClass}`}
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
                className="text-faint hover:text-text disabled:opacity-20 disabled:cursor-default transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!onMoveDown}
                className="text-faint hover:text-text disabled:opacity-20 disabled:cursor-default transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-text text-sm leading-snug tracking-tight">{place.name}</p>
              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                {place.lat && place.lng && (
                  <a
                    href={`https://maps.google.com/?q=${place.lat},${place.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-faint hover:text-text transition-colors"
                    aria-label="Open in Google Maps"
                    title="Open in Google Maps"
                  >
                    <Map size={12} />
                  </a>
                )}
                {onRemove && (
                  <button
                    onClick={onRemove}
                    className="text-faint hover:text-text transition-colors"
                    aria-label="Remove"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onCategoryChange ? (
                <select
                  value={place.category}
                  onChange={e => onCategoryChange(e.target.value)}
                  className={`text-xs px-2 py-0.5 rounded border bg-surface cursor-pointer
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
                <span className="text-xs text-faint">{fmt(place.durationMinutes)}</span>
              )}

              {place.cuisine && (
                <span className="text-xs text-muted">{place.cuisine}</span>
              )}
            </div>

            {!compact && place.description && (
              <p className="text-xs text-muted leading-relaxed mt-2">{place.description}</p>
            )}

            {!compact && place.notes && (
              <p className="text-xs text-muted mt-1.5 border-l border-border pl-2">{place.notes}</p>
            )}

            {!compact && place.openingHours && (
              <p className="flex items-center gap-1.5 text-xs text-faint mt-1.5">
                <Clock size={10} className="flex-shrink-0" />
                {place.openingHours}
                <span className="opacity-50">· AI estimate</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Move-to-day row */}
      {onMoveToDay && numDays > 1 && (
        <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
          <MoveRight size={11} className="text-faint" />
          <span className="text-xs text-faint">Move to:</span>
          {Array.from({ length: numDays }, (_, i) => i + 1)
            .filter(d => d !== place.day)
            .map(d => (
              <button
                key={d}
                onClick={() => onMoveToDay(d)}
                className="text-xs px-2 py-0.5 rounded border border-border text-muted
                  hover:border-hi hover:text-text transition-colors"
              >
                Day {d}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
