import { useState, useEffect } from 'react';
import { ArrowLeft, KeyRound, Check, AlertTriangle } from 'lucide-react';
import { loadSettings, saveSettings } from '../utils/storage.js';

export default function Settings({ onBack }) {
  const [claude, setClaude] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setClaude(s.claude || '');
  }, []);

  function handleSave() {
    saveSettings({ claude });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-svh px-5 py-10 max-w-xl mx-auto w-full animate-fade-up">
      <div className="flex items-center gap-3 mb-12">
        <button
          onClick={onBack}
          className="p-2 rounded-md border border-zinc-800 text-zinc-500
            hover:border-zinc-600 hover:text-white transition-all duration-150"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">Config</p>
          <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Claude key */}
        <div className="border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={14} className="text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Claude API Key</h3>
          </div>
          <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
            Powers AI-assisted place suggestions, descriptions, and accommodation recommendations.
            Get a key at <span className="text-zinc-400">console.anthropic.com</span>.
          </p>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={claude}
            onChange={e => setClaude(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-black border border-zinc-800 text-white text-sm
              placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
          />
          {import.meta.env.VITE_CLAUDE_API_KEY && (
            <p className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
              <Check size={11} />
              Also set via environment variable
            </p>
          )}
        </div>

        {/* Map note */}
        <div className="border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Check size={14} className="text-white" />
            <h3 className="text-sm font-semibold text-white">Maps — no key needed</h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Maps use CartoDB Dark Matter tiles via OpenStreetMap — completely free with no API key,
            billing, or expiry.
          </p>
        </div>

        {/* Warning */}
        <div className="border border-zinc-800 rounded-lg p-4 flex gap-3">
          <AlertTriangle size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-600 leading-relaxed">
            Keys are stored in your browser's localStorage only. Nothing is sent to any server other
            than the API provider directly.
          </p>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-md text-sm font-medium transition-all duration-200
            hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2
            ${saved
              ? 'bg-white text-black'
              : 'bg-white text-black hover:bg-zinc-100'
            }`}
        >
          {saved ? <Check size={14} /> : null}
          {saved ? 'Saved' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
