import { useState } from 'react';
import { suggestAccommodation } from '../utils/ai.js';
import { getDayCentroids } from '../utils/cluster.js';
import { getApiKey } from '../utils/storage.js';
import { downloadTripPDF } from '../utils/pdf.js';
import PlaceCard from './PlaceCard.jsx';

const DAY_COLORS = ['#14b8a6','#f59e0b','#8b5cf6','#ec4899','#22c55e','#3b82f6','#f97316'];
function dayColor(d) { return DAY_COLORS[(d - 1) % DAY_COLORS.length]; }

function formatDuration(mins) {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}

function estimateTimes(places, startTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  let minutes = sh * 60 + sm;
  return places.map(p => {
    const start = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    minutes += (p.durationMinutes || 60) + 20; // 20 min travel buffer
    return { ...p, _startTime: start };
  });
}

export default function ItineraryView({ trip, onBack, onSetAccommodation }) {
  const [loadingAccom, setLoadingAccom] = useState(false);
  const [accomError, setAccomError] = useState('');
  const [exportingPDF, setExportingPDF] = useState(false);

  const numDays = trip.numDays;
  const places = trip.places || [];
  const accommodation = trip.accommodation;

  async function fetchAccommodation() {
    setAccomError('');
    setLoadingAccom(true);
    try {
      const centroids = getDayCentroids(places, numDays);
      const result = await suggestAccommodation(trip.destination, centroids);
      onSetAccommodation(result);
    } catch (err) {
      setAccomError(err.message === 'NO_KEY' ? 'No Claude API key.' : err.message);
    } finally {
      setLoadingAccom(false);
    }
  }

  async function handleExportPDF() {
    setExportingPDF(true);
    try {
      await downloadTripPDF(trip);
    } catch (err) {
      alert('PDF export failed: ' + err.message);
    } finally {
      setExportingPDF(false);
    }
  }

  function getDayPlaces(day) {
    return [...places.filter(p => p.day === day)]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return (
    <div className="flex flex-col pb-20 animate-fade-up">
      {/* Header */}
      <div className="px-4 pt-6 pb-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200
              hover:bg-slate-700 transition-colors flex items-center justify-center text-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{trip.name || trip.destination}</h2>
            <p className="text-xs text-slate-500">{trip.destination} · {numDays} days</p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 rounded-full bg-teal-900/40 text-teal-300 text-xs font-medium border border-teal-700/30 capitalize">
            {trip.focus} focus
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs border border-slate-700/30">
            {trip.startTime} – {trip.endTime}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs border border-slate-700/30">
            {places.length} places
          </span>
        </div>

        {/* Export PDF */}
        <button
          onClick={handleExportPDF}
          disabled={exportingPDF}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm
            transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60
            cursor-pointer shadow-lg shadow-teal-900/20"
          style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}
        >
          {exportingPDF ? '⏳ Generating PDF…' : '⬇ Export full itinerary (PDF)'}
        </button>
      </div>

      {/* Accommodation */}
      <div className="px-4 mb-8 max-w-2xl mx-auto w-full">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Where to stay
        </p>
        {accommodation?.neighbourhoods?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {accommodation.neighbourhoods.map((n, i) => (
              <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                <p className="font-semibold text-teal-300 text-sm mb-1">{n.name}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{n.why}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            {accomError && <p className="text-red-400 text-xs mb-3">{accomError}</p>}
            <button
              onClick={fetchAccommodation}
              disabled={loadingAccom || !getApiKey('claude')}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50 font-medium"
            >
              {loadingAccom ? '⏳ Finding best areas…' : '✨ Suggest accommodation areas'}
            </button>
            {!getApiKey('claude') && (
              <p className="text-xs text-slate-600 mt-1">Requires a Claude API key in Settings.</p>
            )}
          </div>
        )}
      </div>

      {/* Day sections */}
      {Array.from({ length: numDays }, (_, i) => i + 1).map(day => {
        const dayPlaces = estimateTimes(getDayPlaces(day), trip.startTime || '09:00');
        const total = dayPlaces.reduce((s, p) => s + (p.durationMinutes || 0), 0);
        const color = dayColor(day);

        return (
          <div key={day} className="px-4 mb-10 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="px-3 py-1 rounded-full text-white text-xs font-bold"
                style={{ background: color }}
              >
                Day {day}
              </div>
              <div className="flex-1 h-px" style={{ background: color, opacity: 0.3 }} />
              <span className="text-xs text-slate-500">{dayPlaces.length} stops · {formatDuration(total)}</span>
            </div>

            {dayPlaces.length === 0 ? (
              <p className="text-slate-600 text-sm">No places for this day.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {dayPlaces.map((place, idx) => (
                  <div key={place.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: color, fontSize: '9px' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{place._startTime}</span>
                    </div>
                    <PlaceCard place={place} dayColor={color} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
