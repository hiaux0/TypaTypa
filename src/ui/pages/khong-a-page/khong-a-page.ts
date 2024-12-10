import { VimStateClass } from "../../../features/vim/vim-state";
import { IVimState, VimMode } from "../../../features/vim/vim-types";
import "./khong-a-page.scss";
import { Logger } from "../../../common/logging/logging";
import { debugFlags } from "../../../common/modules/debug/debugFlags";

const l = new Logger("KhongAPage");

export class KhongAPage {
  public containerRef: HTMLElement;
  public textareaTextContainerRef: HTMLElement;
  public textareaRef: HTMLTextAreaElement;
  public cursorRef: HTMLElement;
  public vimState: IVimState;
  public textValue = "Hello world\n\nokayyy";
  public debugFlags = debugFlags;

  public get showTextarea(): boolean {
    return this.vimState?.mode === VimMode.INSERT;
  }

  attached(): void {
    const vimState = VimStateClass.createEmpty().serialize();
    vimState.id = "khong-a";
    vimState.lines = [
      // { text: "" },
      { text: "01234 6789" },
      { text: "abcdefg hijklmnopqr stuvwxyz" },
      { text: "abcd fghifkl" },
    ];
    vimState.cursor = { line: 0, col: 0 };
    // vimState.cursor = { line: 1, col: 3 };
    this.vimState = vimState;
  }
}
