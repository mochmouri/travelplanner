import { useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Coffee } from 'lucide-react';
import PlaceCard from './PlaceCard.jsx';
import MapView from './MapView.jsx';

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
  return places.map(p => {
    const t = current;
    current = addMinutes(current, (p.durationMinutes || 60) + 20);
    return { ...p, _time: t };
  });
}

export default function RouteBuilder({ trip, onMovePlaceToDay, onReorderPlace, onContinue, onBack }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const numDays = trip.numDays;
  const places = trip.places || [];

  function getDayPlaces(day) {
    return [...places.filter(p => p.day === day)].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const currentDayPlaces = estimateTimes(getDayPlaces(selectedDay), trip.startTime || '09:00');
  const totalMins = currentDayPlaces.reduce((s, p) => s + (p.durationMinutes || 0), 0);

  return (
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <div className="px-5 pt-10 pb-6 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-md border border-zinc-800 text-zinc-500
              hover:border-zinc-600 hover:text-white transition-all duration-150"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">Route builder</p>
            <h2 className="text-xl font-bold text-white tracking-tight truncate">
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
                  ? 'bg-white text-black border-white'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'
              }`}
            >
              Day {d}
              <span className="ml-1.5 opacity-50">({getDayPlaces(d).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="px-5 mb-6 max-w-xl mx-auto w-full">
        <div className="h-56 rounded-lg overflow-hidden border border-zinc-800">
          <MapView places={places} selectedDay={selectedDay} />
        </div>
      </div>

      {/* Day stats bar */}
      <div className="px-5 mb-4 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-md bg-zinc-950 border border-zinc-900">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Clock size={11} />
            <span>{currentDayPlaces.length} stops</span>
            <span>·</span>
            <span>{fmt(totalMins)} total</span>
          </div>
          <p className="text-xs text-zinc-600">
            {trip.startTime} – {addMinutes(trip.startTime || '09:00', totalMins + currentDayPlaces.length * 20)}
          </p>
        </div>
      </div>

      {/* Place list */}
      <div className="px-5 pb-28 max-w-xl mx-auto w-full flex flex-col gap-3">
        {currentDayPlaces.length === 0 ? (
          <p className="text-center text-zinc-700 text-sm py-12">No places on this day.</p>
        ) : (
          currentDayPlaces.map((place, idx) => (
            <div key={place.id} className="animate-fade-up" style={{ animationDelay: `${idx * 25}ms` }}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-700 tabular-nums w-4 text-right">{idx + 1}</span>
                <span className="text-xs text-zinc-700 font-mono">{place._time}</span>
                {place.category === 'food' && <Coffee size={10} className="text-zinc-600" />}
              </div>
              <PlaceCard
                place={place}
                onMoveUp={idx > 0 ? () => onReorderPlace(place.id, 'up') : null}
                onMoveDown={idx < currentDayPlaces.length - 1 ? () => onReorderPlace(place.id, 'down') : null}
                onMoveToDay={numDays > 1 ? d => onMovePlaceToDay(place.id, d) : null}
                numDays={numDays}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent">
        <div className="max-w-xl mx-auto">
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-between px-5 py-4 rounded-md
              bg-white text-black font-medium text-sm
              hover:bg-zinc-100 transition-all duration-150 active:scale-[0.99]"
          >
            View full itinerary
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
