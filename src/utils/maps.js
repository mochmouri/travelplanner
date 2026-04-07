// CartoDB Dark Matter tiles — free, no API key, permanent
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Per-day marker colours (monochrome: white for day 1, then greys)
const DAY_COLORS = ['#ffffff', '#cccccc', '#999999', '#777777', '#bbbbbb', '#dddddd', '#eeeeee'];

export function getDayColor(day) {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}
