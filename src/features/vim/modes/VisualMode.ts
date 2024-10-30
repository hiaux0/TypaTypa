import { Logger } from "../../../common/logging/logging";
import { setClipboardContent } from "../../../common/modules/platform/clipboard";
import { replaceRange } from "../../../common/modules/string/string";
import { VIM_COMMAND } from "../vim-commands-repository";
import { VimStateClass } from "../vim-state";
import { IVimState, VimMode } from "../vim-types";
import { AbstractMode } from "./AbstractMode";

const logger = new Logger("VisualMode");

export class VisualMode extends AbstractMode {
  constructor(vimState?: IVimState) {
    super(vimState);
  }

  public executeCommand(
    vimState: IVimState,
    commandName: VIM_COMMAND,
    inputForCommand: string,
  ): IVimState | undefined {
    const newVimState = super.executeCommand(
      vimState,
      commandName,
      inputForCommand,
    );
    if (!newVimState) return;
    if (!newVimState.cursor) return;

    newVimState.visualEndCursor = {
      col: newVimState.cursor.col,
      line: newVimState.cursor.line,
    };

    return newVimState;
  }

  visualMoveToOtherEndOfMarkedArea(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const curCursorCol = this.vimState.cursor.col;

    if (this.vimState.visualStartCursor) {
      this.vimState.cursor.col = this.vimState.visualStartCursor.col;
      this.vimState.visualStartCursor.col = curCursorCol;
    }

    return this.vimState;
  }

  visualInnerWord(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const token = super.getTokenUnderCursor();
    if (!token) return this.vimState;
    const isAtStartOfWord = token.start === this.vimState.cursor.col;

    if (!isAtStartOfWord) {
      this.vimState.visualStartCursor = {
        line: this.vimState.cursor.line,
        col: token.start,
      };
      this.vimState.cursor.col = token.start;
    }

    super.cursorWordForwardEnd();

    return this.vimState;
  }

  visualStartLineWise(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    if (this.vimState.visualStartCursor) {
      this.vimState.visualStartCursor.col = 0;
    }
    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    this.vimState.cursor.col = activeLine.text.length;

    return this.vimState;
  }

  visualDelete(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;

    const { visualStartCursor, visualEndCursor } = this.vimState;
    if (!visualStartCursor) {
      logVisualDeleteError("Need start cursor");
      return this.vimState;
    }
    if (!visualEndCursor) {
      logVisualDeleteError("Need end cursor");
      return this.vimState;
    }

    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const text = activeLine.text;
    const replaced = replaceRange(
      text,
      visualStartCursor.col,
      visualEndCursor.col,
    );
    this.vimState.updateActiveLine(replaced);

    // Put cursor to start of visual
    this.vimState.cursor.col = visualStartCursor.col;

    return this.vimState;
  }

  public copy(): VimStateClass {
    const text = this.getSelectedText();
    setClipboardContent(text);
    this.vimState.mode = VimMode.NORMAL;
    return this.vimState;
  }

  public getSelectedText(): string {
    const { visualStartCursor, visualEndCursor } = this.vimState;
    if (!visualStartCursor) {
      logVisualDeleteError("Need start cursor");
      return;
    }
    if (!visualEndCursor) {
      logVisualDeleteError("Need end cursor");
      return;
    }

    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return;
    const text = activeLine.text;
    const min = Math.min(visualStartCursor.col, visualEndCursor.col);
    const max = Math.max(visualStartCursor.col, visualEndCursor.col);
    const part = text.slice(min, max + 1);
    return part;
  }
}

function logVisualDeleteError(message: string) {
  logger.culogger.debug([message], { isError: true });
}
