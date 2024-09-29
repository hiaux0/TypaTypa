import { VIM_COMMAND, VIM_MODE_COMMANDS } from "../../vim-commands-repository";
import {
  VimMode,
  IVimState,
  VimOptions,
  QueueInputReturn,
} from "../../vim-types";
import { NormalMode } from "../../modes/NormalMode";
import { VisualMode } from "../../modes/VisualMode";
import { VimStateClass } from "../../vim-state";
import { StringUtil } from "../../../../common/modules/string/string";
import { VisualLineMode } from "../../modes/VisualLineMode";
import { Logger } from "../../../../common/logging/logging";
import { VimHelper } from "../../VimHelper";

const logger = new Logger("VimCommandManagerv3");

/**
 * - execute commands
 */
export class VimCommandManager {
  /**
   * Should always be up to date before a command is executed
   */
  private internalVimState: IVimState;

  constructor(private options?: VimOptions) {}

  static create(options?: VimOptions) {
    return new VimCommandManager(options);
  }

  public executeCommand(
    vimState: IVimState,
    commandName: VIM_COMMAND,
    inputForCommand: string,
  ) {
    this.setInternalVimState(vimState);
    const mode = this.getMode(vimState.mode);
    const previousMode = vimState.mode;

    /** Changed Mode */
    if (VimHelper.isModeChangingCommand(commandName)) {
      const result = this.executeModeChange(commandName);
      return result;
    }

    /** Mode Commands */
    if (!mode) return;
    if (mode.commandExists(commandName)) {
      const result = mode.executeCommand(
        vimState,
        commandName,
        inputForCommand,
      );

      /** When command changed mode */
      const currentMode = vimState.mode;
      if (previousMode !== currentMode) {
        if (this.options?.hooks?.modeChanged)
          this.options.hooks.modeChanged({
            vimState: result,
            targetCommand: commandName,
            keys: "todo vcm",
          });
      }

      return result;
    }
  }

  private setInternalVimState(vimState: IVimState) {
    this.internalVimState = structuredClone(vimState);
  }

  public getMode<Mode extends VimMode>(
    mode: Mode | undefined,
  ): Mode extends VimMode.NORMAL
    ? NormalMode
    : Mode extends VimMode.VISUAL
      ? VisualMode
      : Mode extends VimMode.VISUALLINE
        ? VisualLineMode
        : undefined {
    let finalMode = undefined;
    switch (mode) {
      case VimMode.NORMAL: {
        finalMode = new NormalMode(this.internalVimState);
        break;
      }
      case VimMode.VISUAL: {
        finalMode = new VisualMode(this.internalVimState);
        break;
      }
      case VimMode.VISUALLINE: {
        finalMode = new VisualLineMode(this.internalVimState);
        break;
      }
      case VimMode.INSERT: {
        /** Handle insert in input for now (maybe later for snippets) */
        break;
      }
      default: {
        console.log(`Mode not supported: ${mode}`);
        break;
      }
    }

    // @ts-ignore
    return finalMode;
  }

  private executeModeChange(commandName: VIM_COMMAND): IVimState | undefined {
    logger.culogger.debug(["Mode change command", commandName]);

    // @ts-ignore
    if (!this[commandName]) return;
    // @ts-ignore
    const result = this[commandName](this.internalVimState);

    if (!this.options?.hooks?.modeChanged) return;
    const modeChangedResult: QueueInputReturn = {
      vimState: result,
      targetCommand: this.internalVimState.commandName as any,
      keys: "",
    };
    this.options.hooks.modeChanged(modeChangedResult);

    return result;
  }

  private enterNormalMode(vimState: IVimState) {
    const mode = new NormalMode(vimState);
    const updated = mode.cancelAll().serialize();

    return updated;
  }

  private enterVisualMode(vimState: IVimState) {
    vimState.mode = VimMode.VISUAL;
    if (!vimState?.cursor) return;

    vimState.visualStartCursor = {
      col: vimState?.cursor?.col,
      line: vimState.cursor.line,
    };
    vimState.visualEndCursor = {
      col: vimState.cursor.col,
      line: vimState.cursor.line,
    };
    return vimState;
  }

