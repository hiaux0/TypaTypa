export class StringUtil {
  static indexOfBack(input: string, target: string): number {
    let targetCharacterIndex = -1;
    for (
      let characterIndex = input.length - 1;
      characterIndex >= 0;
      characterIndex -= 1
    ) {
      if (input[characterIndex] === target) {
        targetCharacterIndex = characterIndex;
        break;
      }
    }

    return targetCharacterIndex;
  }

  static getLeadingWhitespaceNum(text: string): number {
    const whiteSpaceAtStartIndex = /\S/g.exec(text);
    let numOfWhiteSpaceAtStart = text.length;
    if (whiteSpaceAtStartIndex !== null) {
      numOfWhiteSpaceAtStart = whiteSpaceAtStartIndex.index;
    }
    return numOfWhiteSpaceAtStart;
  }

  static insert = insert;
  static replaceAt = replaceAt;
  static replaceRange = replaceRange;
  static getFirstNonWhiteSpaceCharIndex = getFirstNonWhiteSpaceCharIndex;

  // static getIndentation(): number {
  //   const { indentSize } = this.vimOptions;
  //   const text = this.vimState.getActiveLine();

  //   const stagedSubText = text.substring(0, indentSize);
  //   const whiteSpaceAtStartIndex = /\w/g.exec(stagedSubText);
  //   let numOfWhiteSpaceAtStart = stagedSubText.length;
  //   if (whiteSpaceAtStartIndex !== null) {
  //     numOfWhiteSpaceAtStart = whiteSpaceAtStartIndex.index;
  //   }

  //   const updatedInput = text.substring(numOfWhiteSpaceAtStart);
  //   this.vimState.updateActiveLine(updatedInput);
  //   this.vimState.cursor.col -= numOfWhiteSpaceAtStart;
  //   this.vimState.lines[this.vimState.cursor.line] = updatedInput;
  //   this.reTokenizeInput(updatedInput);

  //   return this.vimState;
  // }

  public static matchWords(inputString: string): string[] {
    // return inputString.match(/[a-zA-Z]+/g) || [];
    return inputString.match(/[\p{L}]+/gu) || []; // also matches unicode
  }
}

export function insert(str: string, index: number, value: string): string {
  const ind = index < 0 ? str.length + index : index;
  return str.substr(0, ind) + value + str.substr(ind);
}

// const input = '0123456';
// input.length; /* ? */
// const result = insert(input, 0, ' '); /* ? */
// result.length; /* ? */

/**
 * @example
 *   const input = '0123456';
 *   replaceAt(input, 4) // 012356
 */
export function replaceAt(input: string, index: number, char: string) {
  if (index < 0) {
    return input;
  }
  return replaceRange(input, index, index, char);
}

/**
 * @example
 *   const input = '0123456';
 *   replaceRange(input, 2, 4)         // 0156
 *   replaceRange(input, 2, 4, 'x')    // 01x56
 *   replaceRange(input, 2, 4, 'what') // 01what56
 */
export function replaceRange(
  input: string,
  start: number,
  end: number,
  replace = "",
) {
  if (replace === "") {
    return input.slice(0, start) + input.substring(end + 1 + replace.length);
  } else {
    return (
      input.substring(0, start) +
      replace +
      input.substring(end + 1, input.length)
    );
  }
}

/**
 * @param {string} input
 *
 * @example
 * input // what i t
 * padWithRegexWildCard(input) // w.*h.*a.*t.* .*i.* .*t.*
 */
function padWithRegexWildCard(input: string) {
  /** TODO SUPPORT FOR ? */
  // const edgeCaseList = ['?'];

  const splitByChar = input.split("");
  const withWildCard = splitByChar.join(".*");
  return `${withWildCard}.*`;
}

/**
 * @example
 * inputList ['foo', 'faz', 'flo']
 * value 'fo'
 * --> ['foo', 'flo']
 */
export function fuzzySearch(inputList: string[], value: string): string[] {
  const wildCardValue = padWithRegexWildCard(value);
  const fileredList = inputList.filter((input) => {
    const ignoreCase = input.toLowerCase();
    const searchRegex = new RegExp(`${wildCardValue}`);
    return searchRegex.exec(ignoreCase);
  });
  return fileredList;
}

/**
 * @example
 * inputList = ['foo', 'for', 'faz', 'flo', 'z']
 *
 * ## Example 1
 * value = 'fo'
 * --> ['foo', 'for']
 *
 * ## Example 2
 * value = 'z'
 * --> ['z']
 */
export function filterListByCharSequence(inputList: string[], value: string) {
  const result = inputList.filter((input) => {
    return inputContainsSequence(input, value);
  });

  return result;
}

/**
 * @example
 *
 * ## Example 1
 * input = 'foo'
 * value = 'fo'
 * --> false
 *
 * ## Example 2
 * input = 'z'
 * value = 'z'
 * --> true
 */
export function inputContainsSequence(
  input: string | undefined,
  sequence: string,
): boolean {
  const regex = new RegExp(`^${escapeRegex(sequence)}`);
  if (!input) return false;
  const execedRegex = regex.exec(input);

  if (Array.isArray(execedRegex)) {
    const hasMatch = !!execedRegex[0];
    return hasMatch;
  }

  const result = execedRegex !== null;
  return result;
}

function escapeRegex(string: string) {
  // eslint-disable-next-line no-useless-escape
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * @example
 * 'foo'     -> 0
 * ' foo'    -> 1
 * '    foo' -> 4
 */
export function getFirstNonWhiteSpaceCharIndex(input: string): number {
  if (!input.startsWith(" ")) return 0;
  if (input.length === 0) return 0;

  const nonWhiteSpaceRegexp = /\S/g;
  const result = nonWhiteSpaceRegexp.exec(input);
  if (!result) return 0;

  const { index } = result;

  return index;
}
