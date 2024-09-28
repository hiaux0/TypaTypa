import { VimCommandNames } from "./vim-commands-repository";
import {
  Cursor,
  EMPTY_VIM_LINE,
  FoldMap,
  VimLine,
  VimMode,
  IVimState,
} from "./vim-types";
import { ISnippet } from "../../common/modules/keybindings/snippets";
import { EditorId } from "../../domain/types/types";
import generateId from "../../common/modules/random/random";
import { Logger } from "../../common/logging/logging";
 
const logger = new Logger("VimState");

export class VimStateClass {
  id: EditorId;
  cursor: Cursor | undefined;
  foldMap: FoldMap | undefined;
  lines: VimLine[] | undefined;
  mode: VimMode | undefined;
  visualStartCursor: Cursor | undefined;
  visualEndCursor: Cursor | undefined;
  deletedLinesIndeces: number[] | undefined;
  deletedLines?: IVimState["deletedLines"] = {};
  commandName: VimCommandNames | undefined;
  snippet: ISnippet | undefined;

  constructor(private readonly vimState: IVimState) {
    if (!vimState.id) {
      vimState.id = generateId();
    }
    this.updateVimState(vimState);
  }

  public static create(cursor: Cursor, lines?: VimLine[]) {
    return new VimStateClass({ cursor, lines, id: "" });
  }

  public static createEmpty() {
    return new VimStateClass({
      cursor: { col: 0, line: 0 },
      lines: [{ text: "" }],
      id: "",
    });
  }

  public serialize(): IVimState {
    return {
      id: this.id,
      cursor: this.cursor,
      foldMap: this.foldMap,
      lines: this.lines,
      mode: this.mode,
      visualStartCursor: this.visualStartCursor,
      visualEndCursor: this.visualEndCursor,
      deletedLinesIndeces: this.deletedLinesIndeces,
      deletedLines: this.deletedLines,
      commandName: this.commandName,
      snippet: this.snippet,
    };
  }

  public getLineAt(lineIndex: number) {
    if (!this.lines) return;

    const line = this.lines[lineIndex];
    return line;
  }

  public getActiveLine() {
    if (!this.cursor) return;
    const active = this.getLineAt(this.cursor.line) ?? EMPTY_VIM_LINE;
    // const active = this.getLineAt(this.cursor.line);
    return active;
  }

  public getPreviousLine() {
    if (!this.cursor) return;
    const lineIndex = Math.max(this.cursor.line - 1, 0);
    const previous = this.getLineAt(lineIndex);
    return previous;
  }

  public getNextLine() {
    if (!this.cursor) return;
    if (!this.lines) return;

    const nextIndex = this.getNextCursorLine();
    if (!nextIndex) return;
    const previous = this.getLineAt(nextIndex);

    return previous;
  }

  public getNextCursorLine() {
    if (!this.cursor) return;
    if (!this.lines) return;

    const lineLength = this.lines.length;
    const next = Math.min(this.cursor.line + 1, lineLength - 1);

    return next;
  }

  public insertLine(lineIndex: number, newLine: VimLine) {
    const tempLines = structuredClone(this.lines);
    if (!tempLines) return;
    tempLines.splice(lineIndex, 0, newLine);
    return tempLines;
  }

  public updateLine(lineIndex: number, updated: string) {
    if (!this.lines) return;
    this.lines[lineIndex] = { text: updated };
  }

  public updateActiveLine(updated: string) {
    if (!this.cursor) return;
    this.updateLine(this.cursor.line, updated);
  }

  public updateCursor(cursor: Cursor) {
    this.cursor = cursor;
  }

  public updateVimState(vimState: IVimState) {
    Object.assign(this, vimState);
    this.mode = vimState.mode ?? VimMode.NORMAL;
  }

  public reportVimState() {
    const { cursor, lines, mode } = this;
    if (!lines) return;
    logger.culogger.overwriteDefaultLogOtpions({ log: true });
    /* prettier-ignore */ if (mode) logger.culogger.debug(['Vim in Mode:', mode], {}, (...r) => console.log(...r));
    /* prettier-ignore */ logger.culogger.debug(['Cursor at', {...cursor}], {}, (...r) => console.log(...r));
    /* prettier-ignore */ logger.culogger.debug(['Lines are', lines.map(l => l.text)], {}, (...r) => console.log(...r));
    logger.culogger.overwriteDefaultLogOtpions({ log: false });
  }

  public isInsertMode(): boolean {
    const is = this.mode === VimMode.INSERT;
    return is;
  }
}