  private visualStartLineWise(vimState: IVimState) {
    if (!vimState?.cursor) return;
    /* prettier-ignore */ logger.culogger.debug(["Enter Visual Line mode"], {}, (...r) => console.log(...r),);

    const vimStateClass = new VimStateClass(vimState);
    vimState.visualStartCursor = {
      col: 0,
      line: vimState.cursor.line,
    };
    vimState.visualEndCursor = {
      col: vimStateClass.getActiveLine()?.text.length ?? 0,
      line: vimState.cursor.line,
    };
    vimState.mode = VimMode.VISUALLINE;

    return vimState;
  }

  private enterInsertMode(vimState: IVimState) {
    vimState.mode = VimMode.INSERT;
    return vimState;
  }

  private createNewLine(vimState: IVimState) {
    const vimStateClass = new VimStateClass(vimState);
    const activeLine = vimStateClass.getActiveLine();
    if (!activeLine) return this.internalVimState;
    if (!vimState.cursor) return;
    if (!vimState.lines) return;

    // add new line below
    const currentLine = activeLine.text;
    const newLineIndex = vimState.cursor.line + 1;
    const tempLines = [...vimState.lines];
    const numOfWs = StringUtil.getLeadingWhitespaceNum(currentLine);
    tempLines.splice(newLineIndex, 0, { text: " ".repeat(numOfWs) });
    vimState.cursor.col = numOfWs;
    // put cursor below
    const updaterCursorLine = vimState.cursor.line + 1;
    vimState.cursor.line = Math.max(updaterCursorLine, 0);

    vimState.lines = tempLines;
    vimState.mode = VimMode.INSERT;
    return vimState;
  }

  createNewLineAbove(vimState: IVimState): IVimState | undefined {
    if (!vimState.cursor) return;
    if (!vimState.lines) return;
    const vimStateClass = new VimStateClass(vimState);

    const activeLine = vimStateClass.getActiveLine();
    if (!activeLine) return;

    // add new line below
    const currentLine = activeLine.text;
    const newLineIndex = Math.max(vimState.cursor.line, 0);
    const tempLines = [...vimState.lines];
    const numOfWs = StringUtil.getLeadingWhitespaceNum(currentLine);
    tempLines.splice(newLineIndex, 0, { text: " ".repeat(numOfWs) });
    vimState.cursor.col = numOfWs;

    // put cursor below
    vimState.cursor.line = newLineIndex;
    vimState.lines = tempLines;
    vimState.mode = VimMode.INSERT;
    return vimState;
  }

  private enterInsertModeStart(vimState: IVimState) {
    const vimStateClass = new VimStateClass(vimState);
    const activeLine = vimStateClass.getActiveLine();
    if (!activeLine) return vimState;

    const currentLine = activeLine.text;
    const nonFirst = StringUtil.getFirstNonWhiteSpaceCharIndex(currentLine);
    if (vimState.cursor) vimState.cursor.col = nonFirst;

    vimState.mode = VimMode.INSERT;
    return vimState;
  }

  private enterInsertAfterMode(vimState: IVimState) {
    const vimMode = vimState.mode;
    const mode = this.getMode(vimMode);
    const result = mode?.executeCommand(vimState, VIM_COMMAND.cursorRight, "");

    if (!result) return vimState;

    result.mode = VimMode.INSERT;
    return result;
  }

  private enterInsertAfterModeEnd(vimState: IVimState) {
    const vimStateClass = new VimStateClass(vimState);
    const activeLine = vimStateClass.getActiveLine();
    if (!activeLine) return vimState;

    const currentLine = activeLine.text;
    if (vimState.cursor) vimState.cursor.col = Math.max(currentLine.length, 0);

    vimState.mode = VimMode.INSERT;
    return vimState;
  }
}
