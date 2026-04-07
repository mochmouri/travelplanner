import { useState } from 'react';
import PlaceCard from './PlaceCard.jsx';
import MapView from './MapView.jsx';
import { getDayColor } from '../utils/maps.js';

const DAY_COLORS = ['#14b8a6','#f59e0b','#8b5cf6','#ec4899','#22c55e','#3b82f6','#f97316'];
function dayColor(d) { return DAY_COLORS[(d - 1) % DAY_COLORS.length]; }

function formatDuration(mins) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}

function estimateTimes(places, startTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  let minutes = sh * 60 + sm;
  return places.map(p => {
    const start = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    minutes += (p.durationMinutes || 60);
    return { ...p, _startTime: start };
  });
}

export default function RouteBuilder({ trip, onMovePlaceToDay, onReorderPlace, onContinue, onBack }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showMap, setShowMap] = useState(true);

  const numDays = trip.numDays;
  const places = trip.places || [];

  function getDayPlaces(day) {
    return [...places.filter(p => p.day === day)]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  function getDayTotal(day) {
    return getDayPlaces(day).reduce((s, p) => s + (p.durationMinutes || 0), 0);
  }

  const currentDayPlaces = estimateTimes(getDayPlaces(selectedDay), trip.startTime || '09:00');

  return (
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200
              hover:bg-slate-700 transition-colors flex items-center justify-center text-sm"
          >
            ←
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-100">{trip.name || trip.destination}</h2>
            <p className="text-xs text-slate-500">{numDays} days · {places.length} places</p>
          </div>
          <button
            onClick={() => setShowMap(m => !m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showMap
                ? 'bg-teal-900/30 text-teal-300 border-teal-700/40'
                : 'bg-slate-800 text-slate-400 border-slate-700/40'
            }`}
          >
            {showMap ? '🗺 Map' : '🗺 Show map'}
          </button>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {Array.from({ length: numDays }, (_, i) => i + 1).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                selectedDay === d
                  ? 'text-white border-transparent'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/40 hover:text-slate-200'
              }`}
              style={selectedDay === d ? { background: dayColor(d), borderColor: 'transparent' } : {}}
            >
              Day {d}
              <span className="ml-1.5 opacity-70 text-xs">({getDayPlaces(d).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="px-4 mb-4 max-w-2xl mx-auto w-full">
          <div className="h-52 sm:h-64">
            <MapView places={places} selectedDay={selectedDay} />
          </div>
        </div>
      )}

      {/* Day stats */}
      <div className="px-4 mb-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/40">
          <span className="text-xs text-slate-400">
            {currentDayPlaces.length} stops · {formatDuration(getDayTotal(selectedDay))} total
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: dayColor(selectedDay) }} />
            <span className="text-xs font-medium text-slate-300">Day {selectedDay}</span>
          </div>
        </div>
      </div>

      {/* Place list */}
      <div className="px-4 pb-24 max-w-2xl mx-auto w-full flex flex-col gap-3">
        {currentDayPlaces.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-sm">
            No places assigned to this day yet.
          </div>
        ) : (
          currentDayPlaces.map((place, idx) => (
            <div key={place.id} className="animate-fade-up" style={{ animationDelay: `${idx * 30}ms` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-slate-600 font-medium w-6 text-right">{idx + 1}.</span>
                <span className="text-xs text-slate-600 font-mono">{place._startTime}</span>
              </div>
              <PlaceCard
                place={place}
                dayColor={dayColor(selectedDay)}
                onMoveUp={idx > 0 ? () => onReorderPlace(place.id, 'up') : null}
                onMoveDown={idx < currentDayPlaces.length - 1 ? () => onReorderPlace(place.id, 'down') : null}
                onMoveToDay={numDays > 1 ? (d) => onMovePlaceToDay(place.id, d) : null}
                numDays={numDays}
              />
            </div>
          ))
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0a0f1e] to-transparent">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-2xl font-semibold text-white text-base
              transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer
              shadow-xl shadow-teal-900/40"
            style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}
          >
            View full itinerary →
          </button>
        </div>
      </div>
    </div>
  );
}
