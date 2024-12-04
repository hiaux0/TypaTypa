import { DI, IContainer, Registration } from "aurelia";
import { Id } from "../../domain/types/types";
import { InputMap, InstancesMap, RegisterOptions } from "../../types";
import { IVimState, KeyBindingModes, VimMode, VimOptions } from "./vim-types";
import {
  IKeyMappingService,
  overwriteKeybindingsV2,
} from "./vimCore/commands/KeyMappingService";
import { VIM_COMMAND, VimCommand } from "./vim-commands-repository";
import { ShortcutService } from "../../common/services/ShortcutService";
import { VimCore } from "./vimCore/VimCore";
import { VimUi } from "./vim-ui/VimUi";
import { VimHelper } from "./VimHelper";
import { SelectionService } from "../../common/services/SelectionService";
import { cursorAllModes, isEnter } from "./key-bindings";
import { SPACE } from "../../common/modules/keybindings/app-keys";
import { Logger } from "../../common/logging/logging";
import { debugFlags } from "../../common/modules/debug/debugFlags";
import { VIM_ID_MAP } from "../../common/modules/constants";
import {
  CommandsService,
  ICommandsService,
} from "../../common/services/CommandsService";

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
  public inputMap: InputMap = {};
  public vimCore: VimCore;
  private idHistory: Id[] = [];
  private instancesMap: InstancesMap = {};
  private vimUi: VimUi;

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

  public static readonly inject = [IKeyMappingService, ICommandsService];
  constructor(
    private keyMappingService: IKeyMappingService,
    private commandsService: CommandsService,
  ) {}

  public registerAndInit(
    options: VimOptions,
    additionalKeyBindings?: KeyBindingModes,
    registerOptions: RegisterOptions = {},
  ): void {
    const { reInit: reload } = registerOptions;
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("additionalKeyBindings", additionalKeyBindings);
    const id = options.vimState?.id ?? options.vimId;
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("id", id);
    const already = this.inputMap[id];
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("already", already);
    if (already && !reload) return;

    if (id !== VIM_ID_MAP.global) this.pushIdToHistory(id);
    this.inputMap[id] = additionalKeyBindings;
    this.instancesMap[id] = { options };
    this.initVimCore(options);
    this.debugLogMappings(additionalKeyBindings);
  }

  public setActiveId(id: Id): void {
    /*prettier-ignore*/ if(l.shouldLog([])) console.log("[VimInputHandlerV2.ts,52] id: ", id);
    this.pushIdToHistory(id);
    /*prettier-ignore*/ if(l.shouldLog([])) console.log("[VimInputHandlerV2.ts,55] this.idHistory: ", this.idHistory);
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

  private pushIdToHistory(id: string) {
    const latestId = this.idHistory[this.idHistory.length - 1];
    const already = latestId === id;
    if (already) return;
    this.idHistory.push(id);
  }

  private initVimCore(options: VimOptions) {
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
              const lines = this.vimUi.getTextFromHtml();
              newVimState.lines = lines;

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
    this.vimCore = vimCore;
    if (options?.hooks?.afterInit) options.hooks.afterInit(this.vimCore);
  }

  private initEventHandlers() {
    document.addEventListener("keydown", async (event) => {
      debugFlags.clearConsole && console.clear();

      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("----------------------------: ", this.activeId, event);
      const mode = this.vimCore?.getVimState().mode;
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("mode", mode);
      if (!mode) return;
      const id = this.vimCore?.getVimState().id;
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("id", id);

      const finalKeyWithModifier = ShortcutService.getKeyWithModifer(event);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("[VimInputHandlerV2.ts,110] finalKeyWithModifier: ", finalKeyWithModifier);
      const pressedKeyWithoutModifier = ShortcutService.getPressedKey(event);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("[VimInputHandlerV2.ts,112] pressedKey: ", pressedKeyWithoutModifier);

      const currentBindings = this.inputMap[this.activeId];
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("this.activeId", this.activeId);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("[VimInputHandlerV2.ts,223] mergedWithGlobal: ", currentBindings);
      const options = this.vimCore.options;
      options.keyBindings = currentBindings;
      const command = this.keyMappingService.prepareCommandV2(
        finalKeyWithModifier,
        mode,
        options,
      );
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("command", command);
      let finalCommand = command;
      let finalPressedKey = pressedKeyWithoutModifier;
      if (!command) {
        const globalBindings = this.inputMap[VIM_ID_MAP.global];
        options.keyBindings = globalBindings;
        const globalCommand = this.keyMappingService.prepareCommandV2(
          finalKeyWithModifier,
          mode,
          options,
        );
        finalCommand = globalCommand;
      }

      const commandName = VIM_COMMAND[finalCommand?.command];
      const commandSequence = finalCommand?.sequence;
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("commandName", commandName);
      if (commandName === VIM_COMMAND.repeatLastCommand) {
        finalCommand = this.keyMappingService.getLastCommand();
        finalPressedKey = this.keyMappingService.getLastKey();
      }
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("finalCommand", finalCommand);

      let preventDefault = false;
      let vimState: IVimState;
      const allowHook = mode === VimMode.INSERT && !isEnter(finalPressedKey);
      if (finalCommand?.execute) {
        vimState = this.vimCore.getVimState();
        const response = await finalCommand.execute(
          mode,
          vimState,
          this.vimCore,
        );
        if (typeof response === "boolean") {
          preventDefault = response;
        }

        if (options?.hooks?.commandListener && allowHook)
          options.hooks.commandListener({
            vimState: this.vimCore.getVimState(),
            targetCommand: VIM_COMMAND[finalCommand.command],
            targetCommandFull: finalCommand,
            keys: finalKeyWithModifier,
          });
      } else if (commandSequence) {
        vimState = this.vimCore.executeCommandSequence(commandSequence);
        if (vimState) {
          this.updateVimState(vimState);

          if (options?.hooks?.commandListener && allowHook)
            options.hooks.commandListener({
              vimState,
              targetCommand: VIM_COMMAND[finalCommand.command],
              targetCommandFull: finalCommand,
              keys: finalKeyWithModifier,
            });
        }
      } else if (finalCommand?.command) {
        vimState = this.vimCore.executeCommand(
          VIM_COMMAND[finalCommand.command],
          finalPressedKey,
        );
        // if (!vimState) return; // issue: space in insert got too early returned

        /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("(vimState)", (vimState));
        if (vimState) {
          this.updateVimState(vimState);

          if (options?.hooks?.commandListener && allowHook) {
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
          // console.log("1");
          if (commandName) {
            ///*prettier-ignore*/ console.log("[VimInputHandler.ts,200] commandName: ", commandName);
            if (preventDefault) {
              event.preventDefault();
            }
          }

          const isCursorMovementCommand = cursorAllModes.find(
            (command) => command.command === finalCommand?.command,
          );
          // console.log("2");
          //if (
          //  finalCommand &&
          //  finalCommand?.command !== VIM_COMMAND["space"] &&
          //  !isCursorMovementCommand
          //) {
          //  return;
          //}

          // console.log("3");
          if (options.hooks.onInsertInput) {
            const response = options.hooks.onInsertInput(finalPressedKey);
            // return;
            // mostly for custom insert mode, do this early return. In normal vim editor, insert should just be inside input/textarea thing
            // console.log("4");
            // /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,300] response: ", response);
            if (response === true) {
              event.preventDefault();
            }
          }
        },
        normal: () => {
          if (pressedKeyWithoutModifier === SPACE) {
            event.preventDefault();
          }
          if (commandName) {
            // /*prettier-ignore*/ console.log("[VimInputHandler.ts,223] commandName: ", commandName);
            // /*prettier-ignore*/ console.log("[VimInputHandler.ts,225] preventDefault: ", preventDefault);
            if (!preventDefault) return;
            event.preventDefault();
          }
        },
        visual: () => {
          if (pressedKeyWithoutModifier === SPACE) {
            event.preventDefault();
          }
          if (commandName) {
            if (!preventDefault) return;
            event.preventDefault();
          }
        },
      });

      const saveLast =
        commandName !== VIM_COMMAND.repeatLastCommand &&
        !VimHelper.isModeChangingCommand(commandName);
      if (saveLast) {
        this.keyMappingService.setLastKey(finalKeyWithModifier);
        this.keyMappingService.setLastCommand(command);
      }
    });
  }

  //private handleEnter(key: string): boolean {
  //  const vimState = this.vimCore.getVimState();
  //  const correctOptions = this.instancesMap[this.activeId].options;
  //  const $lines = correctOptions.container.querySelectorAll(".vim-line");
  //  if (isEnter(key)) {
  //    const selection = window.getSelection();
  //    const range = selection.getRangeAt(0);
  //    const cursor = range.startOffset;
  //    const $currentLine = Array.from($lines)[
  //      vimState.cursor.line
  //    ] as HTMLElement;
  //    const text = $currentLine.innerText;
  //
  //    const beforeText = text.slice(0, cursor);
  //    /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,346] beforeText: ", beforeText);
  //    const afterText = text.slice(cursor);
  //    /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,348] afterText: ", afterText);
  //
  //    /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,350] currentLine: ", $currentLine);
  //
  //    // $currentLine.innerText = beforeText;
  //    // vimState.lines[vimState.cursor.line] = { text: beforeText };
  //    vimState.lines.push({ text: afterText });
  //    // this.vimInit.vimCore.setVimState(vimState);
  //    this.updateVimState(vimState);
  //    return;
  //  }
  //}

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
      /*prettier-ignore*/ l.shouldLog(5) && console.log("[VimInputHandlerV2.ts,103] log: ",mode,  log);
    });
  }
}
