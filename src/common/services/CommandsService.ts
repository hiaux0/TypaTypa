import { DI, resolve } from "aurelia";
import { Logger } from "../logging/logging";
import {
  VIM_COMMAND,
  VimCommand,
} from "../../features/vim/vim-commands-repository";
import {
  IVimState,
  KeyBindingModes,
  VimMode,
} from "../../features/vim/vim-types";
import { isEnter } from "../../features/vim/key-bindings";
import { VimCore } from "../../features/vim/vimCore/VimCore";
import {
  IKeyMappingService,
  KeyMappingService,
  addKeysToBindings,
  addKeysToKeybindingsAllModes,
  enhanceWithIdsAndMode,
  overwriteKeybindingsV2,
} from "../../features/vim/vimCore/commands/KeyMappingService";
import { hashStringArray } from "../modules/strings";

const l = new Logger("CommandsService");

export type ICommandsService = CommandsService;
export const ICommandsService = DI.createInterface<ICommandsService>(
  "CommandsService",
  (x) => x.singleton(CommandsService),
);

export function createCommandId(command: VimCommand): string | undefined {
  const id = hashStringArray(
    command.desc,
    command.key,
    command.command,
    command.context?.join(","),
    command.sequence,
  );
  return id;
}

export class CommandsService {
  public commandsRepository: Record<string, any> = {};
  public createId = createCommandId;

  constructor(
    private keyMappingService: KeyMappingService = resolve(IKeyMappingService),
  ) {}

  public registerCommands(
    context: string | undefined,
    commands: KeyBindingModes,
  ): void {
    if (!context) return;
    const merged = addKeysToKeybindingsAllModes(
      commands,
      this.keyMappingService.keyBindings,
    );
    const enhanced = enhanceWithIdsAndMode(merged);
    this.commandsRepository[context] = enhanced;
  }

  public getCommand(
    context: string,
    command: VimCommand,
  ): VimCommand | undefined {
    const mode = command.mode;
    if (!mode) return;
    const commandInRepo = this.commandsRepository[context][mode].find(
      (c: VimCommand) => c.id === command.id,
    );
    return commandInRepo;
  }

  public updateCommand(context: string, command: VimCommand): void {
    const commandInRepo = this.commandsRepository[context].find(
      (c: VimCommand) => c.command === command.command,
    );
    /*prettier-ignore*/ console.log("[CommandsService.ts,46] commandInRepo: ", commandInRepo);
  }

  public async executeCommand(vimCore: VimCore, finalCommand: VimCommand) {
    let vimState: IVimState;
    // const allowHook = mode === VimMode.INSERT && !isEnter(finalPressedKey);
    const mode = vimCore.getVimState().mode;
    if (finalCommand?.execute) {
      vimState = vimCore.getVimState();
      await finalCommand.execute(mode, vimState, vimCore);

      //if (options?.hooks?.commandListener && allowHook)
      //  options.hooks.commandListener({
      //    vimState: vimCore.getVimState(),
      //    targetCommand: VIM_COMMAND[finalCommand.command],
      //    targetCommandFull: finalCommand,
      //    keys: finalKeyWithModifier,
      //  });
    }

    if (finalCommand?.afterExecute) {
      // const vimState = vimCore.getVimState();
      await finalCommand?.afterExecute();
    }
  }
}
