import getFormattedDate from './getFormattedDate';
import removeIncompleteFirstDay from './removeIncompleteFirstDay';

/**
 * Calculates the current streak, longest streak, and all streaks
 * based on completed days.
 *
 * @param {Array<{ date: Date|string, completed: boolean }>} completedDays
 * @param {number|string} frequency
 * @returns {{ currentStreak: number, longestStreak: number, allStreaks: Array<{ length: number, start: string, end: string }> }}
 */
function getStreaks(completedDays, frequency) {
  // ✅ Defensive: ensure completedDays is always an array
  if (!Array.isArray(completedDays)) {
    completedDays = [];
  }

  // DEFENSIVE FREQUENCY HANDLING
  let normalizedFrequency = 1;
  if (typeof frequency === 'number' && !isNaN(frequency)) {
    normalizedFrequency = Math.max(1, Math.min(7, Math.floor(frequency)));
  } else if (typeof frequency === 'string') {
    const num = parseInt(frequency, 10);
    normalizedFrequency = isNaN(num) ? 1 : Math.max(1, Math.min(7, num));
  }

  // Remove incomplete first day if needed
  completedDays = removeIncompleteFirstDay(completedDays, normalizedFrequency);

  // Filter out only completed entries
  const completedOnly = completedDays
    .filter(cd => cd.completed)
    .map(cd => ({ date: new Date(cd.date) })); // normalize dates

  if (completedOnly.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] };
  }

  // Sort by date ascending
  completedOnly.sort((a, b) => new Date(a.date) - new Date(b.date));

  const oneDay = 24 * 60 * 60 * 1000;
  const allStreaks = [];
  let currentSeries = 1;
  let streakStart = completedOnly[0].date;

  for (let i = 0; i < completedOnly.length - 1; i++) {
    const dayOne = new Date(completedOnly[i].date);
    const dayTwo = new Date(completedOnly[i + 1].date);

    const diff = (dayTwo - dayOne) / oneDay;

    if (diff === 1) {
      currentSeries++;
    } else {
      allStreaks.push({
        length: currentSeries,
        start: getFormattedDate(streakStart),
        end: getFormattedDate(dayOne)
      });
      currentSeries = 1;
      streakStart = dayTwo;
    }
  }

  // Push the last streak
  const lastDay = new Date(completedOnly[completedOnly.length - 1].date);
  allStreaks.push({
    length: currentSeries,
    start: getFormattedDate(streakStart),
    end: getFormattedDate(lastDay)
  });

  const today = new Date(getFormattedDate(new Date()));
  const mostRecentDay = lastDay;

  return {
    allStreaks,
    longestStreak: Math.max(...allStreaks.map(s => s.length)),
    currentStreak: (today - mostRecentDay) / oneDay > 1 ? 0 : allStreaks[allStreaks.length - 1].length
  };
}

export default getStreaks;
