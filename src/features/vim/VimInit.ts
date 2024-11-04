import { Logger } from "../../common/logging/logging";
import { IKeyMappingMapping } from "../../types";
import { VIM_COMMAND } from "./vim-commands-repository";
import { IVimState, KeyBindingModes, VimOptions } from "./vim-types";
import { VimCore } from "./vimCore/VimCore";
import { VimInputHandler } from "./VimInputHandler";

const logger = new Logger("VimInit");

export class VimInit {
  public vimCore: VimCore;
  private options: VimOptions;

  public static readonly inject = [VimInputHandler];

  constructor(private vimInputHandler: VimInputHandler) {}

  public init(
    options?: VimOptions,
    mappings?: IKeyMappingMapping,
    additionalKeyBindings?: KeyBindingModes,
  ) {
    /*prettier-ignore*/ logger.culogger.debug(["[VimInit.ts,16] init: "], {log: false});
    this.vimInputHandler?.init(options, mappings, additionalKeyBindings);

    if (!options) return;
    this.options = options;
    this.vimInputHandler;
    this.vimCore = this.vimInputHandler.vimCore;
  }

  public executeCommandSequence(sequence: string): void {
    if (!this.vimInputHandler) console.log("Please call #init() first");
    this.vimInputHandler.executeCommandSequence(sequence);
  }

  public executeCommand(
    commandName: VIM_COMMAND,
    inputForCommand: string = "",
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

  public clear(): void {
    this.vimInputHandler.clearKeybord();
  }

  public getOptions() {
    return this.options;
  }
}
