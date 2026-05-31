export function formatDateISO(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

export function formatDuration(seconds) {
  const s = Number(seconds);
  if (Number.isNaN(s) || s <= 0) return '—';
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${m}m ${rem}s`;
}

export function round2(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100) / 100;
}

