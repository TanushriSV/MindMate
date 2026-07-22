import { MoodEntry } from '../types';

export function computeStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  
  // Get unique YYYY-MM-DD strings for all entries
  const datesSet = new Set<string>();
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    datesSet.add(`${year}-${month}-${day}`);
  });

  let streak = 0;
  const today = new Date();
  
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkDate = new Date(today);
  const todayStr = formatDate(checkDate);

  // If today doesn't have an entry, check if yesterday has one
  if (!datesSet.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = formatDate(checkDate);
    if (!datesSet.has(yesterdayStr)) {
      return 0; // neither today nor yesterday, streak is broken
    }
  }

  // Count backwards
  while (true) {
    const checkStr = formatDate(checkDate);
    if (datesSet.has(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
