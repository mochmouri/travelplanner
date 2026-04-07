import { loadTrips, deleteTrip } from '../utils/storage.js';
import { useState, useEffect } from 'react';

function TripCard({ trip, onOpen, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const places = trip.places?.length || 0;
  const days = trip.numDays || 1;
  const date = new Date(trip.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 hover:border-teal-700/50 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-slate-100 text-base group-hover:text-teal-300 transition-colors">
            {trip.name || trip.destination}
          </h3>
          <p className="text-sm text-slate-400">{trip.destination}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-black text-teal-400">{days}</p>
          <p className="text-xs text-slate-500">{days === 1 ? 'day' : 'days'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
        <span>{places} places</span>
        <span>·</span>
        <span className="capitalize">{trip.focus || 'balanced'} focus</span>
        <span>·</span>
        <span>{date}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onOpen(trip)}
          className="flex-1 py-2 rounded-xl bg-teal-600/20 text-teal-300 text-sm font-medium
            hover:bg-teal-600/30 transition-colors border border-teal-700/30"
        >
          Open
        </button>
        {confirmDelete ? (
          <div className="flex gap-1.5">
            <button
              onClick={() => onDelete(trip.id)}
              className="px-3 py-2 rounded-xl bg-red-600/20 text-red-300 text-xs font-medium
                hover:bg-red-600/30 transition-colors border border-red-700/30"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 rounded-xl bg-slate-700/40 text-slate-400 text-xs
                hover:bg-slate-700/60 transition-colors border border-slate-700/30"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-2 rounded-xl bg-slate-800/60 text-slate-500 text-sm
              hover:bg-red-900/20 hover:text-red-400 transition-colors border border-slate-700/30"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ onNewTrip, onOpenTrip, onSettings }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    setTrips(loadTrips());
  }, []);

  function handleDelete(id) {
    deleteTrip(id);
    setTrips(loadTrips());
  }

  return (
    <div className="min-h-svh flex flex-col px-4 py-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-2xl font-black"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ✈ Travel Planner
          </h1>
          <p className="text-slate-500 text-sm">Your trips, planned properly.</p>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200
            hover:bg-slate-700 transition-colors flex items-center justify-center text-base"
        >
          ⚙
        </button>
      </div>

      {/* New trip button */}
      <button
        onClick={onNewTrip}
        className="w-full py-4 rounded-2xl mb-8 font-semibold text-white text-base
          transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer
          shadow-lg shadow-teal-900/30"
        style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}
      >
        + Plan a new trip
      </button>

      {/* Trips list */}
      {trips.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 animate-fade-up">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-slate-400 text-base mb-1">No trips yet.</p>
          <p className="text-slate-600 text-sm">Plan your first trip to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-fade-up">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Your trips</p>
          {trips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              onOpen={onOpenTrip}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
