import { useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import TripSetup from './components/TripSetup.jsx';
import PlaceImport from './components/PlaceImport.jsx';
import RouteBuilder from './components/RouteBuilder.jsx';
import ItineraryView from './components/ItineraryView.jsx';
import Settings from './components/Settings.jsx';
import useTrip from './hooks/useTrip.js';
import { saveTrip, loadTrips } from './utils/storage.js';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [prevScreen, setPrevScreen] = useState('landing');
  const { trip, initTrip, loadTrip, arrangeAndSave, movePlaceToDay, addFoodToRoute, reorderPlace, setAccommodation, setHalalGuide } = useTrip();

  function go(to) {
    setPrevScreen(screen);
    setScreen(to);
  }

  // Landing → Setup (new trip)
  function handlePlanTrip() { go('setup'); }

  // Landing → Dashboard
  function handleOpenApp() { go('dashboard'); }

  // Dashboard → Setup (new trip)
  function handleNewTrip() { go('setup'); }

  // Dashboard → open existing trip
  function handleOpenTrip(existing) {
    loadTrip(existing);
    go('builder');
  }

  // Setup → Import
  function handleSetupSubmit(meta) {
    initTrip({ ...meta, name: meta.name || meta.destination });
    go('import');
  }

  // Import → Builder
  function handleImportConfirm(places) {
    const { places: routed } = arrangeAndSave(places, trip.numDays);
    go('builder');
  }

  // Builder → Itinerary
  function handleContinueToItinerary() { go('itinerary'); }

  // Itinerary: set accommodation
  function handleSetAccommodation(accom) {
    setAccommodation(accom);
  }

  // Back navigation
  function handleBack() {
    const backMap = {
      dashboard: 'landing',
      setup: prevScreen || 'landing',
      import: 'setup',
      builder: 'dashboard',
      itinerary: 'builder',
      settings: prevScreen,
    };
    go(backMap[screen] || 'landing');
  }

  return (
    <div className="min-h-svh">
      {screen === 'landing' && (
        <LandingPage
          onPlanTrip={handlePlanTrip}
          onOpenApp={handleOpenApp}
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
