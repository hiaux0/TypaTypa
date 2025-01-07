import {
  VimOptions,
  IVimState,
  VimExecutingMode,
  QueueInputReturn,
} from "../vim-types";
import { VimCommandManager as VimCommandManager } from "./commands/VimCommandManager";
import { VIM_COMMAND } from "../vim-commands-repository";
import { ShortcutService } from "../../../common/services/ShortcutService";
import { KeyMappingService } from "./commands/KeyMappingService";
import { VimStateClass } from "../vim-state";
import { Logger } from "../../../common/logging/logging";

const logger = new Logger("VimCore");

export class VimCore {
  private vimState: IVimState;
  public manager: VimCommandManager;
  private keyMappingService: KeyMappingService;

  constructor(public options?: VimOptions) {
    Object.assign(this, options);
    this.options = options;
    if (!this.options?.vimState) {
      this.vimState = VimStateClass.createEmpty().serialize();
    }
    this.manager = VimCommandManager.create(this.options);
    this.manager.setInternalVimState(this.vimState);
    this.keyMappingService = new KeyMappingService();
  }

  static create(options?: VimOptions) {
    return new VimCore(options);
  }

  init() {}

  public getVimState() {
    return structuredClone(this.vimState);
  }

  public setVimState(vimState?: IVimState) {
    if (!vimState) return;
    this.vimState = vimState;

    if (!this.options?.hooks?.vimStateUpdated) return;
    this.options.hooks.vimStateUpdated(this.vimState);
  }

  public executeCommand(
    commandName: VIM_COMMAND,
    /**
     * Todo: Clarify what input for command is, maybe give examples.
     * Eg. A usage place is passing `pressedKey` here
     */
    inputForCommand: string,
  ): IVimState | undefined {
    const result = this.manager.executeCommand(
      this.vimState,
      commandName,
      inputForCommand,
    );
    // /*prettier-ignore*/ console.log("[VimCore.ts,58] result.lines.length;: ", result.lines.length);
    if (!result) return;
    this.setVimState(result);
    return result;
  }

  public executeCommandSequence(sequence: string): IVimState | undefined {
    const splitSequence = ShortcutService.splitInputSequence(sequence);
    const mode = this.getVimState().mode;
    if (!mode) return;

    const resultList: IVimState[] = [];
    splitSequence.forEach((key) => {
      /*prettier-ignore*/ console.log("[VimCore.ts,72] this.keyMappingService.id: ", this.keyMappingService.id);
      const { targetCommand: command } =
        this.keyMappingService.prepareCommandV2(key, mode) ?? {};
      if (!command?.command) return;
      const commandName = VIM_COMMAND[command.command];
      if (!commandName) return;

      const result = this.executeCommand(commandName, key);
      if (!result) return;
      resultList.push(result);
    });

    const lastResult = resultList[resultList.length - 1];
    return lastResult;
  }

  private queueInput(input: string): QueueInputReturn | undefined {
    const { targetCommand: prepared } =
      this.keyMappingService.prepareCommandV2(input, this.getVimState().mode) ??
      {};
    if (!prepared?.command) return;

    const result: QueueInputReturn = {
      vimState: this.getVimState(),
      targetCommand: VIM_COMMAND[prepared.command],
      targetCommandFull: prepared,
      keys: input,
    };

    return result;
  }

  /** */
  public async queueInputSequence(
    inputSequence: string | string[],
    vimExecutingMode: VimExecutingMode = VimExecutingMode.INDIVIDUAL,
  ): Promise<QueueInputReturn[]> {
    const resultList: QueueInputReturn[] = [];
    let givenInputSequence: string[];

    if (typeof inputSequence === "string") {
      givenInputSequence = ShortcutService.splitInputSequence(inputSequence);
    } else {
      givenInputSequence = inputSequence;
    }

    await Promise.all(
      givenInputSequence.map(async (input) => {
        const subResult = this.queueInput(input);
        if (subResult?.targetCommand !== undefined) {
          resultList.push(subResult);
        }
      }),
    );

    if (vimExecutingMode === VimExecutingMode.INDIVIDUAL) {
      return resultList;
    }

    return this.manager.batchResults(resultList);
  }
}
