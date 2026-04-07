import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { suggestAttractions, suggestRestaurants, geocodePlace } from '../utils/ai.js';
import { getApiKey } from '../utils/storage.js';
import PlaceCard from './PlaceCard.jsx';

function Section({ label, count, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{label}</p>
        <span className="text-xs text-zinc-700 tabular-nums">({count})</span>
        <div className="flex-1 h-px bg-zinc-900" />
      </div>
      <div className="flex flex-col gap-2">{children}</div>
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
      setLoadingStage('Fetching attractions…');
      const [attractions, restaurants] = await Promise.all([
        suggestAttractions(trip.destination, trip.numDays, trip.focus),
        (async () => {
          await new Promise(r => setTimeout(r, 600));
          setLoadingStage('Finding halal restaurants…');
          return suggestRestaurants(trip.destination);
        })(),
      ]);
      setPlaces([...attractions, ...restaurants]);
    } catch (err) {
      setError(err.message === 'NO_KEY'
        ? 'No Claude API key. Add one in Settings.'
        : `Failed: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  }

  useEffect(() => { if (hasApiKey) fetchSuggestions(); }, []);

  function removePlace(id) { setPlaces(ps => ps.filter(p => p.id !== id)); }
  function changeCategory(id, cat) { setPlaces(ps => ps.map(p => p.id === id ? { ...p, category: cat } : p)); }

  async function handleAddPlace() {
    if (!newPlace.name.trim()) return;
    setAddingPlace(true);
    let lat = 0, lng = 0;
    try {
      const coords = await geocodePlace(newPlace.name, trip.destination);
      lat = coords.lat; lng = coords.lng;
    } catch {}
    const place = {
      id: crypto.randomUUID(),
      ...newPlace,
      lat, lng,
      type: newPlace.category === 'food' ? 'restaurant' : 'attraction',
      durationMinutes: Number(newPlace.durationMinutes) || 90,
    };
    setPlaces(ps => [...ps, place]);
    setNewPlace({ name: '', category: 'must-see', description: '', durationMinutes: 90 });
    setShowAddForm(false);
    setAddingPlace(false);
  }

  const mustSee  = places.filter(p => p.category === 'must-see');
  const optional = places.filter(p => p.category === 'optional');
  const food     = places.filter(p => p.category === 'food');

  if (loading) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 animate-fade-up">
        <div className="w-6 h-6 border border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-300 font-medium">{loadingStage}</p>
        <p className="text-xs text-zinc-600">~15 seconds</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 max-w-xl mx-auto w-full animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-md border border-zinc-800 text-zinc-500
            hover:border-zinc-600 hover:text-white transition-all duration-150"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">Review</p>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {trip.destination}
          </h2>
        </div>
        {places.length > 0 && (
          <button
            onClick={fetchSuggestions}
            className="p-2 rounded-md border border-zinc-800 text-zinc-500
              hover:border-zinc-600 hover:text-white transition-all duration-150"
            title="Regenerate suggestions"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-md border border-zinc-800 flex gap-3">
          <AlertCircle size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-zinc-300">{error}</p>
            <button onClick={fetchSuggestions} className="text-xs text-zinc-500 hover:text-white mt-1 transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}

      {!hasApiKey && !error && (
        <div className="mt-6 p-4 rounded-md border border-zinc-800">
          <p className="text-sm text-zinc-400">Add a Claude API key in Settings to get AI suggestions.</p>
        </div>
      )}

      {places.length > 0 && (
        <p className="text-xs text-zinc-600 mt-6 mb-8">
          {places.length} places — remove what you don't want, adjust categories, then confirm.
        </p>
      )}

      {mustSee.length > 0 && (
        <Section label="Must-see" count={mustSee.length}>
          {mustSee.map(p => (
            <PlaceCard key={p.id} place={p}
              onRemove={() => removePlace(p.id)}
              onCategoryChange={cat => changeCategory(p.id, cat)}
            />
          ))}
        </Section>
      )}

      {optional.length > 0 && (
        <Section label="Optional" count={optional.length}>
          {optional.map(p => (
            <PlaceCard key={p.id} place={p}
              onRemove={() => removePlace(p.id)}
              onCategoryChange={cat => changeCategory(p.id, cat)}
            />
          ))}
        </Section>
      )}

      {food.length > 0 && (
        <Section label="Halal restaurants" count={food.length}>
          {food.map(p => (
            <PlaceCard key={p.id} place={p}
              onRemove={() => removePlace(p.id)}
              onCategoryChange={cat => changeCategory(p.id, cat)}
            />
          ))}
        </Section>
      )}

      {/* Add manual */}
      <div className="mb-8">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-md
              border border-dashed border-zinc-800 text-zinc-600 text-sm
              hover:border-zinc-600 hover:text-white transition-all duration-150"
          >
            <Plus size={14} />
            Add a place manually
          </button>
        ) : (
          <div className="border border-zinc-800 rounded-lg p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-white">Add a place</p>
            <input
              type="text"
              placeholder="Place name"
              value={newPlace.name}
              onChange={e => setNewPlace(p => ({ ...p, name: e.target.value }))}
              className="px-4 py-2.5 rounded-md bg-black border border-zinc-800 text-white text-sm
                placeholder-zinc-700 focus:outline-none focus:border-zinc-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newPlace.category}
                onChange={e => setNewPlace(p => ({ ...p, category: e.target.value }))}
                className="px-3 py-2.5 rounded-md bg-black border border-zinc-800 text-zinc-300
                  text-sm focus:outline-none focus:border-zinc-500"
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
                className="px-3 py-2.5 rounded-md bg-black border border-zinc-800 text-zinc-300
                  text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={newPlace.description}
              onChange={e => setNewPlace(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="px-4 py-2.5 rounded-md bg-black border border-zinc-800 text-white text-sm
                placeholder-zinc-700 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddPlace}
                disabled={addingPlace || !newPlace.name.trim()}
                className="flex-1 py-2.5 rounded-md bg-white text-black text-sm font-medium
                  hover:bg-zinc-100 transition-colors disabled:opacity-40"
              >
                {addingPlace ? 'Adding…' : 'Add place'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-md border border-zinc-800 text-zinc-500 text-sm
                  hover:border-zinc-600 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {places.length > 0 && (
        <div className="sticky bottom-5">
          <button
            onClick={() => onConfirm(places)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-md
              bg-white text-black font-medium text-sm shadow-2xl shadow-black/80
              hover:bg-zinc-100 transition-all duration-150 active:scale-[0.99]"
          >
            Build route with {places.length} places
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
