import { Logger } from "../../common/logging/logging";
import { VIM_COMMAND } from "./vim-commands-repository";
import { IVimState, VimOptions } from "./vim-types";
import { VimInputHandler } from "./VimInputHandler";

const logger = new Logger("VimInit");

export class VimInit {
  private vimInputHandler: VimInputHandler;
  private options: VimOptions;

  public init(options?: VimOptions) {
    this.vimInputHandler = new VimInputHandler();
    this.vimInputHandler.init(options);

    if (!options) return;
    this.options = options;
    this.vimInputHandler;
  }

  public executeCommandSequence(sequence: string): void {
    if (!this.vimInputHandler) console.log("Please call #init() first");
    this.vimInputHandler.executeCommandSequence(sequence);
  }

  public executeCommand(
    commandName: VIM_COMMAND,
    inputForCommand: string,
  ): IVimState | undefined {
    if (!this.vimInputHandler)
      throw "[ERROR:VimInit] Please call #init() first";
    const result = this.vimInputHandler.executeCommand(
      commandName,
      inputForCommand,
    );
    return result;
  }

  public reload(vimState: IVimState) {
    this.vimInputHandler.reload(vimState);
  }

  public getOptions() {
    return this.options;
  }
}
