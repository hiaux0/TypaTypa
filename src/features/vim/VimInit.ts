import { IVimState, VimOptions } from "./vim-types";
import { VimInputHandler } from "./VimInputHandler";

export class VimInit {
  private vimInputHandler: VimInputHandler;
  private options: VimOptions;

  public init(options?: VimOptions) {
    this.vimInputHandler = new VimInputHandler();
    this.vimInputHandler.init(options);

    if (!options) return;
    this.options = options;
  }

  public reload(vimState: IVimState) {
    this.vimInputHandler.reload(vimState);
  }

  public getOptions() {
    return this.options;
  }
}
