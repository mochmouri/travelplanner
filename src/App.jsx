import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import TripSetup from './components/TripSetup.jsx';
import PlaceImport from './components/PlaceImport.jsx';
import RouteBuilder from './components/RouteBuilder.jsx';
import ItineraryView from './components/ItineraryView.jsx';
import Settings from './components/Settings.jsx';
import useTrip from './hooks/useTrip.js';
import { saveTrip, loadTrips, loadSettings } from './utils/storage.js';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [prevScreen, setPrevScreen] = useState('landing');
  const { trip, initTrip, loadTrip, arrangeAndSave, movePlaceToDay, addFoodToRoute, reorderPlace, setAccommodation, setHalalGuide } = useTrip();

  // Apply dark mode from saved setting or OS preference on mount.
  // OS preference changes are tracked only when no explicit setting is saved.
  useEffect(() => {
    const settings = loadSettings();
    if (settings.darkMode !== undefined) {
      document.documentElement.classList.toggle('dark', settings.darkMode);
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      document.documentElement.classList.toggle('dark', mq.matches);
      const handler = e => document.documentElement.classList.toggle('dark', e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  function go(to) {
    setPrevScreen(screen);
    setScreen(to);
  }

  function handlePlanTrip() { go('setup'); }
  function handleOpenApp()  { go('dashboard'); }
  function handleNewTrip()  { go('setup'); }

  function handleOpenTrip(existing) {
    loadTrip(existing);
    go('builder');
  }

  function handleSetupSubmit(meta) {
    initTrip({ ...meta, name: meta.name || meta.destination });
    go('import');
  }

  function handleImportConfirm(places) {
    arrangeAndSave(places, trip.numDays);
    go('builder');
  }

  function handleContinueToItinerary() { go('itinerary'); }

  function handleSetAccommodation(accom) { setAccommodation(accom); }

  function handleBack() {
    const backMap = {
      dashboard: 'landing',
      setup:     prevScreen || 'landing',
      import:    'setup',
      builder:   'dashboard',
      itinerary: 'builder',
      settings:  prevScreen,
    };
    go(backMap[screen] || 'landing');
  }

  return (
    <div className="min-h-svh bg-bg text-text">
      {screen === 'landing' && (
        <LandingPage
          onPlanTrip={handlePlanTrip}
          onOpenApp={handleOpenApp}
          onSettings={() => go('settings')}
          hasTrips={loadTrips().length > 0}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          onNewTrip={handleNewTrip}
          onOpenTrip={handleOpenTrip}
          onSettings={() => go('settings')}
          onBack={handleBack}
        />
      )}

      {screen === 'settings' && (
        <Settings onBack={handleBack} />
      )}

      {screen === 'setup' && (
        <TripSetup
          onSubmit={handleSetupSubmit}
          onBack={handleBack}
        />
      )}

      {screen === 'import' && trip && (
        <PlaceImport
          trip={trip}
          onConfirm={handleImportConfirm}
          onBack={handleBack}
        />
      )}

      {screen === 'builder' && trip && (
        <RouteBuilder
          trip={trip}
          onMovePlaceToDay={movePlaceToDay}
          onReorderPlace={reorderPlace}
          onAddFoodToRoute={addFoodToRoute}
          onContinue={handleContinueToItinerary}
          onBack={handleBack}
        />
      )}

      {screen === 'itinerary' && trip && (
        <ItineraryView
          trip={trip}
          onBack={handleBack}
          onSetAccommodation={handleSetAccommodation}
          onSetHalalGuide={setHalalGuide}
        />
      )}
    </div>
  );
}
