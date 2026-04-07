import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, ArrowRight, MapPin, Calendar, Compass } from 'lucide-react';
import { loadTrips, deleteTrip } from '../utils/storage.js';

function TripCard({ trip, onOpen, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const places = trip.places?.length || 0;
  const days = trip.numDays || 1;
  const date = new Date(trip.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="group border border-zinc-800 rounded-lg bg-zinc-950 hover:border-zinc-600 transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm tracking-tight truncate group-hover:text-white transition-colors">
              {trip.name || trip.destination}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-zinc-600" />
              <p className="text-xs text-zinc-500">{trip.destination}</p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-white tabular-nums">{days}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{days === 1 ? 'day' : 'days'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-600 mb-4 border-t border-zinc-900 pt-3">
          <span className="flex items-center gap-1">
            <Compass size={10} />
            <span className="capitalize">{trip.focus || 'balanced'}</span>
          </span>
          <span>·</span>
          <span>{places} places</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {date}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onOpen(trip)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md
              border border-zinc-700 text-white text-xs font-medium
              hover:bg-white hover:text-black hover:border-white transition-all duration-150"
          >
            Open
            <ArrowRight size={12} />
          </button>

          {confirmDelete ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => onDelete(trip.id)}
                className="px-3 py-2 rounded-md border border-red-900 text-red-400 text-xs
                  hover:bg-red-950 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 rounded-md border border-zinc-800 text-zinc-500 text-xs
                  hover:border-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-md border border-zinc-800 text-zinc-600
                hover:border-zinc-600 hover:text-red-400 transition-all duration-150"
              aria-label="Delete trip"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onNewTrip, onOpenTrip, onSettings }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => { setTrips(loadTrips()); }, []);

  function handleDelete(id) {
    deleteTrip(id);
    setTrips(loadTrips());
  }

  return (
    <div className="min-h-svh px-5 py-10 max-w-xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-2">Personal</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Travel Planner</h1>
          <p className="text-sm text-zinc-500 mt-1">Plan it once. Do it properly.</p>
        </div>
        <button
          onClick={onSettings}
          className="mt-1 p-2 rounded-md border border-zinc-800 text-zinc-500
            hover:border-zinc-600 hover:text-white transition-all duration-150"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* New trip */}
      <button
        onClick={onNewTrip}
        className="w-full flex items-center justify-between px-5 py-4 rounded-lg mb-10
          border border-zinc-700 text-white font-medium text-sm
          hover:bg-white hover:text-black hover:border-white transition-all duration-200 group"
      >
        <span className="flex items-center gap-2">
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
          Plan a new trip
        </span>
        <ArrowRight size={14} />
      </button>

      {/* Trips */}
      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
          <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mb-4">
            <MapPin size={18} className="text-zinc-700" />
          </div>
          <p className="text-zinc-400 text-sm font-medium mb-1">No trips yet</p>
          <p className="text-zinc-700 text-xs">Plan your first trip to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-fade-up">
          <p className="text-xs text-zinc-700 uppercase tracking-widest font-medium mb-1">Your trips</p>
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} onOpen={onOpenTrip} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
