function timeToMinutes(t) {
  if (!t) return NaN;
  const [hh, mm] = t.split(':').map(Number);
  return hh * 60 + mm;
}

function minutesToTime(m) {
  const mm = Math.floor(m % 60);
  const hh = Math.floor((m - mm) / 60) % 24;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function calculatePrice(distanceKm) {
  return +(distanceKm * 1.25).toFixed(2);
}

module.exports = { timeToMinutes, minutesToTime, calculatePrice };
