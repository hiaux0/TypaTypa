const UNTIL_CHARS = [" ", "\n", "\t"];
/**
 * getWordAtIndex("012 4567", 1) => "012"
 * getWordAtIndex("012 4567", 2) => "012"
 * getWordAtIndex("012 4567", 4) => "4567"
 */
export function getWordAtIndex(
  input: string,
  index: number,
  untilChars = UNTIL_CHARS,
): string | undefined {
  let current = input[index];
  if (!current) return;
  if (untilChars.includes(current)) return;

  let startIndex = getIndexBackwardsUntil(input, index, untilChars);
  let endIndex = getIndexForwardUntil(input, index, untilChars);
  const word = input.slice(startIndex, endIndex + 1);
  return word;
}

export function findLongest(input: string[]): string {
  if (input.length === 0) return "";
  let longest = "";
  for (const item of input) {
    if (item.length > longest.length) {
      longest = item;
    }
  }
  return longest;
}

function getIndexBackwardsUntil(
  input: string,
  index: number,
  untilChars: string[],
): number {
  let startIndex = 0;
  for (let i = index; i >= 0; i--) {
    let char = input[i];
    if (untilChars.includes(char)) {
      break;
    }
    startIndex = i;
  }
  return startIndex;
}

export function getIndexForwardUntil(
  input: string,
  index: number,
  untilChars = UNTIL_CHARS,
): number {
  let endIndex = 0;
  for (let i = index; i < input.length; i++) {
    let char = input[i];
    if (untilChars.includes(char)) {
      break;
    }
    endIndex = i;
  }
  return endIndex;
}

export function getValueFromPixelString(input: string): number {
  if (!input) return 0;
  const value = parseInt(input.replace("px", ""));
  if (Number.isNaN(value)) return 0;
  return value;
}

/**
 * 1. no special chars
 * 2. all lower case
 * @example
 * ```ts
 * const inputText = "Hello, world! This is a test.";
 * const tokens = tokenize(inputText);
 * console.log(tokens); // ["Hello", "world", "This", "is", "a", "test"]
 * ```
 */
export function tokenize(text: string, option?: { lower?: boolean }): string[] {
  const rawTokens = text.match(
    /[a-zA-ZAaĂăÂâEeÊêIiOoÔôƠơUuƯưYyÁáẮắẤấÉéẾếÍíÓóỐốỚớÚúỨứÝýÀàẰằẦầÈèỀềÌìÒòỒồỜờÙùỪừỲỳẢảẲẳẨẩẺẻỂểỈỉỎỏỔổỞởỦủỬửỶỷÃãẴẵẪẫẼẽỄễĨĩÕõỖỗỠỡŨũỮữỸỹẠạẶặẬậẸẹỆệỊịỌọỘộỢợỤụỰựỴỵĐđ]+/g,
  );
  if (!rawTokens) return [];
  let tokens = rawTokens as string[];
  if (option.lower) {
    tokens = rawTokens.map((token) => token.toLowerCase());
  }
  return tokens;
}

export function numberToAlphabet(num: number) {
  return String.fromCharCode(65 + num);
}

/**
 * input: ["hello", "helmet"]
 * getLongestCommonSubstring(input) => "hel"
 */
export function getLongestCommonSubstring(
  strings: string[],
  input?: string,
): string {
  const sorted = strings.concat().sort();
  if (sorted.length === 0) return "";
  const a1 = sorted[0];
  const a2 = sorted[sorted.length - 1];
  const L = a1.length;
  let i = 0;
  while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
  if (i === 0) {
    const filtered = strings.filter((s) => s.startsWith(input));
    return filtered[0] ?? "";
  }
  const result = a1.substring(0, i) ?? "";
  return result;
}

//const output = getLongestCommonSubstring(["hello", "helmet", "hero"]); // "he"
//const output1 = getLongestCommonSubstring(["hello", "helmet", "hero"]); // "he"
//const output11 = getLongestCommonSubstring(["hello", "helmet"]); // "hel"
// const output2 = getLongestCommonSubstring(["10", "01"]); // ""
// const output21 = getLongestCommonSubstring(["10", "01"], "1"); // "10"
// const output22 = getLongestCommonSubstring(["00", "01"], "0"); // "hel"
// /*prettier-ignore*/ console.log("[strings.ts,128] output22: ", output22);

/**
 * Spit by period, but keep period in output
 */
export function splitByEndingAndSeparator(input: string): string[] {
  if (
    input.startsWith("http") ||
    input.startsWith("www") ||
    input.startsWith("https")
  ) {
    return [input];
  }

  const byNewLine = input.split("\n");
  const splitByEndingSign = byNewLine.flatMap((sentence) => {
    // split by period, question mark, exclamation mark
    // but keep the ending sign
    // also keep numbering, like "1.", or "1.1"
    return sentence.split(/(?<=\D[.!?])/);
    // return sentence.split(/(?<=[.!?])\s+(?<!(?!\D|$))/);
    // return sentence.split(/(?<=[.!?])\s+(?=\D|$)/);
    // return sentence.split(/(?<=[.!?])/);
    // return sentence.split(/(?<!\d[.])(?=[.!?])/)
    // return sentence.split(/(?<=[^.?!])(?<!\d[.!?])(?=[.!?])/);
    // return sentence.split(/(?<=[.!?])\s+(?=\D)/);
    // return sentence.split(/(?<=[.!?])\s+(?=\D)/);
    // return sentence.split(/(?<=[.!?])\s+(?=(?!\d))/);
  });
  const splitBySeparator = splitByEndingSign.flatMap((sentence) => {
    return sentence.split(/(?<=[,;:])/);
  });
  const trimmed = splitBySeparator.flatMap((sentence) => sentence.trim());
  return trimmed;
}
//const result = splitByEndingAndSeparator("Hello world. 1. This is great. Next time.");
///*prettier-ignore*/ console.log("[strings.ts,134] result: ", result);
