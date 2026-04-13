# Travel Planner

A day-by-day travel planner for Muslim travellers.

**Live:** https://mochmouri.github.io/travelplanner/

---

## What it does

- Generates walkable day routes from AI-suggested attractions, exported to Google Maps
- Suggests halal restaurants near each day's stops
- Shows prayer spaces (mosques, musallas) alongside your route
- Displays daily prayer times (Fajr → Isha) for any destination
- Generates a halal-friendliness guide per destination (food availability, dress norms)

## How it works

Client-side only — no backend, no accounts. Everything runs in the browser.

- **AI suggestions**: Gemini 2.5 Flash via direct API call (user-supplied key)
- **Maps**: React-Leaflet with CartoDB Dark Matter tiles (no key needed)
- **Prayer times**: Aladhan.com public API (no key needed)
- **Storage**: localStorage only

## Setup

```bash
npm install
npm run dev
```

Add a Gemini API key in Settings (or set `VITE_GEMINI_API_KEY` in a `.env` file).
Get a free key (no billing required) at [aistudio.google.com](https://aistudio.google.com) → Get API key.

## Deploy

```bash
npm run deploy
```

Deploys to GitHub Pages via `gh-pages`.
