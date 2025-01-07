import { DI, IContainer, Registration } from "aurelia";
import { IKeyData, InstancesMap, VimIdMapKeys } from "../../types";
import {
  FindPotentialCommandReturn,
  IVimState,
  KeyBindingModes,
  VimMode,
  VimOptions,
} from "./vim-types";
import {
  IKeyMappingService,
  KeyMappingService,
} from "./vimCore/commands/KeyMappingService";
import { VIM_COMMAND, VimCommand } from "./vim-commands-repository";
import { ShortcutService } from "../../common/services/ShortcutService";
import { VimCore } from "./vimCore/VimCore";
import { VimUi } from "./vim-ui/VimUi";
import { VimHelper } from "./VimHelper";
import { SelectionService } from "../../common/services/SelectionService";
import { SPACE } from "../../common/modules/keybindings/app-keys";
import { Logger } from "../../common/logging/logging";
import { debugFlags } from "../../common/modules/debug/debugFlags";
import { VIM_ID_MAP } from "../../common/modules/constants";
import {
  CommandsService,
  ICommandsService,
} from "../../common/services/CommandsService";
import { isEnter } from "./key-bindings";

const l = new Logger("VimInputHandlerV2");

export type IVimInputHandlerV2 = VimInputHandlerV2;
export const IVimInputHandlerV2 = DI.createInterface<IVimInputHandlerV2>(
  "VimInputHandlerV2",
  (x) => x.singleton(VimInputHandlerV2),
);

/**
 * Delegate mapping to command in the correct context
 */
export class VimInputHandlerV2 {
  public idHistory: VimIdMapKeys[] = [];
  private instancesMap: InstancesMap = {};
  private vimUi: VimUi;

  public get activeId(): VimIdMapKeys {
    const active = this.idHistory[this.idHistory.length - 1];
    return active;
  }

  public get vimCore(): VimCore {
    return this.getVimCore(this.activeId);
  }

  public static register(container: IContainer) {
    Registration.singleton(IVimInputHandlerV2, VimInputHandlerV2).register(
      container,
    );

    const v = container.get(IVimInputHandlerV2);
    v.initEventHandlersV2();
    // @ts-ignore
    window.v = v;
  }

  public static readonly inject = [IKeyMappingService, ICommandsService];
  constructor(
    private keyMappingService: KeyMappingService,
    private commandsService: CommandsService,
  ) {}

  public getInstanceMap(id: VimIdMapKeys): InstancesMap[string] {
    return this.instancesMap[id];
  }
  public getVimCore(id: VimIdMapKeys): VimCore {
    ///*prettier-ignore*/ console.log("3.1 [VimInputHandlerV2.ts,80] id: ", id);
    ///*prettier-ignore*/ console.log("3.2 [VimInputHandlerV2.ts,82] this.instancesMap: ", this.instancesMap);
    return this.instancesMap[id].vimCore;
  }
  public setVimCore(id: VimIdMapKeys, vimCore: VimCore) {
    this.instancesMap[id].vimCore = vimCore;
  }

  public registerAndInit(options: VimOptions): void {
    const id = (options.vimId ?? options.vimState?.id ?? "") as VimIdMapKeys;
    ///*prettier-ignore*/ console.log("0.1 ----------------------------");
    ///*prettier-ignore*/ console.log("0.2 [VimInputHandlerV2.ts,88] id: ", id);
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("id", id);
    if (id !== VIM_ID_MAP.global) this.pushIdToHistory(id);
    const vimCore = this.initVimCore(options);
    this.instancesMap[id] = { options, vimCore };
  }

