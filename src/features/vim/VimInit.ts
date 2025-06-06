import { Logger } from "../../common/logging/logging";
import { IKeyMappingMapping } from "../../types";
import { VIM_COMMAND } from "./vim-commands-repository";
import { IVimState, KeyBindingModes, VimOptions } from "./vim-types";
import { VimCore } from "./vimCore/VimCore";
import { IVimInputHandlerV2, VimInputHandlerV2 } from "./VimInputHandlerV2";

const logger = new Logger("VimInit");

export class VimInit {
  public vimCore: VimCore;
  private options: VimOptions;

  // public static readonly inject = [VimInputHandler];
  public static readonly inject = [IVimInputHandlerV2];

  constructor(private vimInputHandlerV2: VimInputHandlerV2) {}

  public init(options?: VimOptions) {
    /*prettier-ignore*/ logger.culogger.debug(["[VimInit.ts,16] init: "], {log: false});

    if (!options) return;
    this.options = options;
    if (!options.vimId) return;
    this.vimCore = this.vimInputHandlerV2.getVimCore(options.vimId as any);
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
