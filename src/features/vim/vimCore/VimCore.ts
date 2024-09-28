 
import { VimOptions, IVimState } from "../vim-types";
import { VimCommandManager as VimCommandManager } from "./commands/VimCommandManager";
import { VIM_COMMAND } from "../vim-commands-repository";
import { ShortcutService } from "../../../common/services/ShortcutService";
import { KeyMappingService } from "./commands/KeyMappingService";

export class VimCore {
  private vimState: IVimState;
  private manager: VimCommandManager;

  constructor(private options?: VimOptions) {
    Object.assign(this, options);
    this.options = options;
    this.manager = VimCommandManager.create(this.options);
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
      const { commandName } = KeyMappingService.prepareCommand(key, mode) ?? {};
      if (!commandName) return;

      const result = this.executeCommand(commandName, key);
      if (!result) return;
      resultList.push(result);
    });

    const lastResult = resultList[resultList.length - 1];
    return lastResult;
  }
}
