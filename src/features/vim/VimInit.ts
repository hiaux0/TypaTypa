import { Logger } from "../../common/logging/logging";
import { IKeyMappingMapping } from "../../types";
import { VIM_COMMAND } from "./vim-commands-repository";
import { IVimState, KeyBindingModes, VimOptions } from "./vim-types";
import { VimCore } from "./vimCore/VimCore";
import { VimInputHandler } from "./VimInputHandler";
import { IVimInputHandlerV2, VimInputHandlerV2 } from "./VimInputHandlerV2";

const logger = new Logger("VimInit");

export class VimInit {
  public vimCore: VimCore;
  private options: VimOptions;

  // public static readonly inject = [VimInputHandler];
  public static readonly inject = [IVimInputHandlerV2];

  constructor(private vimInputHandlerV2: VimInputHandlerV2) {}

  public init(
    options?: VimOptions,
    mappings?: IKeyMappingMapping,
    additionalKeyBindings?: KeyBindingModes,
  ) {
    // /*prettier-ignore*/ console.trace("[VimInit.ts,26] init: ");
    /*prettier-ignore*/ logger.culogger.debug(["[VimInit.ts,16] init: "], {log: false});
    // this.vimInputHandlerV2?.init(options, mappings, additionalKeyBindings);

    if (!options) return;
    this.options = options;
    this.vimInputHandlerV2;
    this.vimCore = this.vimInputHandlerV2.vimCore;
  }

  public executeCommandSequence(sequence: string): void {
    if (!this.vimInputHandlerV2) console.log("Please call #init() first");
    this.vimInputHandlerV2.executeCommandSequence(sequence);
  }

  public executeCommand(
    commandName: VIM_COMMAND,
    inputForCommand: string = "",
  ): IVimState | undefined {
    if (!this.vimInputHandlerV2)
      throw "[ERROR:VimInit] Please call #init() first";
    const result = this.vimInputHandlerV2.executeCommand(
      commandName,
      inputForCommand,
    );
    return result;
  }

  public reload(vimState: IVimState) {
    this.vimInputHandlerV2.reload(vimState);
  }

  public clear(): void {
    // this.vimInputHandlerV2.clearKeybord();
  }

  public getOptions() {
    return this.options;
  }
}
