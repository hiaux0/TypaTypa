import { StringUtil } from "../../common/modules/string/string";
import { NormalMode } from "./modes/NormalMode";
import { VIM_COMMAND, VIM_MODE_COMMANDS } from "./vim-commands-repository";
import { IVimState, VimMode } from "./vim-types";

interface SwitchModeOptions {
  normal?: () => void;
  insert?: () => void;
  visual?: () => void;
  custom?: () => void;
}

export class VimHelper {
  static switchModes(mode: VimMode | undefined, switchModeOptions: SwitchModeOptions) {
    if (!mode) return;
    const { insert, normal, visual, custom } = switchModeOptions;

    switch (mode) {
      case VimMode.NORMAL: {
        if (normal) return normal();
        break;
      }
      case VimMode.INSERT: {
        if (insert) return insert();
        break;
      }
      case VimMode.VISUAL: {
        if (visual) return visual();
        break;
      }
      case VimMode.CUSTOM: {
        if (custom) return custom();
        break;
      }
      default: {
        console.log(`Mode not supported: ${mode}`);
        return;
      }
    }

    return;
  }

  public static hasModeChanged(
    oldMode: VimMode | undefined,
    newMode: VimMode | undefined,
  ): boolean {
    if (oldMode == null) return false;
    if (newMode == null) return false;

    const changed = oldMode !== newMode;
    return changed;
  }

  public static isModeChangingCommand(commandName: VIM_COMMAND): boolean {
    const modeChangingCommands = VIM_MODE_COMMANDS;
    const is = modeChangingCommands.includes(commandName);
    return is;
  }

  public static getWordUnderCursor(
    vimState: IVimState | undefined,
  ): string | undefined {
    if (!vimState) return;

    const normal = new NormalMode(vimState);
    const token = normal.getTokenUnderCursor();
    if (!token) return;

    let word = token.string;
    word = StringUtil.matchWords(word)[0];
    return word;
  }

  public static debugLog(newVimState: IVimState): void {
    const onlyText = newVimState.lines?.map((l) => l.text);
    /*prettier-ignore*/ console.log("[VimHelper.ts,76] onlyText: ", onlyText);
  }

  public static cursorToOffsetByVimState(vimState: IVimState) {
    if (!vimState.cursor) return;
    if (!vimState.lines) return;
    let offset = 0;
    for (let i = 0; i < vimState.cursor.line; i++) {
      offset += vimState.lines[i].text.length + 1;
    }
    offset += vimState.cursor.col;
    return offset;
  }

  public static convertOffsetToVimStateCursor(
    offset: number,
    vimState: IVimState,
  ) {
    if (offset < 0) return;
    if (!vimState.lines) return;
    let line = 0;
    let col = 0;
    let currentOffset = 0;
    while (currentOffset < offset) {
      /*prettier-ignore*/ console.log("[VimHelper.ts,98] vimState.lines: ", vimState.lines);
      const lineText = vimState.lines[line].text;
      if (currentOffset + lineText.length + 1 > offset) {
        col = offset - currentOffset;
        break;
      }
      currentOffset += lineText.length + 1;
      line++;
    }
    return { line, col };
  }
}
