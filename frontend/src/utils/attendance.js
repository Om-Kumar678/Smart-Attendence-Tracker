const includedStatuses = new Set(['present', 'late', 'absent']);

export function attendancePercentage(records) {
  const counted = records.filter((record) => includedStatuses.has(String(record.status).toLowerCase()));
  if (!counted.length) return null;
  const attended = counted.filter((record) => ['present', 'late'].includes(String(record.status).toLowerCase())).length;
  return Math.round((attended / counted.length) * 100);
}

export function groupAttendance(records, field) {
  const groups = new Map();
  for (const record of records) {
    const key = record[field] || 'Unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return [...groups].map(([name, entries]) => ({
    name,
    records: entries,
    rate: attendancePercentage(entries),
  }));
}

export function attendanceTrend(records) {
  const groups = new Map();
  for (const record of records) {
    if (!record.date) continue;
    if (!groups.has(record.date)) groups.set(record.date, []);
    groups.get(record.date).push(record);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, entries]) => ({
      month: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      day: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      rate: attendancePercentage(entries) ?? 0,
    }));
}

export function classesNeededForTarget(present, total, target = 75) {
  if (!total || present / total >= target / 100) return 0;
  return Math.ceil(((target / 100) * total - present) / (1 - target / 100));
}
