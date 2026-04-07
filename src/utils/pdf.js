import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import TripDocument from '../components/TripDocument.jsx';

export async function downloadTripPDF(trip) {
  const doc = createElement(TripDocument, { trip });
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trip.name.replace(/\s+/g, '-')}-itinerary.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
