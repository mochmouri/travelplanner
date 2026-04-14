import { useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, ExternalLink, AlertTriangle, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import PlaceCard from './PlaceCard.jsx';
import MapView from './MapView.jsx';
import { haversineKm, walkMins, buildGoogleMapsUrl } from '../utils/route.js';

function fmt(mins) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}

function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function estimateTimes(places, startTime) {
  let current = startTime;
  return places.map((p, i) => {
    const t = current;
    const next = places[i + 1];
    const walkToNext = next ? Math.max(5, walkMins(haversineKm(p, next))) : 0;
    current = addMinutes(current, (p.durationMinutes || 60) + (next ? walkToNext : 0));
    return { ...p, _time: t, _walkToNext: walkToNext };
  });
}

function WalkIndicator({ mins, km }) {
  return (
    <div className="flex items-center gap-2 py-1 pl-7">
      <div className="w-px h-4 bg-line ml-0.5" />
      <span className="text-xs text-faint">~{mins} min walk · {km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`}</span>
    </div>
  );
}

export default function RouteBuilder({ trip, onMovePlaceToDay, onReorderPlace, onAddFoodToRoute, onContinue, onBack }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showFood, setShowFood] = useState(true);
  const numDays = trip.numDays;
  const places = trip.places || [];

  function getDayPlaces(day) {
    return [...places.filter(p => p.day === day && p.order !== undefined)]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  function getDayFood(day) {
    return places.filter(p => p.day === day && p.category === 'food' && p.order === undefined);
  }

  function getDayMosques(day) {
    return places.filter(p => p.day === day && p.category === 'mosque');
  }

  function getUnscheduled() {
    return places.filter(p => p.day === 0);
  }

  function nearestStop(food, dayPlaces) {
    if (dayPlaces.length === 0) return null;
    let best = dayPlaces[0], bestDist = Infinity;
    for (const p of dayPlaces) {
      const d = haversineKm(food, p);
      if (d < bestDist) { bestDist = d; best = p; }
    }
    return best.name;
  }

  const currentDayPlaces = estimateTimes(getDayPlaces(selectedDay), trip.startTime || '09:00');
  const currentDayFood = getDayFood(selectedDay);
  const currentDayMosques = getDayMosques(selectedDay);
  const unscheduled = getUnscheduled();
  const totalMins = currentDayPlaces.reduce((s, p) => s + (p.durationMinutes || 0), 0);
  const walkTotal = currentDayPlaces.reduce((s, p) => s + (p._walkToNext || 0), 0);
  const mapsUrl = buildGoogleMapsUrl(currentDayPlaces, trip.destination);

  return (
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <div className="px-5 pt-10 pb-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-md border border-border text-muted
              hover:border-hi hover:text-text transition-all duration-150"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-faint uppercase tracking-widest font-medium">Route builder</p>
            <h2 className="text-xl font-bold text-text tracking-tight truncate">
              {trip.name || trip.destination}
            </h2>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: numDays }, (_, i) => i + 1).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-xs font-medium transition-all duration-150 border ${
                selectedDay === d
                  ? 'bg-cta text-cta-fg border-cta'
                  : 'border-border text-muted hover:border-hi hover:text-text'
              }`}
            >
              Day {d}
              <span className="ml-1.5 opacity-50">({getDayPlaces(d).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── md+: two-column layout (map sidebar + route list) ── */}
      <div className="flex-1 px-5 max-w-5xl mx-auto w-full md:grid md:grid-cols-[340px_1fr] md:gap-8 md:items-start">

        {/* Left column: map + stats + unscheduled (sticky on md+) */}
        <div className="md:sticky md:top-6">
          {/* Map */}
          <div className="h-56 rounded-lg overflow-hidden border border-border mb-4 md:h-72">
            <MapView places={places} selectedDay={selectedDay} />
          </div>

          {/* Day stats bar */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-md bg-lift border border-line gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-muted flex-shrink-0">
              <Clock size={11} />
              <span>{currentDayPlaces.length} stops</span>
              <span>·</span>
              <span>{fmt(totalMins + walkTotal)}</span>
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors flex-shrink-0 ml-auto"
              >
                <ExternalLink size={11} />
                Open in Google Maps
              </a>
            )}
          </div>

          {/* Unscheduled warning */}
          {unscheduled.length > 0 && (
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={13} className="text-muted flex-shrink-0" />
                <p className="text-xs font-medium text-text">
                  {unscheduled.length} {unscheduled.length === 1 ? 'place' : 'places'} couldn't fit within the day's hours
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {unscheduled.map(place => (
                  <div key={place.id} className="border border-border rounded-md p-3">
                    <p className="text-sm font-medium text-text mb-2">{place.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-faint mr-1">Assign to:</span>
                      {Array.from({ length: numDays }, (_, i) => i + 1).map(d => (
                        <button
                          key={d}
                          onClick={() => onMovePlaceToDay(place.id, d)}
                          className="text-xs px-2 py-0.5 rounded border border-border text-muted
                            hover:border-hi hover:text-text transition-colors"
                        >
                          Day {d}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: route list + food + mosques */}
        <div>
          {/* Place list */}
          <div className="flex flex-col mt-6 md:mt-0">
            {currentDayPlaces.length === 0 ? (
              <p className="text-center text-muted text-sm py-12">No places on this day.</p>
            ) : (
              currentDayPlaces.map((place, idx) => {
                const km = place._walkToNext ? haversineKm(place, currentDayPlaces[idx + 1]) : 0;
                return (
                  <div key={place.id} className="animate-fade-up" style={{ animationDelay: `${idx * 25}ms` }}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs text-faint tabular-nums w-4 text-right">{idx + 1}</span>
                      <span className="text-xs text-faint font-mono">{place._time}</span>
                    </div>
                    <PlaceCard
                      place={place}
                      onMoveUp={idx > 0 ? () => onReorderPlace(place.id, 'up') : null}
                      onMoveDown={idx < currentDayPlaces.length - 1 ? () => onReorderPlace(place.id, 'down') : null}
                      onMoveToDay={numDays > 1 ? d => onMovePlaceToDay(place.id, d) : null}
                      numDays={numDays}
                    />
                    {idx < currentDayPlaces.length - 1 && place._walkToNext > 0 && (
                      <WalkIndicator mins={place._walkToNext} km={km} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Food recommendations */}
          {currentDayFood.length > 0 && (
            <div className="mt-8 mb-4">
              <button
                onClick={() => setShowFood(v => !v)}
                className="flex items-center gap-3 w-full mb-4"
              >
                <p className="text-xs font-medium text-muted uppercase tracking-widest">
                  Nearby restaurants ({currentDayFood.length})
                </p>
                <div className="flex-1 h-px bg-line" />
                {showFood ? <ChevronUp size={12} className="text-faint" /> : <ChevronDown size={12} className="text-faint" />}
              </button>
              {showFood && (
                <div className="flex flex-col gap-2">
                  {currentDayFood.map(food => {
                    const nearest = nearestStop(food, currentDayPlaces);
                    return (
                      <div key={food.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text leading-snug">{food.name}</p>
                            {nearest && (
                              <p className="text-xs text-faint mt-0.5">Near {nearest}</p>
                            )}
                          </div>
                          {food.lat && food.lng && (
                            <a
                              href={`https://maps.google.com/?q=${food.lat},${food.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-faint hover:text-text transition-colors flex-shrink-0 mt-0.5"
                              title="Open in Google Maps"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {food.cuisine && <span className="text-xs text-muted">{food.cuisine}</span>}
                          {food.durationMinutes && (
                            <span className="text-xs text-faint">{fmt(food.durationMinutes)}</span>
                          )}
                        </div>
                        {food.description && (
                          <p className="text-xs text-muted leading-relaxed mb-2">{food.description}</p>
                        )}
                        {food.notes && (
                          <p className="text-xs text-muted border-l border-border pl-2 mb-2">{food.notes}</p>
                        )}
                        <button
                          onClick={() => onAddFoodToRoute(food.id)}
                          className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
                        >
                          <Plus size={11} />
                          Add to route
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Prayer spaces */}
          {currentDayMosques.length > 0 && (
            <div className="mt-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs font-medium text-mosque-text uppercase tracking-widest">
                  Prayer spaces ({currentDayMosques.length})
                </p>
                <div className="flex-1 h-px bg-line" />
              </div>
              <div className="flex flex-col gap-2">
                {currentDayMosques.map(mosque => (
                  <div key={mosque.id} className="border border-mosque-border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-sm font-semibold text-text leading-snug">{mosque.name}</p>
                      {mosque.lat && mosque.lng && (
                        <a
                          href={`https://maps.google.com/?q=${mosque.lat},${mosque.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-faint hover:text-text transition-colors flex-shrink-0 mt-0.5"
                          title="Open in Google Maps"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    {mosque.description && (
                      <p className="text-xs text-muted leading-relaxed mb-1">{mosque.description}</p>
                    )}
                    {mosque.notes && (
                      <p className="text-xs text-muted border-l border-mosque-border pl-2">{mosque.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="sticky bottom-0 left-0 right-0 px-5 pb-8 pt-4 mt-8
        bg-gradient-to-t from-bg via-bg/90 to-transparent">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-between px-5 py-4 rounded-md
              bg-cta text-cta-fg font-medium text-sm
              hover:bg-cta/90 transition-all duration-150 active:scale-[0.99]"
          >
            View full itinerary
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
