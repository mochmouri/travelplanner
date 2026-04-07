import { useState } from 'react';
import { ArrowLeft, Download, MapPin, Coffee, Star, CircleDot, Loader2 } from 'lucide-react';
import { suggestAccommodation } from '../utils/ai.js';
import { getDayCentroids } from '../utils/cluster.js';
import { getApiKey } from '../utils/storage.js';
import { downloadTripPDF } from '../utils/pdf.js';
import PlaceCard from './PlaceCard.jsx';

function fmt(mins) {
  if (!mins) return '—';
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
    try { await downloadTripPDF(trip); }
    catch (err) { alert('PDF export failed: ' + err.message); }
    finally { setExportingPDF(false); }
  }

  function getDayPlaces(day) {
    return [...places.filter(p => p.day === day)].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return (
    <div className="pb-20 animate-fade-up">
      {/* Header */}
      <div className="px-5 pt-10 pb-8 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-md border border-zinc-800 text-zinc-500
              hover:border-zinc-600 hover:text-white transition-all duration-150"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">Itinerary</p>
            <h2 className="text-xl font-bold text-white tracking-tight">{trip.name || trip.destination}</h2>
          </div>
        </div>

        {/* Metadata pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 rounded-md border border-zinc-800 text-xs text-zinc-400 capitalize">
            {trip.focus} focus
          </span>
          <span className="px-3 py-1 rounded-md border border-zinc-800 text-xs text-zinc-400">
            {trip.startTime} – {trip.endTime}
          </span>
          <span className="px-3 py-1 rounded-md border border-zinc-800 text-xs text-zinc-400">
            {places.length} places
          </span>
          <span className="px-3 py-1 rounded-md border border-zinc-800 text-xs text-zinc-400">
            {numDays} {numDays === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Export */}
        <button
          onClick={handleExportPDF}
          disabled={exportingPDF}
          className="w-full flex items-center justify-between px-5 py-3 rounded-md
            border border-zinc-700 text-white font-medium text-sm
            hover:bg-white hover:text-black hover:border-white transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            {exportingPDF ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exportingPDF ? 'Generating PDF…' : 'Export full itinerary (PDF)'}
          </span>
        </button>
      </div>

      {/* Accommodation */}
      <div className="px-5 mb-10 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Where to stay</p>
          <div className="flex-1 h-px bg-zinc-900" />
        </div>

        {accommodation?.neighbourhoods?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {accommodation.neighbourhoods.map((n, i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={12} className="text-zinc-400" />
                  <p className="text-sm font-semibold text-white">{n.name}</p>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed pl-5">{n.why}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg p-4">
            {accomError && <p className="text-xs text-zinc-400 mb-3">{accomError}</p>}
            <button
              onClick={fetchAccommodation}
              disabled={loadingAccom || !getApiKey('claude')}
              className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white
                transition-colors disabled:opacity-50 font-medium"
            >
              {loadingAccom ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
              {loadingAccom ? 'Finding best areas…' : 'Suggest accommodation areas'}
            </button>
            {!getApiKey('claude') && (
              <p className="text-xs text-zinc-700 mt-1">Requires a Claude API key.</p>
            )}
          </div>
        )}
      </div>

      {/* Day sections */}
      {Array.from({ length: numDays }, (_, i) => i + 1).map(day => {
        const dayPlaces = estimateTimes(getDayPlaces(day), trip.startTime || '09:00');
        const total = dayPlaces.reduce((s, p) => s + (p.durationMinutes || 0), 0);

        return (
          <div key={day} className="px-5 mb-10 max-w-xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs font-medium text-white uppercase tracking-widest">Day {day}</p>
              <div className="flex-1 h-px bg-zinc-900" />
              <p className="text-xs text-zinc-600">{dayPlaces.length} stops · {fmt(total)}</p>
            </div>

            {dayPlaces.length === 0 ? (
              <p className="text-zinc-700 text-sm">No places assigned.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {dayPlaces.map((place, idx) => (
                  <div key={place.id}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs text-zinc-700 tabular-nums w-4 text-right">{idx + 1}</span>
                      <span className="text-xs text-zinc-600 font-mono">{place._time}</span>
                      {place.category === 'food' && <Coffee size={10} className="text-zinc-600" />}
                      {place.category === 'must-see' && <Star size={10} className="text-zinc-600" />}
                    </div>
                    <PlaceCard place={place} />
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
