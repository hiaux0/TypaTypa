export function getRandoNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @example
 * ```ts
 * const result = getRandomWordsFromSetAndRemove(new Set(["a", "b", "c", "d", "e"]), 3);
 * result.remaining => ["a", "c"]
 * result.chosen => ["b", "d", "e"]
 * ```
 */
export function getRandomWordsFromSetAndRemove(
  input: Set<string>,
  amount: number,
): { chosen: Set<string>; remaining: Set<string> } {
  const remaining = new Set<string>(input);
  const remainingArr = Array.from(remaining);
  const chosen = new Set<string>();
  const finalAmount = Math.min(amount, input.size);
  while (chosen.size < finalAmount) {
    const rndIndex = getRandoNumber(0, input.size - 1);
    const word = remainingArr[rndIndex];
    if (chosen.has(word)) continue;
    chosen.add(word);
    remaining.delete(word);
  }
  return { chosen, remaining };
}
