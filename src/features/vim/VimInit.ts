import { VIM_COMMAND } from "./vim-commands-repository";
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

  public executeCommandSequence(sequence: string): void {
    this.vimInputHandler.executeCommandSequence(sequence);
  }

  public executeCommand(
    commandName: VIM_COMMAND,
    inputForCommand: string,
  ): void {
    this.vimInputHandler.executeCommand(commandName, inputForCommand);
  }

  public reload(vimState: IVimState) {
    this.vimInputHandler.reload(vimState);
  }

  public getOptions() {
    return this.options;
  }
}
