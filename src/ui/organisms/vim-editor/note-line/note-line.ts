import { getCssVar } from "../../../../common/modules/css/css-variables";
import { CursorUtils } from "../../../../common/modules/cursor/cursor-utils";
import { debugFlags } from "../../../../common/modules/debug/debugFlags";
import {
  Cursor,
  IVimState,
  VimLine,
  VimMode,
} from "../../../../features/vim/vim-types";
import "./note-line.scss";
import { bindable, inject } from "aurelia";

// const logger = new Logger({ scope: 'NoteLine' });

@inject()
export class NoteLine {
  private cachedStartCol: number;
  private cachedEndCol: number;
  private cachedLeft: string;
  private cachedWidth: string;
  private lineRef: HTMLElement;
  private readonly VimMode = VimMode.NORMAL;

  private debugFlags = debugFlags;

  @bindable value = "NoteLine";

  @bindable line: VimLine;
  @bindable lineIndex: number;
  @bindable cursorIndex: number;

  @bindable editorLineClass: string;

  @bindable lineHighlightStart: Cursor;
  @bindable lineHighlightEnd: Cursor;
  @bindable foldMap: IVimState["foldMap"];
  @bindable vimMode: VimMode;

  constructor(private readonly element: HTMLElement) {}

  get lineHightlight(): { width?: string; left?: string } {
    if (!this.lineHighlightStart) return {};
    if (!this.lineHighlightEnd) return {};
    if (!this.line) return {};

    const editorLine = this.lineRef;
    if (editorLine === null) return {};

    let width = "";
    let left = "";
    const endCol = this.lineHighlightEnd?.col;
    const startCol = this.lineHighlightStart?.col;
    const minCol = Math.min(endCol, startCol);
    const diffCol = Math.max(endCol, startCol) - minCol + 1;
    const caretSizeWidth = getCssVar("--caret-size-width");

    const oneLine =
      this.lineHighlightStart.line === this.lineHighlightEnd.line &&
      this.lineHighlightStart.line === this.lineIndex;
    if (oneLine) {
      width = `${Math.abs(diffCol * caretSizeWidth).toFixed(2)}px`;
      left = `${(minCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
        2,
      )}px`;
    } else {
      const sameStartLine = this.lineIndex === this.lineHighlightStart?.line;
      const sameEndLine = this.lineIndex === this.lineHighlightEnd?.line;
      const goingDown =
        this.lineHighlightEnd.line > this.lineHighlightStart.line;
      const goingUp = this.lineHighlightEnd.line < this.lineHighlightStart.line;
      const endColOfLine = this.line.text.length;
      const diff = endColOfLine - startCol;
      const isWithinLines = CursorUtils.isWithinLines(
        this.lineHighlightStart,
        this.lineHighlightEnd,
        {
          col: this.cursorIndex,
          line: this.lineIndex,
        },
      );

      if (sameStartLine) {
        if (goingDown) {
          width = `${Math.abs(diff * caretSizeWidth).toFixed(2)}px`;
          left = `${(startCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
            2,
          )}px`;
        } else if (goingUp) {
          width = `${Math.abs(
            this.lineHighlightEnd.col * caretSizeWidth,
          ).toFixed(2)}px`;
          left = `${(0 * caretSizeWidth + editorLine.offsetLeft).toFixed(2)}px`;
        }
      } else if (sameEndLine) {
        if (goingDown) {
          width = `${Math.abs(
            this.lineHighlightEnd.col * caretSizeWidth,
          ).toFixed(2)}px`;
          left = `${(0 * caretSizeWidth + editorLine.offsetLeft).toFixed(2)}px`;
        } else if (goingUp) {
          width = `${Math.abs(diff * caretSizeWidth).toFixed(2)}px`;
          left = `${(startCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
            2,
          )}px`;
        }
      } else if (isWithinLines) {
        width = `${Math.abs(endColOfLine * caretSizeWidth).toFixed(2)}px`;
        left = `${(0 * caretSizeWidth + editorLine.offsetLeft).toFixed(2)}px`;
      }
    }

    this.cachedEndCol = endCol;
    this.cachedStartCol = startCol;
    this.cachedWidth = width;
    this.cachedLeft = left;
    const rect = { width, left };
    /*prettier-ignore*/ console.log("[note-line.ts,117] rect: ", rect);
    return rect;
  }

  isDefaultLine() {
    return true;
    // const isDefault = line.macro?.checkbox === undefined;
    // return isDefault;
  }
}
