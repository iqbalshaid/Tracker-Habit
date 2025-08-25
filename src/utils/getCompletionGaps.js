import getDayGap from './getDayGap';

/**
 * Returns the gaps (in days) between consecutive completed days.
 *
 * @param {Array<{ date: Date|string|number, progress?: number, completed?: boolean }>} completedDays
 * @param {number} frequency - Frequency threshold for completion (optional)
 * @returns {number[]} - Array of gap days
 */
function getCompletionGaps(completedDays, frequency = 1) {
  const gaps = [];

  if (!Array.isArray(completedDays) || completedDays.length < 2) return gaps;

  // Remove first day if not completed enough
  if (completedDays[0]?.progress < frequency) {
    completedDays = completedDays.slice(1);
  }

  for (let i = 0; i < completedDays.length - 1; i++) {
    const dayOne = completedDays[i]?.date;
    const dayTwo = completedDays[i + 1]?.date;

    if (!dayOne || !dayTwo) continue; // skip invalid

    const gap = getDayGap(dayOne, dayTwo);
    if (gap) gaps.push(gap);
  }

  return gaps;
}

export default getCompletionGaps;
