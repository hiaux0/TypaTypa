/**
 * cycleRInRange(0, 10, 9); // 9
 * cycleRInRange(0, 10, 10); // 10
 * cycleRInRange(0, 10, 11); // 0
 * cycleRInRange(0, 10, 12); // 1
 * cycleRInRange(1, 3, 3); // 3
 * cycleRInRange(1, 3, 4); // 1
 */
export function cycleInRange(start: number, end: number, given: number): number {
  let range = end - start;
  let calced = (given - start) % range;
  if (calced < 0) {
    calced = range + calced;
  }
  const result = calced + start;
  return result;
}
