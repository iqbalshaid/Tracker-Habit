/**
 * Calculates the number of full days between two Date objects,
 * excluding the start and end days.
 *
 * @param {Date|string|number} dateObj1 - The first date (Date object, ISO string, or timestamp).
 * @param {Date|string|number} dateObj2 - The second date.
 * @returns {number} - The number of full days between the two dates, excluding the start and end days.
 *                     Returns 0 if either argument is invalid.
 */
function getDayGap(dateObj1, dateObj2) {
  const d1 = new Date(dateObj1);
  const d2 = new Date(dateObj2);

  if (isNaN(d1) || isNaN(d2)) {
    console.error('Both arguments must be valid dates. Returning 0.');
    return 0;
  }

  const oneDay = 86_400_000; // milliseconds in one day
  return Math.max(0, Math.abs(d1 - d2) / oneDay - 1);
}

export default getDayGap;
