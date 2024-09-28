import { VimStateClass } from "../vim-state";
import { VimMode, IVimState, VimLine } from "../vim-types";
import { Logger } from "../../../common/logging/logging";
import { replaceRange } from "../../../common/modules/string/string";
import { VIM_COMMAND } from "../vim-commands-repository";
import { AbstractMode } from "./AbstractMode";
import { CRUDService } from "../../../common/services/CRUDService";

const logger = new Logger("VisualMode");

export class VisualLineMode extends AbstractMode {
  currentMode = VimMode.VISUALLINE;

  public executeCommand(
    vimState: IVimState,
    commandName: VIM_COMMAND,
    commandValue: string,
  ): IVimState | undefined {
    const newVimState = super.executeCommand(
      vimState,
      commandName,
      commandValue,
    );

    return newVimState;
  }

  cursorUp(): VimStateClass {
    const updatedVimState = super.cursorUp();
    if (!updatedVimState.cursor) return this.vimState;

    if (updatedVimState.visualStartCursor) {
      updatedVimState.visualStartCursor.line = updatedVimState.cursor.line;
    }
    // updatedVimState.visualEndCursor.line = updatedVimState.cursor.line;
    this.vimState = updatedVimState;

    return this.vimState;
  }

  cursorDown(): VimStateClass {
    const updatedVimState = super.cursorDown();
    if (!updatedVimState.cursor) return this.vimState;
    // updatedVimState.visualStartCursor.line = updatedVimState.cursor.line;
    if (updatedVimState.visualEndCursor) {
      updatedVimState.visualEndCursor.line = updatedVimState.cursor.line;
    }
    this.vimState = updatedVimState;

    return this.vimState;
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

    // @ts-ignore id is optional
    const linesCrud = new CRUDService<VimLine>();
    // @ts-ignore id is optional
    linesCrud.replace(this.vimState.lines);

    const deleted = linesCrud.readBetween(
      visualStartCursor.line,
      visualEndCursor.line,
    );
    this.saveDeletedLines(deleted);

    const activeLine = this.vimState.getActiveLine();
    if (!activeLine) return this.vimState;
    const lines = linesCrud.deleteBetween(
      visualStartCursor.line,
      visualEndCursor.line,
    );
    this.vimState.lines = lines;

    // Put cursor to start of visual
    this.vimState.cursor.col = visualStartCursor.col;
    this.vimState.cursor.line = visualStartCursor.line;
    this.vimState.mode = VimMode.NORMAL;

    return this.vimState;
  }
}

function logVisualDeleteError(message: string) {
  logger.culogger.debug([message], { isError: true });
}
