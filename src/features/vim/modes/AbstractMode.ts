import { Logger } from "../../../common/logging/logging";
import {
  ArrayUtils,
  ThreeSplitType,
} from "../../../common/modules/array/array-utils";
import { SPACE } from "../../../common/modules/keybindings/app-keys";
import {
  getFirstNonWhiteSpaceCharIndex,
  replaceAt,
  StringUtil,
} from "../../../common/modules/string/string";
import { keyBindings } from "../key-bindings";
import { toggleFold } from "./features/folding";
import { VimStateClass } from "../vim-state";
import { VimLine, VimMode, VimOptions, IVimState } from "../vim-types";
import { CRUDService } from "../../../common/services/CRUDService";
import { specialCharsSet } from "../../../common/modules/constants";

const l = new Logger("AbstractMode");

const deleteLineRegister = "*";

export const defaultVimOptions: VimOptions = {
  keyBindings: keyBindings,
  leader: SPACE,
  indentSize: 4,
};

export interface TokenizedString {
  string: string;
  start: number;
  end: number;
  index: number;
}

export abstract class AbstractMode {
  protected vimStateClass: VimStateClass;
  /** TODO: remove for vimStateClass */
  protected vimState: VimStateClass;
  vimOptions = defaultVimOptions;

  constructor(vimState?: IVimState) {
    if (!vimState) return;
    this.vimState = new VimStateClass(vimState);
    this.vimStateClass = this.vimState;
  }

  public setVimState(vimState: IVimState): void {
    this.vimState = VimStateClass.create(vimState.cursor, vimState.lines);
  }

  public executeCommand(
    vimState: IVimState,
    commandName: string,
    inputForCommand: string,
  ): IVimState | undefined {
    this.vimStateClass = new VimStateClass(vimState);
    this.vimState = this.vimStateClass;
    // @ts-ignore
    const interim = this[commandName](inputForCommand) as VimStateClass;

    if (!interim) return;

    const result = structuredClone(interim.serialize());
    return result;
  }

  public commandExists(commandName: string): boolean {
    // @ts-ignore
    const result = !!this[commandName];
    return result;
  }

  public cursorRight(): VimStateClass {
    const result = this.moveRight(1);
    return result;
  }

