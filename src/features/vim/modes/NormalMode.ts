import { VimStateClass } from "../vim-state";
import { IVimState, VimMode } from "../vim-types";
import { AbstractMode } from "./AbstractMode";

export class NormalMode extends AbstractMode {
  constructor(vimState?: IVimState) {
    super(vimState);
  }

  deleteInnerWord(): VimStateClass {
    if (!this.vimState.cursor) return this.vimState;
    const token = super.getTokenUnderCursor();
    if (!token) return this.vimState;

    let newText: string | undefined = "";
    if (token) {
      newText = this.vimState.getActiveLine()?.text.replace(token.string, "");
      if (newText) {
        this.vimState.updateActiveLine(newText);
        const newCol = this.vimState.cursor.col - (token.string.length - 1);
        this.vimState.updateCursor({ ...this.vimState.cursor, col: newCol });
      }
    } else {
      this.delete();
    }

    return this.vimState;
  }

  clearLine(): VimStateClass {
    this.vimState.updateActiveLine("");
    this.cursorLineEnd();

    return this.vimState;
  }

  enterInsertMode(): VimStateClass {
    this.vimState.mode = VimMode.INSERT;
    return this.vimState;
  }
}
