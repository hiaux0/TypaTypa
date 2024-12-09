import { VimStateClass } from "../vim-state";
import { IVimState } from "../vim-types";
import { AbstractMode } from "./AbstractMode";

export class InsertMode extends AbstractMode {
  constructor(vimState?: IVimState) {
    super(vimState);
  }

  public newLine(): VimStateClass {
    const { cursor, lines } = this.vimState;
    if (!cursor) return this.vimState;
    if (!lines) return this.vimState;
    const { line, col } = cursor;
    const newLines = [...lines];
    newLines.splice(line, 0, { text: "" });
    this.vimState.lines = newLines;
    this.vimState.updateCursor({ line: line + 1, col: 0 });
    return this.vimState;
  }
}
