import { useState, useCallback } from 'react';
import { saveTrip } from '../utils/storage.js';
import { clusterPlaces, getDayCentroids } from '../utils/cluster.js';
import { buildRoutes } from '../utils/route.js';

function freshTrip(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: '',
    destination: '',
    numDays: 3,
    startTime: '09:00',
    endTime: '21:00',
    focus: 'balanced',
    places: [],
    accommodation: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export default function useTrip() {
  const [trip, setTrip] = useState(null);

  const initTrip = useCallback((meta) => {
    const t = freshTrip(meta);
    setTrip(t);
    return t;
  }, []);

  const loadTrip = useCallback((existing) => {
    setTrip(existing);
  }, []);

  const updateMeta = useCallback((meta) => {
    setTrip(t => ({ ...t, ...meta }));
  }, []);

  const setPlaces = useCallback((places) => {
    setTrip(t => {
      const updated = { ...t, places };
      return updated;
    });
  }, []);

  // Run clustering + routing and persist
  const arrangeAndSave = useCallback((places, numDays) => {
    const clustered = clusterPlaces(places, numDays);
    const centroids = getDayCentroids(clustered, numDays);
    const routed = buildRoutes(clustered, centroids);
    const updated = { ...trip, places: routed };
    setTrip(updated);
    saveTrip(updated);
    return { places: routed, centroids };
  }, [trip]);

  // Move a place to a different day, then re-route that day
  const movePlaceToDay = useCallback((placeId, newDay) => {
    setTrip(prev => {
      const places = prev.places.map(p => p.id === placeId ? { ...p, day: newDay } : p);
      const centroids = getDayCentroids(places, prev.numDays);
      const routed = buildRoutes(places, centroids);
      const updated = { ...prev, places: routed };
      saveTrip(updated);
      return updated;
    });
  }, []);

  // Move a place up or down within its day
  const reorderPlace = useCallback((placeId, direction) => {
    setTrip(prev => {
      const day = prev.places.find(p => p.id === placeId)?.day;
      if (!day) return prev;

      const dayPlaces = [...prev.places.filter(p => p.day === day)]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const idx = dayPlaces.findIndex(p => p.id === placeId);
      const newIdx = idx + (direction === 'up' ? -1 : 1);
      if (newIdx < 0 || newIdx >= dayPlaces.length) return prev;

      // Swap orders
      const a = dayPlaces[idx];
      const b = dayPlaces[newIdx];
      const places = prev.places.map(p => {
        if (p.id === a.id) return { ...p, order: b.order ?? newIdx };
        if (p.id === b.id) return { ...p, order: a.order ?? idx };
        return p;
      });
      const updated = { ...prev, places };
      saveTrip(updated);
      return updated;
    });
  }, []);

  const setAccommodation = useCallback((accommodation) => {
    setTrip(prev => {
      const updated = { ...prev, accommodation };
      saveTrip(updated);
      return updated;
    });
  }, []);

  const persist = useCallback(() => {
    if (trip) saveTrip(trip);
  }, [trip]);

  return {
    trip,
    initTrip,
    loadTrip,
    updateMeta,
    setPlaces,
    arrangeAndSave,
    movePlaceToDay,
    reorderPlace,
    setAccommodation,
    persist,
  };
}