  public cursorLeft(): VimStateClass {
    if (!this.vimStateClass.cursor) return this.vimStateClass;

    const updaterCursorCol = this.vimStateClass.cursor.col - 1;
    const activeLine = this.vimStateClass.getActiveLine();
    if (!activeLine) return this.vimStateClass;
    if (!isValidHorizontalPosition(updaterCursorCol + 1, activeLine.text)) {
      return this.vimStateClass;
    }

    this.setCursorCol(updaterCursorCol);
    return this.vimStateClass;
  }
  cursorUp(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    if (!this.vimState.lines) return this.vimState;

    const newCurLine = this.vimState.cursor.line - 1;
    const isValidVertical = isValidVerticalPosition(
      newCurLine + 1,
      this.vimState.lines,
    );

    if (!isValidVertical) {
      return this.vimState;
    }
    if (!this.vimState.lines) return this.vimState;

    const newActiveLine = this.vimState.lines[newCurLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine?.text,
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.setCursorCol(Math.max(newActiveLine?.text?.length - 1, 0));
    }

    const newActiveText = this.vimState.lines[newCurLine];

    // this.vimState.updateActiveLine(newActiveText);
    this.setCursorLine(newCurLine);
    this.reTokenizeInput(newActiveText?.text);

    return this.vimState;
  }
  cursorDown(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    if (!this.vimState.lines) return this.vimState;

    const unadjustedNewCusorLine = this.vimState.cursor.line + 1;
    const adjustedCursorLine = this.getAdjustedCursorLineWithFoldmap(
      unadjustedNewCusorLine,
    );
    const isValidVertical = isValidVerticalPosition(
      adjustedCursorLine + 1,
      this.vimState.lines,
    );

    if (!isValidVertical) {
      return this.vimState;
    }
    if (!this.vimState.lines) return this.vimState;

    const newActiveLine = this.vimState.lines[adjustedCursorLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine?.text,
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.setCursorCol(Math.max(newActiveLine?.text?.length - 1, 0));
    }

    const newActiveText = this.vimState.lines[adjustedCursorLine];

    this.setCursorLine(adjustedCursorLine);
    this.reTokenizeInput(newActiveText?.text);

    return this.vimState;
  }
  cursorWordForwardEnd(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const tokenUnderCursor = this.getTokenUnderCursor();

    const line = this.vimState.getActiveLine();
    const isAtEndOfLine = this.vimState.cursor.col === line.text.length - 1;
    const nextCursorLine = this.vimState.getNextCursorLine();
    const isLineBelow = nextCursorLine > this.vimState.cursor.line;
    const shouldGoToNextLine = isAtEndOfLine && isLineBelow;
    const isAtEndOfWord = tokenUnderCursor?.end === this.vimState.cursor.col;
    const isNotAtEnd = tokenUnderCursor === undefined;

    let resultCol: number;
    if (shouldGoToNextLine) {
      const nextLine = this.vimState.getLineAt(nextCursorLine);
      const tokenizedInput = this.reTokenizeInput(nextLine.text);
      const nextToken = tokenizedInput[0];
      resultCol = nextToken?.end;
      this.setCursorLine(nextCursorLine);
    } else if (isAtEndOfWord) {
      const nextToken = this.getTokenAtIndex(tokenUnderCursor.index + 1);
      if (nextToken) resultCol = nextToken?.end;
    } else if (isNotAtEnd) {
      const nextToken = this.getNexToken();
      if (!nextToken) return this.vimState;
      resultCol = nextToken?.end;
    } else {
      resultCol = tokenUnderCursor.end;
    }

    // @ts-ignore
    if (resultCol) {
      this.setCursorCol(resultCol);
    }

    return this.vimState;
  }
  cursorWordForwardStart(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const nextToken = this.getNexToken();

    const { col } = this.vimState.cursor;
    const line = this.vimState.getActiveLine();
    const isAtEndOfLine = this.vimState.cursor.col === line.text.length - 1;
    const nextCursorLine = this.vimState.getNextCursorLine();
    const isNextLineBelow = nextCursorLine > this.vimState.cursor.line;
    const shouldGoToNextLine = isAtEndOfLine && isNextLineBelow;
    const isAtEndOfWord = nextToken?.end === col;
    const isAtLastWord = nextToken.start <= col && col < nextToken.end;
    const isNotAtEnd = nextToken === undefined;

    let resultCol: number;
    if (shouldGoToNextLine) {
      const nextLine = this.vimState.getLineAt(nextCursorLine);
      const tokenizedInput = this.reTokenizeInput(nextLine.text);
      const nextToken = tokenizedInput[0];
      resultCol = nextToken?.start;
      this.setCursorLine(nextCursorLine);
    } else if (isAtEndOfWord) {
      const nextNextToken = this.getTokenAtIndex(nextToken.index + 1);
      if (nextNextToken) resultCol = nextNextToken?.end;
    } else if (isAtLastWord) {
      resultCol = nextToken.end;
    } else if (isNotAtEnd) {
      const nextToken = this.getNexToken();
      if (nextToken) resultCol = nextToken?.end;
    } else {
      resultCol = nextToken.start;
    }

    if (resultCol != null) {
      this.setCursorCol(resultCol);
    }

    return this.vimState;
  }
  cursorBackwordsStartWord(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    let tokenUnderCursor = this.getTokenUnderCursor();
    if (!tokenUnderCursor) {
      tokenUnderCursor = this.getPreviousToken();
    }
    if (!tokenUnderCursor) return this.vimState;

    const activeLine = this.vimState.getActiveLine();
    const [firstToken] = this.reTokenizeInput(activeLine.text);
    const { col, line } = this.vimState.cursor;
    const isAtStart = col === firstToken?.start;
    const prevCursorLine = this.vimState.getPreviousCursorLine();
    const isPrevious = prevCursorLine < line;
    const shouldGoToPreviousLine = isAtStart && isPrevious;
    shouldGoToPreviousLine; /*?*/
    const isAtStartOfWord =
      tokenUnderCursor?.start === this.vimState.cursor.col;
    const tokenNotUnderCursor = tokenUnderCursor === undefined;

    let resultCol: number;
    if (shouldGoToPreviousLine) {
      const previousLine = this.vimState.getLineAt(prevCursorLine);
      const tokenizedInput = this.reTokenizeInput(previousLine.text);
      const lastToken = tokenizedInput[tokenizedInput.length - 1];
      resultCol = lastToken?.start;
      this.setCursorLine(prevCursorLine);
    } else if (isAtStartOfWord) {
      const previousToken = this.getTokenAtIndex(tokenUnderCursor.index - 1);
      if (previousToken) resultCol = previousToken?.start;
    } else if (tokenNotUnderCursor) {
      const nextToken = this.getPreviousToken();
      if (nextToken) resultCol = nextToken?.start;
    } else {
      resultCol = tokenUnderCursor.start;
    }

    // @ts-ignore
    if (resultCol !== undefined) {
      this.setCursorCol(resultCol);
    }

    return this.vimState;
  }
  cursorLineEnd(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    this.setCursorCol(Math.max(activeLine.text.length - 1, 0));
    return this.vimState;
  }
  cursorLineStart(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const nonWhiteSpaceIndex = getFirstNonWhiteSpaceCharIndex(activeLine.text);

    this.setCursorCol(nonWhiteSpaceIndex);
    return this.vimState;
  }
  goToFirstLine(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    this.vimState.cursor.line = 0;
    return this.vimState;
  }
  goToLastLine(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    if (!this.vimState.lines) return this.vimState;

    this.vimState.cursor.line = this.vimState.lines.length;
    return this.vimState;
  }
  jumpNextBlock(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    let finalLine = NaN;
    const nextNonEmptyLineIndex = ArrayUtils.findIndexFromIndex(
      this.vimState.lines ?? [],
      this.vimState.cursor.line,
      (line) => {
        const isEmpty = line.text.trim() !== "";
        return isEmpty;
      },
    );
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,268] nextNonEmptyLineIndex: ", nextNonEmptyLineIndex);
    const amountOnEmptyLines =
      this.vimState.cursor.line - nextNonEmptyLineIndex + 1; // don't count starting line
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,277] amountOnEmptyLines: ", amountOnEmptyLines);
    let startingIndex;

    if (amountOnEmptyLines === 0) {
      startingIndex = this.vimState.cursor.line;
    } else {
      startingIndex = nextNonEmptyLineIndex + 1;
    }
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,283] startingIndex: ", startingIndex);

    const previousBlockIndex = ArrayUtils.findIndexFromIndex(
      this.vimState.lines ?? [],
      startingIndex,
      (line) => {
        const isEmpty = line.text.trim() === "";
        return isEmpty;
      },
    );
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,289] previousBlockIndex: ", previousBlockIndex);

    if (!this.vimState.lines) return this.vimState;
    finalLine = previousBlockIndex;
    if (previousBlockIndex === this.vimState.cursor.line) {
      /** When we go up, but find nothing, means we should go to very top */
      finalLine = this.vimState.lines.length - 1;
    } else if (previousBlockIndex >= 0) {
      finalLine = previousBlockIndex;
    }
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,300] finalLine: ", finalLine);

    this.setCursorLine(finalLine);

    return this.vimState;
  }
  jumpPreviousBlock(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    if (!this.vimState.lines) return this.vimState;
    let finalLine = NaN;
    const nextNonEmptyLineIndex = ArrayUtils.findIndexBackwardFromIndex(
      this.vimState.lines,
      this.vimState.cursor.line,
      (line) => {
        const isEmpty = line.text.trim() !== "";
        return isEmpty;
      },
    );
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,312] nextNonEmptyLineIndex: ", nextNonEmptyLineIndex);
    const amountOnEmptyLines =
      this.vimState.cursor.line - nextNonEmptyLineIndex - 1; // don't count starting line
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,321] amountOnEmptyLines: ", amountOnEmptyLines);
    let startingIndex;

    if (amountOnEmptyLines === 0) {
      startingIndex = this.vimState.cursor.line;
    } else {
      startingIndex = nextNonEmptyLineIndex - 1;
    }
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,327] startingIndex: ", startingIndex);

    const previousBlockIndex = ArrayUtils.findIndexBackwardFromIndex(
      this.vimState.lines,
      startingIndex,
      (line) => {
        const isEmpty = line.text.trim() === "";
        return isEmpty;
      },
    );
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,333] previousBlockIndex: ", previousBlockIndex);

    finalLine = previousBlockIndex;
    if (previousBlockIndex === this.vimState.cursor.line) {
      /** When we go up, but find nothing, means we should go to very top */
      finalLine = 0;
    } else if (previousBlockIndex >= 0) {
      finalLine = previousBlockIndex;
    }
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,343] finalLine: ", finalLine);

    this.setCursorLine(finalLine);

    return this.vimState;
  }
  toCharacterAtBack(commandInput: string): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const { cursor } = this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const text = activeLine.text;
    const currentTextFromStartToColumn = text.substring(0, cursor.col);
    const targetCharacterIndex = StringUtil.indexOfBack(
      currentTextFromStartToColumn,
      commandInput,
    );

    if (targetCharacterIndex > -1) {
      this.setCursorCol(targetCharacterIndex);
    }

    return this.vimState;
  }
  toCharacterAt(commandInput: string): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const { cursor } = this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const text = activeLine.text;
    const currentTextToEnd = text.substring(cursor.col + 1); // +1: next char
    const targetCharacterIndex = currentTextToEnd.indexOf(commandInput) + 1; // account for above +1

    if (targetCharacterIndex > -1) {
      const finalNewIndex = cursor.col + targetCharacterIndex; // before substring + target index
      this.setCursorCol(finalNewIndex);
    }

    return this.vimState;
  }
  toCharacterAfterBack(commandInput: string): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const { cursor } = this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const text = activeLine.text;
    const currentTextFromStartToColumn = text.substring(0, cursor.col);
    const targetCharacterIndex = StringUtil.indexOfBack(
      currentTextFromStartToColumn,
      commandInput,
    );

    if (targetCharacterIndex > -1) {
      this.setCursorCol(targetCharacterIndex + 1); // + 1 after char
    }

    return this.vimState;
  }
  toCharacterBefore(commandInput: string): VimStateClass {
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,459] toCharacterBefore: ", );
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.trace("toCharacterBefore(commandInput:", )
    if (!this.vimState.cursor) return this.vimState;
    const { cursor } = this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const text = activeLine.text;
    const currentTextToEnd = text.substring(cursor.col);
    const targetCharacterIndex = currentTextToEnd.indexOf(commandInput);
    if (targetCharacterIndex > 0) {
      // ^ -1: stay, 0: stay, cos at beginning
      const finalNewIndex = cursor.col + targetCharacterIndex - 1; // before substring + target index - before character
      this.setCursorCol(finalNewIndex);
    }

    return this.vimState;
  }

  public moveRight(amount: number): VimStateClass {
    if (!this.vimStateClass.cursor) return this.vimStateClass;
    const updaterCursorCol = this.vimStateClass.cursor.col + amount;
    const activeLine = this.vimStateClass.getActiveLine();

    if (!activeLine) return this.vimStateClass;

    const valid = isValidHorizontalPosition(
      updaterCursorCol + 1,
      activeLine.text,
    );

    if (!valid) {
      return this.vimStateClass;
    }

    this.setCursorCol(updaterCursorCol);

    return this.vimStateClass;
  }
  getTokenUnderCursor(line?: VimLine): TokenizedString | undefined {
    const activeLine = line ?? this.vimState.getActiveLine();
    if (!activeLine) return;
    const tokenizedInput = this.reTokenizeInput(activeLine.text);
    const targetToken = tokenizedInput?.find((input) => {
      if (!this.vimState.cursor) return;
      const curCol = this.vimState.cursor.col;
      const isUnderCursor = input.start <= curCol && curCol <= input.end;

      return isUnderCursor;
    });

    /* prettier-ignore */ l.culogger.debug(['Token under curor: %o', targetToken], { onlyVerbose: true, });

    return targetToken;
  }
  getTokenAtIndex(index: number, line?: VimLine): TokenizedString | undefined {
    const activeLine = line ?? this.vimState.getActiveLine();
    if (!activeLine) return;
    const tokenizedInput = this.reTokenizeInput(activeLine.text);
    if (!tokenizedInput) return;

    if (index < 0) {
      index = 0;
    } else if (index > tokenizedInput.length - 1) {
      index = tokenizedInput.length - 1;
    }

    const targetToken = tokenizedInput[index];

    return targetToken;
  }
  getNexToken(line?: VimLine): TokenizedString | undefined {
    const activeLine = line ?? this.vimState.getActiveLine();
    if (!activeLine) return;
    const tokenizedInput = this.reTokenizeInput(activeLine.text);
    if (!tokenizedInput) return;
    const currentToken = this.getTokenUnderCursor(line);

    let nextIndex = NaN;
    if (currentToken == null) {
      const nextToken = this.getNextTokenFromCusor(tokenizedInput);
      if (!nextToken) return;
      nextIndex = nextToken.index;
    } else {
      nextIndex = currentToken.index + 1;
    }

    const nextToken = tokenizedInput[nextIndex];

    if (nextToken == null) {
      return currentToken;
    }
    return nextToken;
  }
  private getNextTokenFromCusor(tokenizedInput: TokenizedString[] | undefined) {
    if (!this.vimState.cursor) return;
    if (!tokenizedInput) return;

    const currentCol = this.vimState.cursor.col;
    const maybeNext = tokenizedInput.find((input) => input.end >= currentCol);

    if (maybeNext == null) {
      return tokenizedInput[0];
    }

    return maybeNext;
  }
  getPreviousToken(): TokenizedString | undefined {
    if (!this.vimState.cursor) return;
    if (!this.vimState.lines) return;

    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return;
    const tokenizedInput = this.reTokenizeInput(activeLine.text);
    if (!tokenizedInput) return;
    const currentToken = this.getTokenUnderCursor();
    if (!currentToken) return;

    let previousIndex = 0;
    const curCol = this.vimState.cursor.col;
    for (let index = 0; index < tokenizedInput.length; index++) {
      const token = tokenizedInput[index];
      const previousToken = tokenizedInput[index - 1];
      if (!previousToken) continue;

      const isPrevious = curCol <= token.start && curCol >= previousToken.end;
      if (!isPrevious) continue;

      previousIndex = index - 1;
      break;
    }
    const previousToken = tokenizedInput[previousIndex];

    return previousToken;
  }

  indentRight(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const { indentSize } = this.vimOptions;
    if (!indentSize) return this.vimState;
    if (!this.vimState.lines) return this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const text = activeLine.text;

    const numOfWhiteSpaceAtStart = getNumOfWhiteSpaceAtStart(text);

    let newCol = this.vimState.cursor.col;
    if (numOfWhiteSpaceAtStart === this.vimState.cursor.col) {
      newCol = newCol + indentSize;
    }
    this.setCursorCol(newCol);

    const spaces = " ".repeat(indentSize);
    const updatedInput = `${spaces}${activeLine.text}`;

    this.vimState.updateActiveLine(updatedInput);
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }
  indentLeft(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    if (!this.vimState.lines) return this.vimState;

    const { indentSize } = this.vimOptions;
    if (!indentSize) return this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const text = activeLine.text;

    const numOfWhiteSpaceAtStart = getNumOfWhiteSpaceAtStart(text);

    let colsToIndentLeft;
    colsToIndentLeft = numOfWhiteSpaceAtStart % indentSize;
    if (colsToIndentLeft === 0) {
      colsToIndentLeft = indentSize;
    }

    const previousCol = this.vimState.cursor.col;
    const maybeNewCol = Math.max(numOfWhiteSpaceAtStart - colsToIndentLeft, 0);
    const newCol = previousCol < maybeNewCol ? previousCol : maybeNewCol;
    this.setCursorCol(newCol);

    const updatedInput = text.substring(colsToIndentLeft);
    this.vimState.lines[this.vimState.cursor.line].text = updatedInput;
    this.vimState.updateActiveLine(updatedInput);
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }
  delete(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const updatedInput = replaceAt(
      activeLine.text,
      this.vimState.cursor.col,
      "",
    );

    this.vimState.updateActiveLine(updatedInput);

    return this.vimState;
  }
  replace(commandInput: string): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const text = activeLine.text;
    const { col } = this.vimState.cursor;
    const replaced = replaceAt(text, col, commandInput);
    this.vimState.updateActiveLine(replaced);
    return this.vimState;
  }
  backspace(): VimStateClass {
    return this.vimState;
  }

  /** `o` */
  // createNewLine(): VimStateClass {
  //   /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'darkblue'}`);
  //   if (!this.vimState.cursor) return this.vimState;
  //   if (!this.vimState.lines) return this.vimState;
  //   const activeLine = this.vimState.getActiveLine();
  //   if (!activeLine) return this.vimState;

  //   // add new line below
  //   const currentLine = activeLine.text;
  //   const newLineIndex = this.vimState.cursor.line + 1;
  //   const tempLines = [...this.vimState.lines];
  //   const numOfWs = StringUtil.getLeadingWhitespaceNum(currentLine);
  //   tempLines.splice(newLineIndex, 0, { text: " ".repeat(numOfWs) });
  //   this.setCursorCol(numOfWs);
  //   // put cursor below
  //   this.setCursorLine(this.vimState.cursor.line + 1);
  //   this.vimState.lines = tempLines;
  //   this.vimState.mode = VimMode.INSERT;
  //   return this.vimState;
  // }

  /** Lines */
  deleteLine(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    if (!this.vimState.lines) return this.vimState;

    const curCursorLine = this.vimState.cursor.line;
    const curLine = this.vimState.getLineAt(curCursorLine);
    if (!curLine) return this.vimState;

    //
    if (this.vimState.deletedLines)
      this.vimState.deletedLines[deleteLineRegister] = [curLine];

    // /* prettier-ignore */ console.trace('>>>> _ >>>> ~ file: abstract-mode.ts ~ line 504 ~ curLine', curLine);
    this.vimState.lines.splice(curCursorLine, 1);

    let newCol = 0;
    const prevLine = this.vimState.getPreviousLine();
    if (prevLine) {
      newCol = Math.max(0, prevLine.text.length - 1);
    } else {
      newCol = 0;
    }
    this.setCursorCol(newCol);

    /** Vim: leaves cursor at same line, so we do it too */
    // this.setCursorLine(Math.max(curLine - 1, 0));
    /** Why is this needed? Comment out and see */
    // const activeLine = this.vimState.getActiveLine();
    // if (!activeLine) return this.vimState;
    // this.vimState.updateActiveLine(activeLine.text);

    //
    this.vimState.deletedLinesIndeces = [curCursorLine];

    return this.vimState;
  }

  protected saveDeletedLines(
    lines: VimLine[],
    register = deleteLineRegister,
  ): void {
    if (!this.vimState.deletedLines) return;
    this.vimState.deletedLines[register] = lines;
  }

  joinLine(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const prev = this.vimState.getPreviousLine();
    if (!prev) return this.vimState;

    const prevText = prev.text;
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const active = activeLine.text;
    const joined = prevText.concat(active);

    const prevCursor = this.vimState.cursor.line - 1;
    this.vimState.updateLine(prevCursor, joined);
    this.deleteLine();
    this.setCursorCol(prevText.length);

    return this.vimState;
  }

  toggleFold(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    if (!this.vimState.lines) return this.vimState;
    // /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'darkblue'}`);
    // /* prettier-ignore */ const before_foldMap = JSON.parse(JSON.stringify(this.vimState.foldMap ?? {parseDefault: true}));
    const result = toggleFold(
      this.vimState.cursor.line,
      this.vimState.lines,
      this.vimState.foldMap,
    );
    if (!result) return this.vimState;

    const { foldMap, parentIndex } = result;
    /* prettier-ignore */ const _foldMap = JSON.parse(JSON.stringify(foldMap ?? {parseDefault: true}));
    this.setCursorLine(parentIndex);

    this.vimState.foldMap = foldMap;
    return this.vimState;
  }

  unfoldAll(): VimStateClass {
    this.vimState.foldMap = undefined;
    return this.vimState;
  }

  copy(): VimStateClass {
    return this.vimState;
  }
  cut(): VimStateClass {
    return this.vimState;
  }
  undo(): VimStateClass {
    return this.vimState;
  }
  redo(): VimStateClass {
    return this.vimState;
  }

  yank(): VimStateClass {
    this.vimState.mode = VimMode.NORMAL;
    return this.vimState;
  }

  paste(clipboardTextSplit: string[]): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const line = this.vimState.getActiveLine();
    if (!line) return this.vimState;
    const col = this.vimState.cursor.col;

    let replaced = "";
    const updatedLines: VimLine[] = [];
    if (clipboardTextSplit.length === 1) {
      // insert normally at current line
      replaced = StringUtil.insert(line.text, col, clipboardTextSplit[0]);
      updatedLines.push({ ...line, text: replaced });
    } else if (clipboardTextSplit.length === 2) {
      const beforePaste = line.text.slice(0, col);
      const beforeWithPasted = beforePaste.concat(clipboardTextSplit[0]);
      const updatedBeforeLine: VimLine = { ...line, text: beforeWithPasted };
      const afterPaste = line.text.slice(col, line.text.length);
      const afterPasted = clipboardTextSplit[1].concat(afterPaste);
      const updatedAfterLine: VimLine = { ...line, text: afterPasted };
      // insert
      // and then split
      updatedLines.push(updatedBeforeLine);
      updatedLines.push(updatedAfterLine);
    } else {
      const [clipboardFirstLine, clipboardMiddleLines, clipboardLastLine] =
        ArrayUtils.splitFirstMiddleLast<string[]>(
          clipboardTextSplit,
        ) as ThreeSplitType<string[]>;

      // for new lines, append at current line
      // acount for current line split at '\n' char from pasted
      const beforePaste = line.text.slice(0, col);
      const beforeWithPasted = beforePaste.concat(clipboardFirstLine);
      const updatedBeforeLine: VimLine = { ...line, text: beforeWithPasted };
      const afterPaste = line.text.slice(col, line.text.length);
      const afterPasted = clipboardLastLine.concat(afterPaste);
      const updatedAfterLine: VimLine = { ...line, text: afterPasted };
      // insert
      // and then split
      const otherPastedLines: VimLine[] = clipboardMiddleLines.map((text) => {
        return { text };
      });
      updatedLines.push(updatedBeforeLine);
      updatedLines.push(...otherPastedLines);
      updatedLines.push(updatedAfterLine);
    }

    if (!this.vimState.lines) return this.vimState;
    const lines = [...this.vimState.lines];
    const curLine = this.vimState.cursor.line;

    const beforeText = [...lines.slice(0, curLine)];
    const afterText = [...lines.slice(curLine + 1, lines.length)];
    const withPastedText = [...beforeText, ...updatedLines, ...afterText];

    this.vimState.lines = withPastedText;

    return this.vimState;
  }

  pasteVim(): VimStateClass {
    if (!this.vimState.deletedLines) return this.vimState;
    const storedLines = this.vimState.deletedLines[deleteLineRegister];
    if (!storedLines) return this.vimState;

    const nextCurLine = this.vimState.getNextCursorLine();
    if (!nextCurLine) return this.vimState;

    // @ts-ignore id is optional
    const linesCrud = new CRUDService<VimLine>();
    // @ts-ignore id is optional
    linesCrud.replace(this.vimState.lines);

    // paste
    const withInserted = linesCrud.insertAt(nextCurLine, storedLines);
    this.vimState.lines = withInserted;

    // set cursor to start of content in next line
    const nextLineText = this.vimState.getNextLine()?.text;
    if (!nextLineText) return this.vimState;
    const firstNonIndex =
      StringUtil.getFirstNonWhiteSpaceCharIndex(nextLineText);

    if (this.vimState.cursor) {
      this.vimState.cursor.col = firstNonIndex;
      this.vimState.cursor.line = nextCurLine;
    }

    return this.vimState;
  }

  pasteVimBefore(): VimStateClass {
    return this.vimState;
  }

  cancelAll(): VimStateClass {
    this.vimState.mode = VimMode.NORMAL;
    this.vimState.visualStartCursor = undefined;
    this.vimState.visualEndCursor = undefined;
    return this.vimState;
  }

  nothing(): VimStateClass {
    return this.vimState;
  }

  private setCursorCol(updaterCursorCol: number) {
    if (!this.vimStateClass.cursor) return;
    this.vimStateClass.cursor.col = Math.max(updaterCursorCol, 0);
  }
  private setCursorLine(updaterCursorLine: number) {
    if (!this.vimState.cursor) return;
    this.vimState.cursor.line = Math.max(updaterCursorLine, 0);
  }

  private reTokenizeInput(input: string) {
    if (input === "") return;

    const tokenizedInput = tokenizeInput(input);

    l.culogger.debug(["reTokenizeInput: %o", tokenizedInput], {
      onlyVerbose: true,
    });

    return tokenizedInput;
  }

  /**
   * When lines are folded, then it affects the cursor vertical movement
   */
  private getAdjustedCursorLineWithFoldmap(
    unadjustedNewCusorLine: number,
  ): number {
    if (!this.vimState.foldMap) return unadjustedNewCusorLine;
    if (!this.vimState.cursor) return unadjustedNewCusorLine;

    let stopper = 0;
    let adjusted = unadjustedNewCusorLine;
    while (this.vimState.foldMap[adjusted] === true && stopper < 20) {
      adjusted += 1;
      stopper++;
    }

    return adjusted;
  }
}

