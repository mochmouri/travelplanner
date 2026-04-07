import { getApiKey } from './storage.js';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

async function callClaude(prompt) {
  const apiKey = getApiKey('claude');
  if (!apiKey) throw new Error('NO_KEY');

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

function parseJSON(text) {
  // Extract JSON from a markdown code block or raw text
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[1]);
}

export async function suggestAttractions(destination, numDays, focus) {
  const focusDesc = {
    balanced: 'a good balance of landmarks, history, culture, and local experiences',
    museums: 'museums, galleries, and cultural institutions',
    history: 'historical sites, old quarters, and heritage landmarks',
    nature: 'parks, nature reserves, hikes, viewpoints, and outdoor activities',
    fun: 'fun, lively, and unique experiences including markets, viewpoints, street scenes',
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
    "durationMinutes": number (realistic visit time, e.g. 60-180)
  }
]

Include 12-18 places total. Mix iconic landmarks with lesser-known gems. Vary types across the ${focus} focus. Use accurate coordinates.`;

  const text = await callClaude(prompt);
  const places = parseJSON(text);
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
    "notes": "brief note on halal status e.g. 'fully halal certified' or 'halal menu available'"
  }
]

Include 8-10 restaurants. Prioritise well-established places with strong reputations (equivalent to 4.5+ stars, 1000+ reviews). Only include genuinely halal options. Use accurate coordinates.`;

  const text = await callClaude(prompt);
  const places = parseJSON(text);
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

  const prompt = `For a trip to ${destination}, the daily itinerary clusters are centred at these coordinates:
${centroidDesc}

Suggest 2-3 neighbourhoods to stay in that minimise daily travel across all days. Return ONLY JSON:
{
  "neighbourhoods": [
    {
      "name": "neighbourhood name",
      "why": "1-2 sentences on why it's a good base given the itinerary"
    }
  ]
}`;

  const text = await callClaude(prompt);
  return parseJSON(text);
}

export async function geocodePlace(name, destination) {
  const prompt = `What are the approximate GPS coordinates of "${name}" in ${destination}? Return ONLY JSON: {"lat": number, "lng": number}`;
  const text = await callClaude(prompt);
  return parseJSON(text);
}
