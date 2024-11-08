import { DI, IContainer, Registration } from "aurelia";
import { Id } from "../../domain/types/types";
import { IKeyMappingMapping } from "../../types";
import { IVimState, KeyBindingModes, VimOptions } from "./vim-types";
import { getCallerFunctionName } from "../../common/modules/debugging";
import {
  IKeyMappingService,
  KeyMappingService,
  convertKeyMappingsToVimCommandMappings,
} from "./vimCore/commands/KeyMappingService";
import { VIM_COMMAND, VimCommand } from "./vim-commands-repository";
import { ShortcutService } from "../../common/services/ShortcutService";
import { VimCore } from "./vimCore/VimCore";
import { VimUi } from "./vim-ui/VimUi";
import { VimHelper } from "./VimHelper";
import { SelectionService } from "../../common/services/SelectionService";
import { cursorAllModes } from "./key-bindings";
import { SPACE } from "../../common/modules/keybindings/app-keys";
import { Logger } from "../../common/logging/logging";
import { debugFlags } from "../../common/modules/debug/debugFlags";

const l = new Logger("VimInputHandlerV2");

export type InputMap = Record<Id, KeyBindingModes>;
export interface KeyToCommandMap {
  mappings: IKeyMappingMapping;
  additionalKeyBindings: KeyBindingModes;
}
export interface RegisterOptions {
  reInit?: boolean;
}

export type IVimInputHandlerV2 = VimInputHandlerV2;
export const IVimInputHandlerV2 =
  DI.createInterface<IVimInputHandlerV2>("VimInputHandlerV2");

/**
 * Delegate mapping to command in the correct context
 */
export class VimInputHandlerV2 {
  private idHistory: Id[] = [];
  private inputMap: InputMap = {};
  private vimUi: VimUi;
  private vimCore: VimCore;

  public get activeId(): Id {
    const active = this.idHistory[this.idHistory.length - 1];
    return active;
  }

  public static register(container: IContainer) {
    Registration.singleton(IVimInputHandlerV2, VimInputHandlerV2).register(
      container,
    );

    const v = container.get(IVimInputHandlerV2);
    v.initEventHandlers();
    // @ts-ignore
    window.v = v;
  }

  public static readonly inject = [IKeyMappingService];
  constructor(private keyMappingService: IKeyMappingService) {}

  public registerAndInit(
    options: VimOptions,
    additionalKeyBindings?: KeyBindingModes,
    registerOptions: RegisterOptions = {},
  ): void {
    const { reInit: reload } = registerOptions;
    /*                                                                                           prettier-ignore*/ if(l.shouldLog(31))  console.log("additionalKeyBindings", additionalKeyBindings);
    const id = options.vimState?.id ?? options.vimId;
    /*                                                                                           prettier-ignore*/ if(l.shouldLog(31))  console.log("id", id);
    const already = this.inputMap[id];
    /*                                                                                           prettier-ignore*/ if(l.shouldLog(3))  console.log("already", already);
    if (already && !reload) return;

    this.pushIdToHistory(id);
    this.inputMap[id] = additionalKeyBindings;
    this.setVimCore(options);
    this.debugLogMappings(additionalKeyBindings);
  }

  public setActiveId(id: Id): void {
    /*prettier-ignore*/ if(l.shouldLog(3))  console.log("[VimInputHandlerV2.ts,52] id: ", id);
    this.pushIdToHistory(id);
    /*prettier-ignore*/ if(l.shouldLog(3))  console.log("[VimInputHandlerV2.ts,55] this.idHistory: ", this.idHistory);
  }

  public popId(): void {
    if (this.idHistory.length <= 1) return;
    this.idHistory.pop();
  }

  private pushIdToHistory(id: string) {
    const latestId = this.idHistory[this.idHistory.length - 1];
    const already = latestId === id;
    if (already) return;
    this.idHistory.push(id);
  }

