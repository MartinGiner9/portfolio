// Utility functions to parse periods and compute durations (years + months)
const monthMap: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};

export function parseMonthYear(str: string | undefined | null): Date | null {
  if (!str) return null;
  str = String(str).trim();
  const iso = str.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (iso) {
    const y = parseInt(iso[1], 10);
    const m = iso[2] ? parseInt(iso[2], 10) - 1 : 0;
    const d = iso[3] ? parseInt(iso[3], 10) : 1;
    return new Date(y, m, d);
  }

  const mRegex = /([A-Za-zñÑáéíóúÁÉÍÓÚ.]+)\s*(?:\.|)\s*(\d{4})/i;
  const mMatch = str.match(mRegex);
  if (mMatch) {
    let mon = mMatch[1].toLowerCase();
    mon = mon.replace(/\./g, '');
    const key = mon.slice(0, 3);
    const month = monthMap[key] !== undefined ? monthMap[key] : null;
    const year = parseInt(mMatch[2], 10);
    if (month !== null) return new Date(year, month, 1);
    return new Date(year, 0, 1);
  }

  const yMatch = str.match(/^(\d{4})$/);
  if (yMatch) return new Date(parseInt(yMatch[1], 10), 0, 1);
  return null;
}

export function parsePeriodDates(periodStr: string | undefined | null): [Date | null, Date | null] {
  if (!periodStr) return [null, null];
  const parts = periodStr.split('-').map((p) => p.trim());
  if (parts.length === 1) {
    const start = parseMonthYear(parts[0]);
    return [start, null];
  }
  const start = parseMonthYear(parts[0]);
  const endPart = parts.slice(1).join('-').trim().toLowerCase();
  if (endPart.includes('actual') || endPart.includes('presente')) {
    return [start, new Date()];
  }
  const end = parseMonthYear(endPart);
  return [start, end];
}

export function calcYearsMonths(start: Date | null, end?: Date | null) {
  if (!start) return null;
  const s = new Date(start.getFullYear(), start.getMonth(), 1);
  const e = end ? new Date(end.getFullYear(), end.getMonth(), 1) : new Date();
  let totalMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (totalMonths < 0) totalMonths = 0;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months };
}

export function formatDurationFromDates(start: Date | null, end?: Date | null): string {
  const obj = calcYearsMonths(start, end);
  if (!obj) return '';
  const { years, months } = obj;
  if (years > 0 && months > 0)
    return `${years} año${years > 1 ? 's' : ''} ${months} mes${months > 1 ? 'es' : ''}`;
  if (years > 0) return `${years} año${years > 1 ? 's' : ''}`;
  if (months > 0) return `${months} mes${months > 1 ? 'es' : ''}`;
  return 'menos de 1 mes';
}

export function getRoleDuration(role: any): string {
  if (!role) return '';
  if (role.duration) return role.duration;
  const start = role.startDate ? new Date(role.startDate) : null;
  let end = role.endDate ? new Date(role.endDate) : null;
  if (role.current || role.actualidad || /actual/i.test(role.period || '')) end = new Date();
  if (!start) {
    const [pStart, pEnd] = parsePeriodDates(role.period || '');
    if (pStart) {
      if (!end && pEnd) end = pEnd;
      return formatDurationFromDates(pStart, end);
    }
    return role.duration || '';
  }
  return formatDurationFromDates(start, end);
}

export function getEntryDuration(entry: any): string {
  if (!entry) return '';
  if (entry.duration) return entry.duration;
  const start = entry.startDate ? new Date(entry.startDate) : null;
  let end = entry.endDate ? new Date(entry.endDate) : null;
  if (entry.current || entry.actualidad || /actual/i.test(entry.period || '')) end = new Date();
  if (!start) {
    const [pStart, pEnd] = parsePeriodDates(entry.period || '');
    if (pStart) {
      if (!end && pEnd) end = pEnd;
      return formatDurationFromDates(pStart, end);
    }
    return '';
  }
  return formatDurationFromDates(start, end);
}
