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
    <div className="group border border-border rounded-lg bg-surface hover:border-hi transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-text text-sm tracking-tight truncate">
              {trip.name || trip.destination}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-faint" />
              <p className="text-xs text-muted">{trip.destination}</p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-text tabular-nums">{days}</p>
            <p className="text-xs text-faint mt-0.5">{days === 1 ? 'day' : 'days'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-faint mb-4 border-t border-line pt-3">
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
              border border-hi text-text text-xs font-medium
              hover:bg-cta hover:text-cta-fg hover:border-cta transition-all duration-150"
          >
            Open
            <ArrowRight size={12} />
          </button>

          {confirmDelete ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => onDelete(trip.id)}
                className="px-3 py-2 rounded-md border border-danger-border text-danger-text text-xs
                  hover:bg-danger-bg transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 rounded-md border border-border text-muted text-xs
                  hover:border-hi transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-md border border-border text-faint
                hover:border-danger-border hover:text-danger-text transition-all duration-150"
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

export default function Dashboard({ onNewTrip, onOpenTrip, onSettings, onBack }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => { setTrips(loadTrips()); }, []);

  function handleDelete(id) {
    deleteTrip(id);
    setTrips(loadTrips());
  }

  return (
    <div className="min-h-svh px-5 py-10 max-w-2xl mx-auto w-full md:max-w-3xl">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onBack}
          className="text-xs text-faint hover:text-text transition-colors duration-150"
        >
          ← Home
        </button>
        <button
          onClick={onSettings}
          className="p-2 rounded-md border border-border text-muted
            hover:border-hi hover:text-text transition-all duration-150"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-text tracking-tight">Your trips</h1>
        <p className="text-sm text-muted mt-1">Plan it once. Do it properly.</p>
      </div>

      {/* New trip */}
      <button
        onClick={onNewTrip}
        className="w-full flex items-center justify-between px-5 py-4 rounded-lg mb-10
          border border-hi text-text font-medium text-sm
          hover:bg-cta hover:text-cta-fg hover:border-cta transition-all duration-200 group"
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
          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4">
            <MapPin size={18} className="text-faint" />
          </div>
          <p className="text-muted text-sm font-medium mb-1">No trips yet</p>
          <p className="text-faint text-xs">Plan your first trip to get started.</p>
        </div>
      ) : (
        <div className="animate-fade-up">
          <p className="text-xs text-faint uppercase tracking-widest font-medium mb-3">Your trips</p>
          <div className="grid gap-3 md:grid-cols-2">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} onOpen={onOpenTrip} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
