import { INode, ISignaler, resolve } from "aurelia";
import { VimStateClass } from "../../features/vim/vim-state";
import { IVimState, VimOptions } from "../../features/vim/vim-types";
import { VimInit } from "../../features/vim/VimInit";
import { IVimInputHandlerV2 } from "../../features/vim/VimInputHandlerV2";

export class VimCustomAttribute {
  private element = resolve(INode) as HTMLElement;
  vimState: IVimState;

  constructor(
    private vimInit: VimInit = resolve(VimInit),
    private vimInputHandler: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
  ) {}

  attached() {
    console.log(this.element);

    const vimState = VimStateClass.createEmpty();
    vimState.id = "bruh";
    vimState.lines = [{ text: "hi, world what are" }];
    const options: VimOptions = {
      vimState,
      vimId: vimState.id,
      container: this.element,
      childSelector: "vim-line",
      hooks: {
        vimStateUpdated: (vimState: IVimState) => {
          this.vimState = vimState;
        },
      },
    };
    this.vimInit.init(options);
    this.vimInputHandler.registerAndInit(options);
    this.vimState = vimState;
  }
}
