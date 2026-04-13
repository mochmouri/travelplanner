import { ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    num: '01',
    title: 'Walk the city, day by day',
    desc: 'Attractions are ordered into walkable day routes and exported directly to Google Maps. No driving required.',
  },
  {
    num: '02',
    title: 'Halal food, near where you are',
    desc: "AI-curated halal restaurants suggested alongside each day's stops. Add any of them to your route in one tap.",
  },
  {
    num: '03',
    title: 'Prayer spaces on the map',
    desc: 'Mosques and musallas plotted for each day — not forced into your route, just nearby when you need them.',
  },
  {
    num: '04',
    title: 'Prayer times for any city',
    desc: 'Fajr, Dhuhr, Asr, Maghrib, and Isha on your itinerary. Pulled fresh each visit, no setup required.',
  },
];

export default function LandingPage({ onPlanTrip, onOpenApp, hasTrips }) {
  return (
    <div className="min-h-svh flex flex-col bg-[#0a0a0a]">

      {/* Nav */}
      <header className="px-5 pt-8 pb-4 max-w-xl mx-auto w-full flex items-center justify-between">
        <span className="text-white text-sm font-semibold tracking-tight select-none">
          Travel Planner
        </span>
        <button
          onClick={onOpenApp}
          className="text-xs text-zinc-600 hover:text-white transition-colors duration-150"
        >
          {hasTrips ? 'My trips →' : 'Open app →'}
        </button>
      </header>

      {/* Hero */}
      <section className="px-5 pt-16 pb-24 max-w-xl mx-auto w-full flex-1">

        {/* Eyebrow */}
        <p className="text-[10px] tracking-[0.28em] text-amber uppercase font-medium mb-10">
          Muslim travel — redesigned
        </p>

        {/* Headline — editorial serif mixed with secondary line */}
        <h1
          className="font-serif leading-[0.9] font-bold tracking-tight text-white mb-10"
          style={{ fontSize: 'clamp(2.6rem, 10.5vw, 4.25rem)' }}
        >
          Plan halal trips.<br />
          Walk the city.<br />
          <span className="text-zinc-600">Pray on time.</span>
        </h1>

        {/* Sub */}
        <p className="text-sm text-zinc-500 leading-[1.75] mb-12" style={{ maxWidth: '32ch' }}>
          A day-by-day travel planner for Muslim travellers.
          Walkable Google Maps routes, halal food, and prayer
          spaces — all without an account.
        </p>

        {/* Primary CTA */}
        <button
          onClick={onPlanTrip}
          className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-md
            bg-white text-black text-sm font-medium border border-white
            hover:bg-amber hover:border-amber hover:text-white
            transition-all duration-200 active:scale-[0.98]"
        >
          Plan a trip
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform duration-200"
          />
        </button>
      </section>

      {/* Features */}
      <section className="px-5 pb-16 max-w-xl mx-auto w-full">
        <div className="border-t border-zinc-900 pt-10">
          <p className="text-[10px] text-zinc-700 uppercase tracking-[0.25em] font-medium mb-10">
            What it does
          </p>
          <div className="flex flex-col">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className={`flex items-start gap-6 py-7 ${
                  i < FEATURES.length - 1 ? 'border-b border-zinc-900' : ''
                }`}
              >
                <span className="text-[11px] text-amber font-mono tabular-nums mt-0.5 flex-shrink-0 select-none">
                  {f.num}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1.5 tracking-tight">
                    {f.title}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA strip */}
      <section className="px-5 py-12 max-w-xl mx-auto w-full border-t border-zinc-900">
        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
          No accounts. No tracking. Your trips live in your browser.
        </p>
        <button
          onClick={onPlanTrip}
          className="group inline-flex items-center gap-2 text-sm font-medium text-white
            hover:text-amber transition-colors duration-150"
        >
          Get started
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform duration-200"
          />
        </button>
      </section>

      {/* Footer */}
      <footer className="px-5 pb-8 pt-2 max-w-xl mx-auto w-full">
        <p className="text-[11px] text-zinc-800">
          Powered by Gemini · Maps via OpenStreetMap · Prayer times via Aladhan
        </p>
      </footer>

    </div>
  );
}
