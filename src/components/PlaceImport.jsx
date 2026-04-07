import { useState, useEffect } from 'react';
import { suggestAttractions, suggestRestaurants, geocodePlace } from '../utils/ai.js';
import { getApiKey } from '../utils/storage.js';
import PlaceCard from './PlaceCard.jsx';

function LoadingState({ stage }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 animate-fade-up">
      <div className="w-10 h-10 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      <p className="text-slate-300 font-medium">{stage}</p>
      <p className="text-slate-500 text-sm">This takes about 15–20 seconds…</p>
    </div>
  );
}

export default function PlaceImport({ trip, onConfirm, onBack }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', category: 'must-see', description: '', durationMinutes: 90 });
  const [addingPlace, setAddingPlace] = useState(false);

  const hasApiKey = !!getApiKey('claude');

  async function fetchSuggestions() {
    setError('');
    setLoading(true);
    try {
      setLoadingStage('Fetching attraction suggestions…');
      const [attractions, restaurants] = await Promise.all([
        suggestAttractions(trip.destination, trip.numDays, trip.focus),
        (async () => {
          // Slight delay so the user sees the stage message
          await new Promise(r => setTimeout(r, 500));
          setLoadingStage('Finding halal restaurants…');
          return suggestRestaurants(trip.destination);
        })(),
      ]);
      setPlaces([...attractions, ...restaurants]);
    } catch (err) {
      if (err.message === 'NO_KEY') {
        setError('No Claude API key found. Please add one in Settings.');
      } else {
        setError(`Failed to fetch suggestions: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  }

  useEffect(() => {
    if (hasApiKey) fetchSuggestions();
  }, []);

  function removePlace(id) {
    setPlaces(ps => ps.filter(p => p.id !== id));
  }

  function changeCategory(id, category) {
    setPlaces(ps => ps.map(p => p.id === id ? { ...p, category } : p));
  }

  async function handleAddPlace() {
    if (!newPlace.name.trim()) return;
    setAddingPlace(true);
    let lat = 0, lng = 0;
    try {
      const coords = await geocodePlace(newPlace.name, trip.destination);
      lat = coords.lat;
      lng = coords.lng;
    } catch {}
    const place = {
      id: crypto.randomUUID(),
      ...newPlace,
      lat,
      lng,
      type: newPlace.category === 'food' ? 'restaurant' : 'attraction',
      durationMinutes: Number(newPlace.durationMinutes) || 90,
    };
    setPlaces(ps => [...ps, place]);
    setNewPlace({ name: '', category: 'must-see', description: '', durationMinutes: 90 });
    setShowAddForm(false);
    setAddingPlace(false);
  }

  const mustSee = places.filter(p => p.category === 'must-see');
  const optional = places.filter(p => p.category === 'optional');
  const food = places.filter(p => p.category === 'food');

  if (loading) return <LoadingState stage={loadingStage} />;

  return (
    <div className="flex flex-col px-4 py-8 max-w-2xl mx-auto w-full animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200
            hover:bg-slate-700 transition-colors flex items-center justify-center text-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Review suggestions</h2>
          <p className="text-xs text-slate-500">{trip.destination} · {trip.numDays} days</p>
        </div>
      </div>

      {error && (
        <div className="my-4 p-4 rounded-xl bg-red-900/20 border border-red-800/30 text-red-300 text-sm">
          {error}
          {error.includes('API key') && (
            <button onClick={onBack} className="block mt-2 text-teal-400 underline text-xs">
              Go to Settings
            </button>
          )}
          <button onClick={fetchSuggestions} className="block mt-2 text-teal-400 underline text-xs">
            Retry
          </button>
        </div>
      )}

      {!hasApiKey && !error && (
        <div className="my-4 p-4 rounded-xl bg-amber-900/20 border border-amber-800/30 text-amber-300 text-sm">
          Add a Claude API key in Settings to get AI suggestions.
        </div>
      )}

      {places.length > 0 && (
        <>
          <p className="text-xs text-slate-500 mt-4 mb-6">
            {places.length} places suggested. Remove what you don't want, change categories, then confirm.
          </p>

          {/* Must-see */}
          {mustSee.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
                Must-see ({mustSee.length})
              </p>
              <div className="flex flex-col gap-2">
                {mustSee.map(p => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    onRemove={() => removePlace(p.id)}
                    onCategoryChange={cat => changeCategory(p.id, cat)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional */}
          {optional.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Optional ({optional.length})
              </p>
              <div className="flex flex-col gap-2">
                {optional.map(p => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    onRemove={() => removePlace(p.id)}
                    onCategoryChange={cat => changeCategory(p.id, cat)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Food */}
          {food.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
                Halal restaurants ({food.length})
              </p>
              <div className="flex flex-col gap-2">
                {food.map(p => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    onRemove={() => removePlace(p.id)}
                    onCategoryChange={cat => changeCategory(p.id, cat)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add custom place */}
      <div className="mb-6">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 text-slate-500
              hover:border-teal-700/50 hover:text-teal-400 transition-colors text-sm font-medium"
          >
            + Add a place manually
          </button>
        ) : (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-slate-200">Add a place</p>
            <input
              type="text"
              placeholder="Place name"
              value={newPlace.name}
              onChange={e => setNewPlace(p => ({ ...p, name: e.target.value }))}
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                text-sm placeholder-slate-600 focus:outline-none focus:border-teal-600"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newPlace.category}
                onChange={e => setNewPlace(p => ({ ...p, category: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300
                  text-sm focus:outline-none focus:border-teal-600"
              >
                <option value="must-see">Must-see</option>
                <option value="optional">Optional</option>
                <option value="food">Food</option>
              </select>
              <input
                type="number"
                placeholder="Duration (mins)"
                value={newPlace.durationMinutes}
                onChange={e => setNewPlace(p => ({ ...p, durationMinutes: e.target.value }))}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300
                  text-sm focus:outline-none focus:border-teal-600"
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={newPlace.description}
              onChange={e => setNewPlace(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100
                text-sm placeholder-slate-600 focus:outline-none focus:border-teal-600 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddPlace}
                disabled={addingPlace || !newPlace.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-teal-600/20 text-teal-300 text-sm font-medium
                  hover:bg-teal-600/30 transition-colors border border-teal-700/30 disabled:opacity-50"
              >
                {addingPlace ? 'Adding…' : 'Add place'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm
                  hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm */}
      {places.length > 0 && (
        <button
          onClick={() => onConfirm(places)}
          className="py-4 rounded-2xl font-semibold text-white text-base sticky bottom-4
            transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer
            shadow-xl shadow-teal-900/40"
          style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}
        >
          Build route with {places.length} places →
        </button>
      )}
    </div>
  );
}
