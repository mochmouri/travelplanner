import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const FOCUS_OPTIONS = [
  { value: 'balanced', label: 'Balanced',         desc: 'A bit of everything' },
  { value: 'museums',  label: 'Museums & Culture', desc: 'Galleries, exhibitions, institutions' },
  { value: 'history',  label: 'History',           desc: 'Old towns, heritage, architecture' },
  { value: 'nature',   label: 'Nature & Hikes',    desc: 'Parks, trails, viewpoints' },
  { value: 'fun',      label: 'Fun & Vibes',       desc: 'Markets, scenes, local life' },
];

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-medium text-muted uppercase tracking-widest">{label}</label>
        {hint && <span className="text-xs text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function TripSetup({ onSubmit, onBack }) {
  const [form, setForm] = useState({
    destination: '',
    name: '',
    numDays: 3,
    startDate: '',
    startTime: '09:00',
    endTime: '21:00',
    focus: 'balanced',
  });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.destination.trim()) return;
    onSubmit({ ...form, numDays: Number(form.numDays) });
  }

  const inputCls = `w-full px-4 py-3 rounded-md bg-surface border border-border text-text
    text-sm placeholder-faint focus:outline-none focus:border-hi transition-colors`;

  return (
    <div className="min-h-svh px-5 py-10 max-w-xl mx-auto w-full animate-fade-up md:max-w-2xl">
      <div className="flex items-center gap-3 mb-12">
        <button
          onClick={onBack}
          className="p-2 rounded-md border border-border text-muted
            hover:border-hi hover:text-text transition-all duration-150"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-xs text-faint uppercase tracking-widest font-medium">New trip</p>
          <h2 className="text-xl font-bold text-text tracking-tight">Where are you going?</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <Field label="Destination" hint="Required">
          <input
            type="text"
            placeholder="e.g. Edinburgh, Scotland"
            value={form.destination}
            onChange={e => set('destination', e.target.value)}
            required
            autoFocus
            className={inputCls}
          />
        </Field>

        <Field label="Trip name" hint="Optional">
          <input
            type="text"
            placeholder={form.destination ? `${form.destination} trip` : 'Give it a name'}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Start date" hint="Optional — used for prayer times">
          <input
            type="date"
            value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
            className={`${inputCls} [color-scheme:light] dark:[color-scheme:dark]`}
          />
        </Field>

        <Field label="Number of days" hint={`${form.numDays} ${form.numDays === 1 ? 'day' : 'days'}`}>
          <input
            type="range"
            min={1}
            max={10}
            value={form.numDays}
            onChange={e => set('numDays', e.target.value)}
            className="w-full accent-amber"
          />
          <div className="flex justify-between text-xs text-faint mt-1">
            <span>1</span><span>10</span>
          </div>
        </Field>

        <Field label="Day hours">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-faint mb-1.5">Starts</p>
              <input
                type="time"
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <p className="text-xs text-faint mb-1.5">Ends</p>
              <input
                type="time"
                value={form.endTime}
                onChange={e => set('endTime', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </Field>

        <Field label="Focus">
          <div className="flex flex-col gap-2">
            {FOCUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('focus', opt.value)}
                className={`flex items-center justify-between px-4 py-3 rounded-md border text-left
                  transition-all duration-150 ${
                    form.focus === opt.value
                      ? 'border-cta bg-cta text-cta-fg'
                      : 'border-border text-muted hover:border-hi hover:text-text'
                  }`}
              >
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className={`text-xs mt-0.5 ${form.focus === opt.value ? 'opacity-70' : 'text-faint'}`}>
                    {opt.desc}
                  </p>
                </div>
                {form.focus === opt.value && <Check size={14} className="flex-shrink-0" />}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="submit"
          className="w-full flex items-center justify-between px-5 py-4 rounded-md
            bg-cta text-cta-fg font-medium text-sm
            hover:bg-cta/90 transition-all duration-150 active:scale-[0.99] mt-2"
        >
          Generate suggestions
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
