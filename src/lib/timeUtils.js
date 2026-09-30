export function parseTime(t) {
  if (!t) return null;
  const parts = String(t).split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function formatTime(mins) {
  if (mins == null || isNaN(mins)) return '--:--';
  mins = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutes(time, mins) {
  const base = parseTime(time);
  if (base == null) return null;
  return formatTime(base + mins);
}