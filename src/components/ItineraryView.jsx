import { useState, useEffect } from 'react';
import { ArrowLeft, Download, MapPin, Coffee, Star, Loader2, ExternalLink, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { suggestAccommodation, suggestHalalGuide, fetchPrayerTimes } from '../utils/ai.js';
import { getDayCentroids } from '../utils/cluster.js';
import { getApiKey, loadSettings } from '../utils/storage.js';
import { downloadTripPDF } from '../utils/pdf.js';
import { haversineKm, walkMins, buildGoogleMapsUrl } from '../utils/route.js';
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
  return places.map((p, i) => {
    const t = current;
    const next = places[i + 1];
    const walkToNext = next ? Math.max(5, walkMins(haversineKm(p, next))) : 0;
    current = addMinutes(current, (p.durationMinutes || 60) + (next ? walkToNext : 0));
    return { ...p, _time: t, _walkToNext: walkToNext };
  });
}

export default function ItineraryView({ trip, onBack, onSetAccommodation, onSetHalalGuide }) {
  const [loadingAccom, setLoadingAccom] = useState(false);
  const [accomError, setAccomError] = useState('');
  const [exportingPDF, setExportingPDF] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerTimesOpen, setPrayerTimesOpen] = useState(false);
  const [prayerDate, setPrayerDate] = useState(trip.startDate || '');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);

  useEffect(() => {
    const method = loadSettings().prayerMethod ?? 2;
    fetchPrayerTimes(trip.destination, prayerDate || null, method)
      .then(setPrayerTimes)
      .catch(() => {});
  }, [trip.destination, prayerDate]);

  useEffect(() => {
    if (trip.halalGuide || !getApiKey('gemini')) return;
    setLoadingGuide(true);
    suggestHalalGuide(trip.destination)
      .then(guide => { onSetHalalGuide(guide); })
      .catch(() => {})
      .finally(() => setLoadingGuide(false));
  }, [trip.destination, trip.halalGuide]);

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
      setAccomError(err.message === 'NO_KEY' ? 'No Gemini API key. Add one in Settings.' : err.message);
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
    return [...places.filter(p => p.day === day && p.order !== undefined)]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  function getDayFood(day) {
    return places.filter(p => p.day === day && p.category === 'food' && p.order === undefined);
  }

  function getDayMosques(day) {
    return places.filter(p => p.day === day && p.category === 'mosque');
  }

  return (
    <div className="pb-20 animate-fade-up">
      {/* ── Page header ── */}
      <div className="px-5 pt-10 pb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-md border border-border text-muted
              hover:border-hi hover:text-text transition-all duration-150"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-xs text-faint uppercase tracking-widest font-medium">Itinerary</p>
            <h2 className="text-xl font-bold text-text tracking-tight">{trip.name || trip.destination}</h2>
          </div>
        </div>

        {/* Metadata pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 rounded-md border border-border text-xs text-muted capitalize">
            {trip.focus} focus
          </span>
          <span className="px-3 py-1 rounded-md border border-border text-xs text-muted">
            {trip.startTime} – {trip.endTime}
          </span>
          <span className="px-3 py-1 rounded-md border border-border text-xs text-muted">
            {places.filter(p => p.order !== undefined).length} places
          </span>
          <span className="px-3 py-1 rounded-md border border-border text-xs text-muted">
            {numDays} {numDays === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* ── md+: sidebar layout ── */}
      <div className="max-w-5xl mx-auto w-full px-5 md:grid md:grid-cols-[300px_1fr] md:gap-10 md:items-start">

        {/* ── Left sidebar: prayer, guide, accommodation, export (sticky on md+) ── */}
        <div className="md:sticky md:top-6 flex flex-col gap-4 mb-8 md:mb-0">

          {/* Export */}
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="w-full flex items-center justify-between px-5 py-3 rounded-md
              border border-hi text-text font-medium text-sm
              hover:bg-cta hover:text-cta-fg hover:border-cta transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              {exportingPDF ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exportingPDF ? 'Generating PDF…' : 'Export itinerary (PDF)'}
            </span>
          </button>

          {/* Prayer times */}
          <div className="border border-mosque-border rounded-lg overflow-hidden">
            <button
              onClick={() => setPrayerTimesOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-xs font-medium text-mosque-text uppercase tracking-widest">
                <Moon size={12} />
                Prayer times
                {prayerDate
                  ? <span className="text-mosque-text/60 normal-case tracking-normal">
                      {new Date(prayerDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  : <span className="text-mosque-text/60 normal-case tracking-normal">today</span>
                }
              </span>
              {prayerTimesOpen
                ? <ChevronUp size={12} className="text-faint" />
                : <ChevronDown size={12} className="text-faint" />}
            </button>
            {prayerTimesOpen && (
              <div className="px-4 pb-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-faint flex-shrink-0">Date</label>
                  <input
                    type="date"
                    value={prayerDate}
                    onChange={e => setPrayerDate(e.target.value)}
                    className="px-3 py-1.5 rounded-md bg-surface border border-border text-text text-xs
                      focus:outline-none focus:border-hi transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                  />
                  {prayerDate && (
                    <button
                      onClick={() => setPrayerDate('')}
                      className="text-xs text-faint hover:text-text transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
                {prayerTimes ? (
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(prayerTimes).map(([name, time]) => (
                      <div key={name} className="text-center">
                        <p className="text-xs text-faint mb-0.5">{name}</p>
                        <p className="text-sm font-mono text-text">{time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-faint">Loading prayer times…</p>
                )}
              </div>
            )}
          </div>

          {/* Halal guide */}
          {(trip.halalGuide || loadingGuide) && (
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setGuideOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-xs font-medium text-muted uppercase tracking-widest">
                  Halal travel guide
                </span>
                {loadingGuide
                  ? <Loader2 size={12} className="animate-spin text-faint" />
                  : guideOpen
                    ? <ChevronUp size={12} className="text-faint" />
                    : <ChevronDown size={12} className="text-faint" />}
              </button>
              {guideOpen && trip.halalGuide && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {trip.halalGuide.overview && (
                    <p className="text-xs text-muted leading-relaxed">{trip.halalGuide.overview}</p>
                  )}
                  {trip.halalGuide.food && (
                    <div>
                      <p className="text-xs font-medium text-text mb-1">Food</p>
                      <p className="text-xs text-muted leading-relaxed">{trip.halalGuide.food}</p>
                    </div>
                  )}
                  {trip.halalGuide.dress && (
                    <div>
                      <p className="text-xs font-medium text-text mb-1">Dress</p>
                      <p className="text-xs text-muted leading-relaxed">{trip.halalGuide.dress}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Accommodation */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs font-medium text-muted uppercase tracking-widest">Where to stay</p>
              <div className="flex-1 h-px bg-line" />
            </div>
            {accommodation?.neighbourhoods?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {accommodation.neighbourhoods.map((n, i) => (
                  <div key={i} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-muted" />
                      <p className="text-sm font-semibold text-text">{n.name}</p>
                    </div>
                    <p className="text-xs text-muted leading-relaxed pl-5">{n.why}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-border rounded-lg p-4">
                {accomError && <p className="text-xs text-muted mb-3">{accomError}</p>}
                <button
                  onClick={fetchAccommodation}
                  disabled={loadingAccom || !getApiKey('gemini')}
                  className="flex items-center gap-2 text-sm text-muted hover:text-text
                    transition-colors disabled:opacity-50 font-medium"
                >
                  {loadingAccom ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  {loadingAccom ? 'Finding best areas…' : 'Suggest accommodation areas'}
                </button>
                {!getApiKey('gemini') && (
                  <p className="text-xs text-faint mt-1">Requires a Gemini API key.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: day-by-day sections ── */}
        <div>
          {Array.from({ length: numDays }, (_, i) => i + 1).map(day => {
            const raw = getDayPlaces(day);
            const dayPlaces = estimateTimes(raw, trip.startTime || '09:00');
            const dayFood = getDayFood(day);
            const dayMosques = getDayMosques(day);
            const total = dayPlaces.reduce((s, p) => s + (p.durationMinutes || 0), 0);
            const walkTotal = dayPlaces.reduce((s, p) => s + (p._walkToNext || 0), 0);
            const mapsUrl = buildGoogleMapsUrl(dayPlaces, trip.destination);

            return (
              <div key={day} className="mb-10">
                {/* Day header */}
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs font-medium text-text uppercase tracking-widest">Day {day}</p>
                  <div className="flex-1 h-px bg-line" />
                  <p className="text-xs text-faint">{dayPlaces.length} stops · {fmt(total + walkTotal)}</p>
                </div>

                {/* Maps link */}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors mb-4"
                  >
                    <ExternalLink size={11} />
                    Open Day {day} route in Google Maps
                  </a>
                )}

                {dayPlaces.length === 0 ? (
                  <p className="text-muted text-sm">No places assigned.</p>
                ) : (
                  <div className="flex flex-col">
                    {dayPlaces.map((place, idx) => {
                      const km = place._walkToNext ? haversineKm(place, dayPlaces[idx + 1]) : 0;
                      return (
                        <div key={place.id}>
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-xs text-faint tabular-nums w-4 text-right">{idx + 1}</span>
                            <span className="text-xs text-faint font-mono">{place._time}</span>
                            {place.category === 'food' && <Coffee size={10} className="text-faint" />}
                            {place.category === 'must-see' && <Star size={10} className="text-faint" />}
                          </div>
                          <PlaceCard place={place} />
                          {idx < dayPlaces.length - 1 && place._walkToNext > 0 && (
                            <div className="flex items-center gap-2 py-1 pl-7 mb-1">
                              <div className="w-px h-4 bg-line ml-0.5" />
                              <span className="text-xs text-faint">
                                ~{place._walkToNext} min walk · {km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Food recommendations */}
                {dayFood.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-xs font-medium text-muted uppercase tracking-widest">
                        Nearby restaurants
                      </p>
                      <div className="flex-1 h-px bg-line" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {dayFood.map(food => (
                        <div key={food.id} className="border border-border rounded-lg p-3">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="text-sm font-semibold text-text leading-snug">{food.name}</p>
                            {food.lat && food.lng && (
                              <a
                                href={`https://maps.google.com/?q=${food.lat},${food.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-faint hover:text-text transition-colors flex-shrink-0"
                                title="Open in Google Maps"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            {food.cuisine && <span className="text-xs text-muted">{food.cuisine}</span>}
                            {food.durationMinutes && <span className="text-xs text-faint">{fmt(food.durationMinutes)}</span>}
                          </div>
                          {food.description && (
                            <p className="text-xs text-muted leading-relaxed">{food.description}</p>
                          )}
                          {food.notes && (
                            <p className="text-xs text-muted border-l border-border pl-2 mt-1">{food.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prayer spaces */}
                {dayMosques.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-xs font-medium text-mosque-text uppercase tracking-widest">
                        Prayer spaces
                      </p>
                      <div className="flex-1 h-px bg-line" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {dayMosques.map(mosque => (
                        <div key={mosque.id} className="border border-mosque-border rounded-lg p-3">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="text-sm font-semibold text-text leading-snug">{mosque.name}</p>
                            {mosque.lat && mosque.lng && (
                              <a
                                href={`https://maps.google.com/?q=${mosque.lat},${mosque.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-faint hover:text-text transition-colors flex-shrink-0"
                                title="Open in Google Maps"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          {mosque.description && (
                            <p className="text-xs text-muted leading-relaxed">{mosque.description}</p>
                          )}
                          {mosque.notes && (
                            <p className="text-xs text-muted border-l border-mosque-border pl-2 mt-1">{mosque.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
