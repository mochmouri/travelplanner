import { useState, useEffect } from 'react';
import { ArrowLeft, KeyRound, Check, AlertTriangle, Moon, Sun } from 'lucide-react';
import { loadSettings, saveSettings } from '../utils/storage.js';

const PRAYER_METHODS = [
  { value: 2, label: 'ISNA — Islamic Society of North America' },
  { value: 3, label: 'MWL — Muslim World League' },
  { value: 4, label: 'Umm al-Qura, Makkah' },
  { value: 5, label: 'Egyptian General Authority of Survey' },
  { value: 1, label: 'Karachi — Univ. of Islamic Sciences' },
  { value: 0, label: 'Shafi (standard)' },
];

export default function Settings({ onBack }) {
  const [gemini, setGemini] = useState('');
  const [prayerMethod, setPrayerMethod] = useState(2);
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setGemini(s.gemini || '');
    setPrayerMethod(s.prayerMethod ?? 2);
    // Reflect whatever the document currently has (already applied by App.jsx)
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  }

  function handleSave() {
    saveSettings({ gemini, prayerMethod, darkMode });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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
          <p className="text-xs text-faint uppercase tracking-widest font-medium">Config</p>
          <h2 className="text-xl font-bold text-text tracking-tight">Settings</h2>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Dark mode toggle */}
        <div className="border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon size={14} className="text-muted" /> : <Sun size={14} className="text-muted" />}
              <h3 className="text-sm font-semibold text-text">Appearance</h3>
            </div>
            <button
              type="button"
              onClick={toggleDark}
              className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200
                ${darkMode ? 'bg-cta border-cta' : 'bg-lift border-border'}`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-surface shadow transition-transform duration-200
                  ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          <p className="text-xs text-faint mt-2 leading-relaxed">
            {darkMode ? 'Dark mode' : 'Light mode'} · switches immediately
          </p>
        </div>

        {/* Gemini key */}
        <div className="border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={14} className="text-muted" />
            <h3 className="text-sm font-semibold text-text">Gemini API Key</h3>
            <span className="ml-auto text-xs text-faint border border-border px-2 py-0.5 rounded-md">Free</span>
          </div>
          <p className="text-xs text-faint mb-4 leading-relaxed">
            Powers AI-assisted place suggestions, descriptions, and accommodation recommendations.
            Get a free key (no billing required) at{' '}
            <span className="text-muted">aistudio.google.com</span> → Get API key.
          </p>
          <input
            type="password"
            placeholder="AIza..."
            value={gemini}
            onChange={e => setGemini(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-surface border border-border text-text text-sm
              placeholder-faint focus:outline-none focus:border-hi transition-colors font-mono"
          />
          {import.meta.env.VITE_GEMINI_API_KEY && (
            <p className="flex items-center gap-1.5 text-xs text-muted mt-2">
              <Check size={11} />
              Also set via environment variable
            </p>
          )}
        </div>

        {/* Prayer times method */}
        <div className="border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-1">
            <Moon size={14} className="text-muted" />
            <h3 className="text-sm font-semibold text-text">Prayer times calculation</h3>
            <span className="ml-auto text-xs text-faint border border-border px-2 py-0.5 rounded-md">No key needed</span>
          </div>
          <p className="text-xs text-faint mb-4 leading-relaxed">
            Chooses which juristic method is used to calculate prayer times via the Aladhan API.
          </p>
          <div className="flex flex-col gap-2">
            {PRAYER_METHODS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setPrayerMethod(m.value)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-md border text-left
                  transition-all duration-150 ${
                    prayerMethod === m.value
                      ? 'border-cta bg-cta text-cta-fg'
                      : 'border-border text-muted hover:border-hi hover:text-text'
                  }`}
              >
                <span className="text-sm">{m.label}</span>
                {prayerMethod === m.value && <Check size={13} className="flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Map note */}
        <div className="border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Check size={14} className="text-text" />
            <h3 className="text-sm font-semibold text-text">Maps — no key needed</h3>
          </div>
          <p className="text-xs text-faint leading-relaxed">
            Maps use CartoDB Dark Matter tiles via OpenStreetMap — completely free, no API key, no billing, no expiry.
          </p>
        </div>

        {/* Warning */}
        <div className="border border-border rounded-lg p-4 flex gap-3">
          <AlertTriangle size={14} className="text-muted flex-shrink-0 mt-0.5" />
          <p className="text-xs text-faint leading-relaxed">
            Your API key is stored in your browser's localStorage only. Nothing is sent to any server
            other than Google's API directly.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-md text-sm font-medium transition-all duration-200
            flex items-center justify-center gap-2 cursor-pointer
            bg-cta text-cta-fg hover:bg-cta/90 active:scale-[0.99]"
        >
          {saved && <Check size={14} />}
          {saved ? 'Saved' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
