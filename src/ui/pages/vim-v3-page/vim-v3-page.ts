import { VimStateClass } from "../../../features/vim/vim-state";
import { IVimState } from "../../../features/vim/vim-types";
import "./vim-v3-page.scss";

export class VimV3Page {
  public message = "vim-v3-page.html";
  vimState: IVimState;

  binding() {
    this.vimState = VimStateClass.createEmpty();
    this.vimState.cursor = { col: 7, line: 0 };
    this.vimState.lines = [{ text: "hello, how are you?" }];
    this.vimState.id = "vim-v3-page";
    window.activeVimInstancesIdMap = [this.vimState.id];
  }

  public handleKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key === "Enter") {
      this.handleEnter(key);
    }
  }

  private handleEnter(): void {
    // add another input
    console.log("Add another input");
    const newLine = { text: "hi" };
    this.vimState.lines.push(newLine);
  }
}
