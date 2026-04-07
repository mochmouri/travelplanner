import { useState, useEffect } from 'react';
import { loadSettings, saveSettings } from '../utils/storage.js';

export default function Settings({ onBack }) {
  const [settings, setSettings] = useState({ claude: '', googleMaps: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setSettings({ claude: s.claude || '', googleMaps: s.googleMaps || '' });
  }, []);

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <h2 className="text-xl font-bold text-slate-100">Settings</h2>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
          <h3 className="font-semibold text-slate-200 mb-1">Claude API Key</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Used for AI-assisted place suggestions and itinerary descriptions.
            Get a key at{' '}
            <span className="text-teal-400">console.anthropic.com</span>.
          </p>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={settings.claude}
            onChange={e => setSettings(s => ({ ...s, claude: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
              text-slate-200 text-sm placeholder-slate-600 focus:outline-none
              focus:border-teal-600 transition-colors"
          />
          {import.meta.env.VITE_CLAUDE_API_KEY && (
            <p className="text-xs text-teal-500 mt-2">✓ Also configured via environment variable</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
          <h3 className="font-semibold text-slate-200 mb-1">Google Maps API Key</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Used for the map view showing your route. Enable the Maps JavaScript API
            in Google Cloud Console. Restrict the key to your domain for safety.
          </p>
          <input
            type="password"
            placeholder="AIza..."
            value={settings.googleMaps}
            onChange={e => setSettings(s => ({ ...s, googleMaps: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
              text-slate-200 text-sm placeholder-slate-600 focus:outline-none
              focus:border-teal-600 transition-colors"
          />
          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
            <p className="text-xs text-teal-500 mt-2">✓ Also configured via environment variable</p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-800/30 bg-amber-900/10 p-4">
          <p className="text-xs text-amber-400/80 leading-relaxed">
            <strong className="text-amber-300">Note:</strong> Keys are stored in your browser's
            localStorage and never leave your device. This app is intended for personal use only.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-3 rounded-2xl font-semibold text-white text-sm transition-all
            duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          style={{ background: saved ? '#0d9488' : 'linear-gradient(135deg, #0d9488, #2563eb)' }}
        >
          {saved ? '✓ Saved' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
