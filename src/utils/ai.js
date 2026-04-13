import { getApiKey } from './storage.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

async function callGemini(prompt) {
  const apiKey = getApiKey('gemini');
  if (!apiKey) throw new Error('NO_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts
    ?.map(p => p.text || '')
    .join('') || '';
}

function parseJSON(text) {
  // First try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Extract first valid JSON block more safely
  let firstBrace = text.indexOf('{');
  let firstBracket = text.indexOf('[');

  let start = -1;
  let openChar = '';

  if (firstBracket !== -1 && (firstBracket < firstBrace || firstBrace === -1)) {
    start = firstBracket;
    openChar = '[';
  } else if (firstBrace !== -1) {
    start = firstBrace;
    openChar = '{';
  }

  if (start === -1) throw new Error('No JSON found');

  let stack = 0;
  let end = -1;

  for (let i = start; i < text.length; i++) {
    if (text[i] === openChar) stack++;
    if (text[i] === (openChar === '[' ? ']' : '}')) stack--;

    if (stack === 0) {
      end = i;
      break;
    }
  }

  if (end === -1) throw new Error('Incomplete JSON');

  const jsonString = text.slice(start, end + 1);
  return JSON.parse(jsonString);
}

export async function suggestAttractions(destination, numDays, focus) {
  const focusDesc = {
    balanced: 'a good balance of landmarks, history, culture, and local experiences',
    museums:  'museums, galleries, and cultural institutions',
    history:  'historical sites, old quarters, and heritage landmarks',
    nature:   'parks, nature reserves, hikes, viewpoints, and outdoor activities',
    fun:      'fun, lively, and unique experiences including markets, viewpoints, street scenes',
  }[focus] || 'a balanced range of highlights';

  const prompt = `You are an expert travel guide. Suggest attractions for a ${numDays}-day trip to ${destination} focused on ${focusDesc}.

Return ONLY a JSON array with no other text or markdown. Each object must have exactly these fields:
[
  {
    "name": "exact place name",
    "category": "must-see" or "optional",
    "lat": number,
    "lng": number,
    "description": "2-3 engaging sentences about why this place is worth visiting",
    "durationMinutes": number,
    "openingHours": "e.g. 09:00–17:00, closed Mondays" or null if unknown
  }
]

Include 12-18 places total. Mix iconic landmarks with lesser-known gems. Use accurate coordinates.`;

  const text = await callGemini(prompt);
  const raw = parseJSON(text);
  const places = Array.isArray(raw) ? raw : (Object.values(raw).find(v => Array.isArray(v)) ?? []);
  return places.map(p => ({
    id: crypto.randomUUID(),
    category: 'must-see',
    durationMinutes: 90,
    ...p,
    type: 'attraction',
  }));
}

export async function suggestRestaurants(destination) {
  const prompt = `You are a halal food expert. Suggest the best halal restaurants in ${destination}.

Return ONLY a JSON array with no other text or markdown. Each object must have exactly these fields:
[
  {
    "name": "restaurant name",
    "lat": number,
    "lng": number,
    "cuisine": "e.g. Turkish, Indian, Lebanese, Local",
    "description": "2-3 sentences: what makes it great, must-try dishes, atmosphere",
    "durationMinutes": 60,
    "notes": "brief note on halal status e.g. fully halal certified"
  }
]

Include 8-10 restaurants. Only genuinely halal options. Use accurate coordinates.`;

  const text = await callGemini(prompt);
  const raw = parseJSON(text);
  const places = Array.isArray(raw) ? raw : (Object.values(raw).find(v => Array.isArray(v)) ?? []);
  return places.map(p => ({
    id: crypto.randomUUID(),
    category: 'food',
    durationMinutes: 60,
    ...p,
    type: 'restaurant',
  }));
}

export async function suggestAccommodation(destination, centroids) {
  const centroidDesc = centroids
    .map((c, i) => `Day ${i + 1}: lat ${c.lat.toFixed(4)}, lng ${c.lng.toFixed(4)}`)
    .join('\n');

  const prompt = `For a trip to ${destination}, the daily itinerary clusters are centred at:
${centroidDesc}

Suggest 2-3 neighbourhoods to stay in that minimise daily travel. Return ONLY JSON:
{
  "neighbourhoods": [
    { "name": "neighbourhood name", "why": "1-2 sentences on why it's a good base" }
  ]
}`;

  const text = await callGemini(prompt);
  return parseJSON(text);
}

export async function geocodePlace(name, destination) {
  const prompt = `What are the approximate GPS coordinates of "${name}" in ${destination}? Return ONLY JSON: {"lat": number, "lng": number}`;
  const text = await callGemini(prompt);
  return parseJSON(text);
}

export async function suggestMosques(destination) {
  const prompt = `Suggest prayer spaces (mosques and musallas) for Muslim travellers in ${destination}.

Return ONLY a JSON array with no other text or markdown. Each object must have exactly these fields:
[
  {
    "name": "mosque or prayer space name",
    "lat": number,
    "lng": number,
    "description": "1-2 sentences on location and any visitor notes",
    "notes": "e.g. open to visitors, wudu facilities available, Friday prayer at 13:15"
  }
]

Include 4-8 options. Prioritise central, well-known, and visitor-friendly mosques. Use accurate coordinates.`;

  const text = await callGemini(prompt);
  const raw = parseJSON(text);
  const places = Array.isArray(raw) ? raw : (Object.values(raw).find(v => Array.isArray(v)) ?? []);
  return places.map(p => ({
    id: crypto.randomUUID(),
    category: 'mosque',
    durationMinutes: 30,
    ...p,
    type: 'mosque',
  }));
}

export async function suggestHalalGuide(destination) {
  const prompt = `You are an expert on halal travel. Provide a brief halal travel guide for ${destination}.

Return ONLY JSON with no other text or markdown:
{
  "overview": "2-3 sentences on overall halal-friendliness and Muslim-friendliness of the destination",
  "food": "2-3 sentences on halal food availability, common cuisines, and what to watch out for",
  "dress": "1-2 sentences on dress norms and expectations for Muslim travellers"
}`;

  const text = await callGemini(prompt);
  return parseJSON(text);
}

// date: 'YYYY-MM-DD' (HTML date input format), converted to DD-MM-YYYY for Aladhan
// method: Aladhan calculation method number (default 2 = ISNA)
export async function fetchPrayerTimes(destination, date = null, method = 2) {
  const city = destination.split(',')[0].trim();
  const params = `?city=${encodeURIComponent(city)}&country=&method=${method}`;
  let aladhanDate = null;
  if (date) {
    const [y, m, d] = date.split('-');
    aladhanDate = `${d}-${m}-${y}`;
  }
  const url = aladhanDate
    ? `https://api.aladhan.com/v1/timingsByCity/${aladhanDate}${params}`
    : `https://api.aladhan.com/v1/timingsByCity${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Prayer times API error ${res.status}`);
  const data = await res.json();
  const t = data?.data?.timings;
  if (!t) throw new Error('No prayer times returned');
  return {
    Fajr:    t.Fajr,
    Dhuhr:   t.Dhuhr,
    Asr:     t.Asr,
    Maghrib: t.Maghrib,
    Isha:    t.Isha,
  };
}