function getNumOfWhiteSpaceAtStart(text: string) {
  const whiteSpaceAtStartIndex = /\w/g.exec(text);
  let numOfWhiteSpaceAtStart = text.length;
  if (whiteSpaceAtStartIndex !== null) {
    numOfWhiteSpaceAtStart = whiteSpaceAtStartIndex.index;
  }
  return numOfWhiteSpaceAtStart;
}

export function isValidHorizontalPosition(
  cursorCol: number,
  activeInput: string,
) {
  if (!activeInput) return false;
  if (cursorCol === activeInput.length + 1) return true;

  const isBigger = cursorCol > activeInput.length;
  /**
   * Should be > technically, but conceptionally, cursor and text index are off by one.
   */
  const isZero = cursorCol === 0;
  const result = !isBigger && !isZero;

  return result;
}

export function isValidVerticalPosition(line: number, lines: VimLine[]) {
  const isBigger = line > lines.length;
  /**
   * Should be > technically, but conceptionally, line and text index are off by one.
   */
  const isZero = line === 0;

  //
  const result = !isBigger && !isZero;
  return result;
}

export function tokenizeInput(input: string): TokenizedString[] {
  const tokens = [];
  let currentToken = "";
  let currentIndex = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    // /*prettier-ignore*/ console.log("[AbstractMode.ts,959] char: ", char);

    if (specialCharsSet.has(char)) {
      // /*prettier-ignore*/ console.log("1");
      // If we have a current token (either a word or a previous special token), push it first
      if (currentToken) {
        tokens.push({
          string: currentToken,
          start: currentIndex,
          end: currentIndex + currentToken.length - 1,
          index: tokens.length,
        });
        currentToken = "";
      }

      // Start accumulating special characters
      currentToken += char;
      currentIndex = i; // Update the start index for the special token

      // Continue accumulating special characters until a non-special character is found
      while (i + 1 < input.length && specialCharsSet.has(input[i + 1])) {
        i++;
        currentToken += input[i];
      }

      // Push the accumulated special character token
      tokens.push({
        string: currentToken,
        start: currentIndex,
        end: currentIndex + currentToken.length - 1,
        index: tokens.length,
      });

      currentToken = ""; // Reset currentToken
    } else if (char.trim()) {
      // /*prettier-ignore*/ console.log("2");
      // Check for non-whitespace characters
      if (!currentToken) {
        currentIndex = i; // Mark the start of the token
      }
      currentToken += char; // Build the current word
    } else {
      // /*prettier-ignore*/ console.log("3");
      // If we hit whitespace and have a current token, push it
      if (currentToken) {
        tokens.push({
          string: currentToken,
          start: currentIndex,
          end: currentIndex + currentToken.length - 1,
          index: tokens.length,
        });
        currentToken = "";
      }
    }
  }

  // Push any remaining token
  if (currentToken) {
    // /*prettier-ignore*/ console.log("4");
    tokens.push({
      string: currentToken,
      start: currentIndex,
      end: currentIndex + currentToken.length - 1,
      index: tokens.length,
    });
  }

  return tokens;
}

//// const result = tokenizeInput("0.!@456");
//const result = tokenizeInput("s.");
//// 0123456
///*prettier-ignore*/ console.log("", JSON.stringify(result));
///*prettier-ignore*/ console.log("", result[0]);
///*prettier-ignore*/ console.log("", result[1]);
///*prettier-ignore*/ console.log("", result[2]);
///*prettier-ignore*/ console.log("", result[3]);

//const inputString = "Hello, world! This is a test: 1 + 2 = 3.";
////                   012345678901234567890123456789012345678901234567
////                   0         1         2         3         4
//const tokens = tokenizeInput(inputString);
//console.log(tokens[0]);
//console.log(tokens[1]);
//console.log(tokens[2]);
//console.log(tokens[3]);
//console.log(tokens[4]);
//console.log(tokens[5]);
//console.log(tokens[6]);
//console.log(tokens[7]);
//console.log(tokens[8]);
//console.log(tokens[9]);
