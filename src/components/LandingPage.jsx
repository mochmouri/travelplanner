import { ArrowRight, Settings } from 'lucide-react';

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

export default function LandingPage({ onPlanTrip, onOpenApp, onSettings, hasTrips }) {
  return (
    <div className="min-h-svh flex flex-col bg-bg">

      {/* Nav */}
      <header className="px-5 pt-8 pb-4 max-w-5xl mx-auto w-full flex items-center justify-between">
        <span className="text-text text-sm font-semibold tracking-tight select-none">
          Travel Planner
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={onSettings}
            className="p-2 rounded-md border border-border text-muted
              hover:border-hi hover:text-text transition-all duration-150"
            aria-label="Settings"
          >
            <Settings size={15} />
          </button>
          <button
            onClick={onOpenApp}
            className="text-xs text-faint hover:text-text transition-colors duration-150"
          >
            {hasTrips ? 'My trips →' : 'Open app →'}
          </button>
        </div>
      </header>

      {/* ── Hero + Features: side by side on md+ ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-5 md:grid md:grid-cols-[1fr_1fr] md:gap-16 md:items-start md:pt-8">

        {/* Hero */}
        <section className="pt-16 pb-16 md:pt-8 md:pb-24 md:sticky md:top-8">
          <p className="text-[10px] tracking-[0.28em] text-amber uppercase font-medium mb-10">
            Muslim travel — redesigned
          </p>

          <h1
            className="font-serif leading-[0.9] font-bold tracking-tight text-text mb-10"
            style={{ fontSize: 'clamp(2.6rem, 9vw, 4rem)' }}
          >
            Plan halal trips.<br />
            Walk the city.<br />
            <span className="text-faint">Pray on time.</span>
          </h1>

          <p className="text-sm text-muted leading-[1.75] mb-12" style={{ maxWidth: '32ch' }}>
            A day-by-day travel planner for Muslim travellers.
            Walkable Google Maps routes, halal food, and prayer
            spaces — all without an account.
          </p>

          <button
            onClick={onPlanTrip}
            className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-md
              bg-cta text-cta-fg text-sm font-medium border border-cta
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
        <section className="pb-16 md:pt-8 md:pb-24">
          <div className="border-t border-line pt-10 md:border-t-0 md:pt-0">
            <p className="text-[10px] text-faint uppercase tracking-[0.25em] font-medium mb-10">
              What it does
            </p>
            <div className="flex flex-col">
              {FEATURES.map((f, i) => (
                <div
                  key={f.num}
                  className={`flex items-start gap-6 py-7 ${
                    i < FEATURES.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <span className="text-[11px] text-amber font-mono tabular-nums mt-0.5 flex-shrink-0 select-none">
                    {f.num}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text mb-1.5 tracking-tight">
                      {f.title}
                    </p>
                    <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom CTA strip */}
      <section className="px-5 py-12 max-w-5xl mx-auto w-full border-t border-line">
        <p className="text-sm text-muted mb-5 leading-relaxed">
          No accounts. No tracking. Your trips live in your browser.
        </p>
        <button
          onClick={onPlanTrip}
          className="group inline-flex items-center gap-2 text-sm font-medium text-text
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
      <footer className="px-5 pb-8 pt-2 max-w-5xl mx-auto w-full">
        <p className="text-[11px] text-faint">
          Powered by Gemini · Maps via OpenStreetMap · Prayer times via Aladhan
        </p>
      </footer>

    </div>
  );
}