  private initEventHandlers() {
    document.addEventListener("keydown", async (event) => {
      debugFlags.clearConsole && console.clear();
      /*                                                                                           prettier-ignore*/ if(l.shouldLog(3))  console.log("----------------------------: ", this.activeId, event);
      const mode = this.vimCore.getVimState().mode;
      if (!mode) return;

      const finalKeyWithModifier = ShortcutService.getKeyWithModifer(event);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog(30))  console.log("[VimInputHandlerV2.ts,110] finalKeyWithModifier: ", finalKeyWithModifier);
      const pressedKey = ShortcutService.getPressedKey(event);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog(4))  console.log("[VimInputHandlerV2.ts,112] pressedKey: ", pressedKey);
      const currentBindings = this.inputMap[this.activeId];
      /*                                                                                           prettier-ignore*/ if(l.shouldLog(36))  console.log("this.activeId", this.activeId);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog(46))  console.log("[VimInputHandlerV2.ts,90] currentBindings: ", currentBindings);
      const options = this.vimCore.options;
      options.keyBindings = currentBindings;
      const { command, commandName, commandSequence } =
        this.keyMappingService.prepareCommandV2(
          finalKeyWithModifier,
          mode,
          options,
        ) ?? {};
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([16, 13]))  console.log("command", command);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog(3))  console.log("commandName", commandName);
      let finalCommand = command;
      let finalPressedKey = pressedKey;
      if (commandName === VIM_COMMAND.repeatLastCommand) {
        finalCommand = this.keyMappingService.getLastCommand();
        finalPressedKey = this.keyMappingService.getLastKey();
      }

      let preventDefault = false;
      if (finalCommand?.execute) {
        const vimState = this.vimCore.getVimState();
        const response = await finalCommand.execute(
          mode,
          vimState,
          this.vimCore,
        );
        if (typeof response === "boolean") {
          preventDefault = response;
        }

        if (options?.hooks?.commandListener)
          options.hooks.commandListener({
            vimState: this.vimCore.getVimState(),
            targetCommand: VIM_COMMAND[finalCommand.command],
            targetCommandFull: finalCommand,
            keys: finalKeyWithModifier,
          });
      } else if (commandSequence) {
        const vimState = this.vimCore.executeCommandSequence(commandSequence);
        if (vimState) {
          this.updateVimState(vimState);

          if (options?.hooks?.commandListener)
            options.hooks.commandListener({
              vimState,
              targetCommand: VIM_COMMAND[finalCommand.command],
              targetCommandFull: finalCommand,
              keys: finalKeyWithModifier,
            });
        }
      } else if (finalCommand?.command) {
        const vimState = this.vimCore.executeCommand(
          VIM_COMMAND[finalCommand.command],
          finalPressedKey,
        );
        // if (!vimState) return; // issue: space in insert got too early returned

        /*                                                                                           prettier-ignore*/ if(l.shouldLog([33, 36]))  console.log("(vimState)", (vimState));
        if (vimState) {
          this.updateVimState(vimState);

          if (options?.hooks?.commandListener) {
            options.hooks.commandListener({
              vimState,
              targetCommand: VIM_COMMAND[finalCommand.command],
              targetCommandFull: finalCommand,
              keys: finalKeyWithModifier,
            });
          }
        }
      }

      if (finalCommand?.afterExecute) {
        const vimState = this.vimCore.getVimState();
        const response = await finalCommand?.afterExecute(
          mode,
          vimState,
          this.vimCore,
        );
        if (typeof response === "boolean") {
          preventDefault = response;
        }
      }

      VimHelper.switchModes(mode, {
        insert: () => {
          if (commandName) {
            ///*prettier-ignore*/ console.log("[VimInputHandler.ts,200] commandName: ", commandName);
            if (!preventDefault) return;
            event.preventDefault();
          }

          const isCursorMovementCommand = cursorAllModes.find(
            (command) => command.command === finalCommand?.command,
          );
          if (
            finalCommand &&
            finalCommand?.command !== VIM_COMMAND["space"] &&
            !isCursorMovementCommand
          )
            return;
          if (!options.hooks.onInsertInput) return; // mostly for custom insert mode, do this early return. In normal vim editor, insert should just be inside input/textarea thing
          const response = options.hooks.onInsertInput(finalPressedKey);
          if (response === true) {
            event.preventDefault();
          }
        },
        normal: () => {
          if (commandName) {
            // /*prettier-ignore*/ console.log("[VimInputHandler.ts,223] commandName: ", commandName);
            // /*prettier-ignore*/ console.log("[VimInputHandler.ts,225] preventDefault: ", preventDefault);
            if (!preventDefault) return;
            event.preventDefault();
          }
        },
        visual: () => {
          if (commandName) {
            if (!preventDefault) return;
            event.preventDefault();
          }
        },
      });

      if (pressedKey === SPACE) {
        event.preventDefault();
      }

      const saveLast =
        commandName !== VIM_COMMAND.repeatLastCommand &&
        !VimHelper.isModeChangingCommand(commandName);
      if (saveLast) {
        this.keyMappingService.setLastKey(finalKeyWithModifier);
        this.keyMappingService.setLastCommand(command);
      }
    });
  }

  private setVimCore(options: VimOptions) {
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
              args[0].vimState?.mode,
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
              const lines = this.vimUi.getTextFromHtml();
              newVimState.lines = lines;

              // this.vimUi.removeHtmlGeneratedNewLines(options);

              options.container.blur();
            },
          });

          if (options?.hooks?.modeChanged) {
            // /*prettier-ignore*/ console.log(">>[VimInputHandler.ts,96] args[0].vimState.lines.length: ", args[0].vimState.lines.length);
            options.hooks.modeChanged(...args);
          }

          this.vimCore.setVimState(vimState);
          this.vimUi.update(vimState);
        },
      },
    });
    vimCore.init();

    this.vimUi = new VimUi(vimCore.getVimState(), options);
    this.vimCore = vimCore;
    if (options?.hooks?.afterInit) options.hooks.afterInit(this.vimCore);
  }

  private updateVimState(vimState: IVimState) {
    this.vimUi.update(vimState);
  }

  private debugLogMappings(additionalKeyBindings: KeyBindingModes): void {
    Object.entries(additionalKeyBindings).forEach(([mode, binding]) => {
      const typedBinding = binding as VimCommand[];
      const mapped = typedBinding.map((b) =>
        [b.context ?? "", (b.key ?? "").padEnd(17), b.command].join(", "),
      );
      const joined = mapped;
      const log = JSON.stringify(joined, null, 2);
      /*prettier-ignore*/ l.shouldLog(5) && console.log("[VimInputHandlerV2.ts,103] log: ",mode,  log);
    });
  }
}
