import { StringUtil } from "../../common/modules/string/string";
import { NormalMode } from "./modes/NormalMode";
import { VIM_COMMAND, VIM_MODE_COMMANDS } from "./vim-commands-repository";
import { IVimState, VimMode } from "./vim-types";

interface SwitchModeOptions {
  normal?: () => void;
  insert?: () => void;
  visual?: () => void;
}

export class VimHelper {
  static switchModes(mode: VimMode, switchModeOptions: SwitchModeOptions) {
    const { insert, normal, visual } = switchModeOptions;

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
}