  public setActiveId(id: VimIdMapKeys): void {
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([5])) console.log("[VimInputHandlerV2.ts,52] id: ", id);
    this.pushIdToHistory(id);
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([5])) console.log("[VimInputHandlerV2.ts,55] this.idHistory: ", this.idHistory);
  }

  public popId(): void {
    if (this.idHistory.length <= 1) return;
    this.idHistory.pop();
  }

  public popIdIf(id: string): void {
    const is = this.idHistory[this.idHistory.length - 1] === id;
    if (is) this.popId();
  }

  public executeCommandSequence(sequence: string): void {
    this.vimCore.executeCommandSequence(sequence);
  }

  public executeCommand(
    commandName: VIM_COMMAND,
    inputForCommand: string,
  ): IVimState | undefined {
    const result = this.vimCore.executeCommand(commandName, inputForCommand);
    return result;
  }

  public reload(vimState: IVimState) {
    this.updateVimState(vimState);
    this.vimCore.setVimState(vimState);
    // this.clearKeybord();
    // this.initKeyboard();
  }

  private pushIdToHistory(id: VimIdMapKeys) {
    const latestId = this.idHistory[this.idHistory.length - 1];
    const already = latestId === id;
    if (already) return;
    // /*prettier-ignore*/ console.log("2.1 [VimInputHandlerV2.ts,136] id: ", id);
    this.idHistory.push(id);
    // /*prettier-ignore*/ console.log("2.2 [VimInputHandlerV2.ts,137] this.idHistory: ", this.idHistory);
  }

  private initVimCore(options: VimOptions): VimCore {
    const keyBindings = this.keyMappingService.keyBindings;
    const vimCore = VimCore.create({
      keyBindings,
      ...options,
      hooks: {
        ...options?.hooks,
        modeChanged: (...args) => {
          const { vimState } = args[0];
          // /*prettier-ignore*/ console.log("> [VimInputHandler.ts,57] vimState.lines.length: ", vimState.lines.length);
          const newVimState = vimState;
          if (!newVimState) return;
          if (!newVimState.mode) return;
          // For now: early return when same mode
          if (
            !VimHelper.hasModeChanged(
              this.vimCore.getVimState().mode,
              vimState.mode,
            )
          ) {
            return;
          }
          VimHelper.switchModes(newVimState.mode, {
            insert: () => {
              this.vimUi.enterInsertMode(newVimState.cursor);
            },
            normal: () => {
              if (!options?.container) return;
              /** Cursor */
              const cursor = SelectionService.getCursorFromSelection(
                options.container,
              );
              if (!cursor) return;
              if (cursor.line !== -1) {
                newVimState.cursor = cursor;
              }

              /** Lines */
              //const lines = this.vimUi.getTextFromHtml();
              ///*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,170] lines: ", lines);
              //newVimState.lines = lines;

              // this.vimUi.removeHtmlGeneratedNewLines(options);

              options.container.blur();
            },
          });

          if (options?.hooks?.modeChanged) {
            // /*prettier-ignore*/ console.log(">>[VimInputHandler.ts,96] args[0].vimState.lines.length: ", args[0].vimState.lines.length);
            const updatedArgs = args;
            updatedArgs[0].vimState = newVimState;
            options.hooks.modeChanged(...updatedArgs);
          }

          this.vimCore.setVimState(newVimState);
          this.vimUi.update(newVimState);
        },
      },
    });
    vimCore.init();
    this.vimUi = new VimUi(vimCore.getVimState(), options);
    if (options?.hooks?.afterInit) options.hooks.afterInit(vimCore);

    return vimCore;
  }

  private initEventHandlersV2() {
    document.addEventListener("keydown", async (event) => {
      debugFlags.clearConsole && console.clear();
      // /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,375] this.idHistory: ", this.idHistory);
      // /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,379] this.activeId: ", this.activeId);
      const activeInstance = this.getInstanceMap(this.activeId);

      // 1. Event -> Keys + Modifiers
      const keyData = this.getKeyData(event);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([,,3])) console.log("keyData", keyData);
      // 2. Keys + Modifiers -> Command
      const options = activeInstance.options;
      const { targetCommand: command, potentialCommands } =
        this.getCommand(keyData, options) ?? {};
      //if (potentialCommands?.length) {
      //  event.preventDefault();
      //}
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([,,3])) console.log("command", command);
      // 3. Command -> Action
      const { vimState, preventDefault } = await this.executeCommandForListener(
        command,
        keyData,
        options,
      );
      if (preventDefault) event.preventDefault();

      const commandName = VIM_COMMAND[command?.command ?? "nothing"];
      if (!vimState) return;
      const mode = vimState.mode;
      VimHelper.switchModes(mode, {
        insert: () => {
          if (commandName) {
            if (preventDefault) {
              event.preventDefault();
            }
          }
          if (options?.hooks?.onInsertInput) {
            const response = options.hooks.onInsertInput(keyData.composite);
            if (response === true) {
              event.preventDefault();
            }
          }
        },
        normal: () => {
          if (keyData.key === SPACE) {
            event.preventDefault();
          }
          if (commandName) {
            if (!preventDefault) return;
            event.preventDefault();
          }
        },
        visual: () => {
          if (keyData.key === SPACE) {
            event.preventDefault();
          }
          if (commandName) {
            if (!preventDefault) return;
            event.preventDefault();
          }
        },
      });
    });
  }

  private getKeyData(event: KeyboardEvent): IKeyData {
    const { collectedModifiers } = ShortcutService.assembleModifiers(event);
    const pressedKeyWithoutModifier = ShortcutService.getPressedKey(event);
    return {
      key: pressedKeyWithoutModifier,
      modifiers: collectedModifiers,
      composite: `${collectedModifiers.join("")}${pressedKeyWithoutModifier}`,
    };
  }

  private getCommand(
    keyData: IKeyData,
    options: VimOptions,
  ): FindPotentialCommandReturn | undefined {
    const vimId = options.vimId;
    if (!vimId) throw new Error("No context provided");
    const currentBindings = this.commandsService.commandsRepository[vimId];
    options.keyBindings = currentBindings;
    const mode = this.vimCore.getVimState().mode;
    const result = this.keyMappingService.prepareCommandV2(
      keyData.composite,
      mode,
      options,
    );
    let { targetCommand: finalCommand, potentialCommands } = result ?? {};
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([3,,3])) console.log("command", finalCommand);
    let finalPressedKey = keyData.key;
    const hasQueuedKeys = this.keyMappingService.queuedKeys.length;
    if (!finalCommand && !hasQueuedKeys) {
      const globalBindings =
        this.commandsService.commandsRepository[VIM_ID_MAP.global];
      if (options?.keyBindings) options.keyBindings = globalBindings;
      const preparedCommands = this.keyMappingService.prepareCommandV2(
        keyData.composite,
        mode,
        options,
      );
      if (preparedCommands) {
        finalCommand = preparedCommands.targetCommand;
        potentialCommands = preparedCommands.potentialCommands;
      }
    }
    const commandName = VIM_COMMAND[finalCommand?.command ?? "nothing"];
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("commandName", commandName);
    if (commandName === VIM_COMMAND.repeatLastCommand) {
      finalCommand = this.keyMappingService.getLastCommand();
      finalPressedKey = this.keyMappingService.getLastKey();
    }

    /*                                                                                           prettier-ignore*/ if(l.shouldLog([,,2])) console.log("[] Repeating");
    const saveLast =
      commandName !== VIM_COMMAND.repeatLastCommand &&
      !VimHelper.isModeChangingCommand(commandName);
    if (saveLast) {
      this.keyMappingService.setLastKey(keyData.composite);
      if (finalCommand) this.keyMappingService.setLastCommand(finalCommand);
    }

    return {
      targetCommand: finalCommand,
      potentialCommands: potentialCommands ?? [],
    };
  }

  private async executeCommandForListener(
    command: VimCommand | undefined,
    keyData: IKeyData,
    options: VimOptions,
  ): Promise<{ vimState: IVimState | undefined; preventDefault: boolean }> {
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([,,2])) console.log("[] Start of command execution");
    let preventDefault = false;
    let vimState: IVimState | undefined;
    const mode = this.vimCore.getVimState().mode;
    const finalPressedKey = keyData.key;
    const finalKeyWithModifier = keyData.composite;
    const commandSequence = command?.sequence;
    const allowHook = mode !== VimMode.INSERT && !isEnter(finalPressedKey);
    if (command?.execute) {
      const response = await command.execute(mode, vimState, this.vimCore);
      if (typeof response === "boolean") {
        preventDefault = response;
      }

      if (false && options?.hooks?.commandListener && allowHook) {
        options.hooks?.commandListener?.({
          vimState: this.vimCore.getVimState(),
          targetCommand: VIM_COMMAND[command?.command ?? "nothing"],
          targetCommandFull: command,
          keys: finalKeyWithModifier,
        });
      }
    } else if (commandSequence) {
      vimState = this.vimCore.executeCommandSequence(commandSequence);
      if (vimState) {
        this.updateVimState(vimState);

        if (options?.hooks?.commandListener && allowHook)
          options.hooks.commandListener({
            vimState,
            targetCommand: VIM_COMMAND[command?.command ?? "nothing"],
            targetCommandFull: command,
            keys: finalKeyWithModifier,
          });
      }
    } else if (command?.command) {
      vimState = this.vimCore.executeCommand(
        VIM_COMMAND[command.command],
        finalPressedKey,
      );
      // if (!vimState) return; // issue: space in insert got too early returned
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("(vimState)", (vimState));
      if (vimState) {
        this.updateVimState(vimState);

        if (options?.hooks?.commandListener && allowHook) {
          options.hooks.commandListener({
            vimState,
            targetCommand: VIM_COMMAND[command.command],
            targetCommandFull: command,
            keys: finalKeyWithModifier,
          });
        }
      }
    }

    /*                                                                                           prettier-ignore*/ if(l.shouldLog([,,2])) console.log("[] After command execution");
    if (command?.afterExecute) {
      const vimState = this.vimCore.getVimState();
      const response = await command?.afterExecute(
        mode,
        vimState,
        this.vimCore,
      );
      if (typeof response === "boolean") {
        preventDefault = response;
      }
    }

    return { vimState, preventDefault };
  }

  private updateVimState(vimState: IVimState) {
    this.vimUi.update(vimState);
  }

  private debugLogMappings(additionalKeyBindings: KeyBindingModes): void {
    if (!additionalKeyBindings) return;
    Object.entries(additionalKeyBindings).forEach(([mode, binding]) => {
      const typedBinding = binding as VimCommand[];
      const mapped = typedBinding.map((b) =>
        [b.context ?? "", (b.key ?? "").padEnd(17), b.command].join(", "),
      );
      const joined = mapped;
      const log = JSON.stringify(joined, null, 2);
      // /*prettier-ignore*/ l.shouldLog(5) && console.log("[VimInputHandlerV2.ts,103] log: ",mode,  log);
    });
  }
}
