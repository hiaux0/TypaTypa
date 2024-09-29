import { VimInit } from "../../../../features/vim/VimInit";
import { AbstractMode } from "../../../../features/vim/modes/AbstractMode";
import { VimStateClass } from "../../../../features/vim/vim-state";
import { VimMode, VimOptions } from "../../../../features/vim/vim-types";

export class GridNavigation {
  public init(container: HTMLElement): void {
    const vimInit = new VimInit();
    const vimOptions: VimOptions = {
      container,
      vimState: {
        id: "grid-navigation",
        mode: VimMode.VISUAL,
        cursor: { line: 0, col: 0 },
        lines: [{ text: "    " }],
      },
      hooks: {
        modeChanged: (mode) => {
          /*prettier-ignore*/ console.log("[grid-navigation.ts,30] mode: ", mode);
        },
        commandListener: (result) => {
          console.log("commandListener", result);
        },
      },
    };
    vimInit.init(vimOptions);
  }
}
