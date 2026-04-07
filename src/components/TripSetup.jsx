import { useState } from 'react';

const FOCUS_OPTIONS = [
  { value: 'balanced',  label: 'Balanced',        emoji: '⚖️', desc: 'A bit of everything' },
  { value: 'museums',   label: 'Museums & Culture', emoji: '🏛️', desc: 'Galleries, exhibitions' },
  { value: 'history',   label: 'History',           emoji: '🏰', desc: 'Old towns, heritage' },
  { value: 'nature',    label: 'Nature & Hikes',    emoji: '🏔️', desc: 'Parks, trails, views' },
  { value: 'fun',       label: 'Fun & Vibes',       emoji: '🎉', desc: 'Markets, scenes, nightlife' },
];

export default function TripSetup({ onSubmit, onBack }) {
  const [form, setForm] = useState({
    name: '',
    destination: '',
    numDays: 3,
    startTime: '09:00',
    endTime: '21:00',
    focus: 'balanced',
  });

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.destination.trim()) return;
    onSubmit({ ...form, numDays: Number(form.numDays) });
  }

  return (
    <div className="min-h-svh flex flex-col px-4 py-8 max-w-xl mx-auto w-full animate-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200
            hover:bg-slate-700 transition-colors flex items-center justify-center text-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100">New trip</h2>
          <p className="text-xs text-slate-500">Fill in the details, then we'll pull suggestions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Destination */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Destination *
          </label>
          <input
            type="text"
            placeholder="e.g. Edinburgh, Scotland"
            value={form.destination}
            onChange={e => set('destination', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
              text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-600 transition-colors"
          />
        </div>

        {/* Trip name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Trip name (optional)
          </label>
          <input
            type="text"
            placeholder={form.destination ? `e.g. ${form.destination} trip` : 'e.g. Edinburgh Summer 2025'}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
              text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-600 transition-colors"
          />
        </div>

        {/* Days */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Number of days: <span className="text-teal-400">{form.numDays}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={form.numDays}
            onChange={e => set('numDays', e.target.value)}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>1</span><span>10</span>
          </div>
        </div>

        {/* Day times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Day starts
            </label>
            <input
              type="time"
              value={form.startTime}
              onChange={e => set('startTime', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                text-slate-100 focus:outline-none focus:border-teal-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Day ends
            </label>
            <input
              type="time"
              value={form.endTime}
              onChange={e => set('endTime', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                text-slate-100 focus:outline-none focus:border-teal-600 transition-colors"
            />
          </div>
        </div>

        {/* Focus */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Trip focus
          </label>
          <div className="grid grid-cols-1 gap-2">
            {FOCUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('focus', opt.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                  form.focus === opt.value
                    ? 'bg-teal-900/40 border-teal-600/60 text-teal-200'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <div>
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs opacity-60">{opt.desc}</p>
                </div>
                {form.focus === opt.value && <span className="ml-auto text-teal-400">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="py-4 rounded-2xl font-semibold text-white text-base
            transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2
            shadow-lg shadow-teal-900/30"
          style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}
        >
          Generate suggestions →
        </button>
      </form>
    </div>
  );
}
