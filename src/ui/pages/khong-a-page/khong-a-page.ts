import { VimStateClass } from "../../../features/vim/vim-state";
import {
  Cursor,
  IVimState,
  VimMode,
  VimOptions,
} from "../../../features/vim/vim-types";
import "./khong-a-page.scss";
import { Logger } from "../../../common/logging/logging";
import { debugFlags } from "../../../common/modules/debug/debugFlags";
import { ShortcutService } from "../../../common/services/ShortcutService";
import { ICommandsService } from "../../../common/services/CommandsService";
import { resolve } from "aurelia";
import { VIM_ID_MAP } from "../../../common/modules/constants";
import { IKeyMappingService } from "../../../features/vim/vimCore/commands/KeyMappingService";
import {
  VIM_COMMAND,
  VimCommand,
} from "../../../features/vim/vim-commands-repository";
import { VimHelper } from "../../../features/vim/VimHelper";
import { isEnter } from "../../../features/vim/key-bindings";
import { VimCore } from "../../../features/vim/vimCore/VimCore";
import { VimUi } from "../../../features/vim/vim-ui/VimUi";
import { SelectionService } from "../../../common/services/SelectionService";

const l = new Logger("KhongAPage");

interface IKeyData {
  key: string;
  modifiers: string[];
  composite: string;
}

export class KhongAPage {
  public containerRef: HTMLElement;
  public textareaTextContainerRef: HTMLElement;
  public textareaRef: HTMLTextAreaElement;
  public cursorRef: HTMLElement;
  public vimState: IVimState;
  public textValue = "Hello world\n\nokayyy";
  public debugFlags = debugFlags;

  private vimUi: VimUi;
  private vimCore: VimCore;

  public get showTextarea(): boolean {
    return this.vimState?.mode === VimMode.INSERT;
  }

  constructor(
    private commandsService = resolve(ICommandsService),
    private keyMappingService = resolve(IKeyMappingService),
  ) {}

  attached(): void {
    const vimState = VimStateClass.createEmpty().serialize();
    vimState.id = "khong-a";
    vimState.lines = [
      // { text: "" },
       { text: "01234 6789" },
       { text: "abcdefg hijklmnopqr stuvwxyz" },
       { text: "abcd fghifkl" },
    ];
    vimState.cursor = { line: 0, col: 0 };
    // vimState.cursor = { line: 1, col: 3 };
    this.vimState = vimState;
    this.convertVimStateToTextareaText();
    const options: VimOptions = {
      vimId: VIM_ID_MAP.khongAPage,
      vimState: this.vimState,
      container: this.textareaTextContainerRef,
      inputElement: this.textareaRef,
      childSelector: "vim-line",
      hooks: {
        modeChanged: (...args) => {
          const { vimState } = args[0];
          const newVimState = vimState;
          if (!newVimState) return;
          if (!newVimState.mode) return;
          // For now: early return when same mode
          const isSameMode = !VimHelper.hasModeChanged(
            this.vimCore.getVimState().mode,
            vimState.mode,
          );
          if (isSameMode) return;

          VimHelper.switchModes(newVimState.mode, {
            insert: () => {
              this.convertVimStateToTextareaText();
              const offset = VimHelper.cursorToOffsetByVimState(newVimState);
              this.vimUi.enterInsertModeV2(offset);
            },
            normal: () => {
              /**                                                                                                     Lines */
              const lines = this.textValue.split("\n");
              lines.forEach((text, index) => {
                if (!newVimState.lines?.[index]) return;
                newVimState.lines[index].text = text;
              });
              /**                                                                                                     Cursor */
              const offset = SelectionService.getOffsetFromTextarea(
                this.textareaRef,
              );
              const cursorFromOffset = VimHelper.convertOffsetToVimStateCursor(
                offset,
                newVimState,
              );
              const col = cursorFromOffset?.col;
              if (newVimState.cursor && col) newVimState.cursor.col = col;

              options.container?.blur();
            },
          });

          if (options?.hooks?.modeChanged) {
            const updatedArgs = args;
            updatedArgs[0].vimState = newVimState;
            // options.hooks.modeChanged(...updatedArgs);
          }

          return newVimState;
        },
        vimStateUpdated: (vimState) => {
          /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("vimStateUpdated:");
          // VimHelper.debugLog(vimState);
          this.vimState = vimState;
          this.vimUi.update(vimState);
          this.convertVimStateToTextareaText();
        },
      },
    };
    const vimCore = new VimCore(options);
    this.vimCore = vimCore;
    this.vimUi = new VimUi(vimCore.getVimState(), {
      ...options,
      caret: this.cursorRef,
    });

    this.initEvents(options);
  }

  public focusTextarea() {
    this.textareaRef.focus();
    this.textareaRef.setSelectionRange(2, 2);
  }

  private initEvents(options: VimOptions) {
    //document.addEventListener("pointerup", async (event) => {
    //  const sel1 = window.getSelection()?.toString();
    //  /*prettier-ignore*/ console.log("[khong-a-page.ts,154] sel1: ", sel1);
    //  const sel2 = SelectionService.getCursorFromSelection(this.textareaRef);
    //  /*prettier-ignore*/ console.log("[khong-a-page.ts,156] sel2: ", sel2);
    //});
    document.addEventListener("keydown", async (event) => {
      console.clear();
      // 1. Event -> Keys + Modifiers
      const keyData = this.getKeyData(event);
      /*prettier-ignore*/ console.log("[khong-a-page.ts,168] keyData: ", keyData);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([,,1])) console.log("keyData", keyData);
      // 2. Keys + Modifiers -> Command
      const command = this.getCommand(keyData, options);
      /*prettier-ignore*/ console.log("[khong-a-page.ts,172] command: ", command);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([,,1])) console.log("command", command);
      // 3. Command -> Action
      await this.executeCommand(command, keyData, options);

      // 4. Action -> State Change
      // 5. State Change -> UI Update
      // 6. UI Update -> Render
      // 7. Render -> DOM Update
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
  ): VimCommand | undefined {
    const context = options.vimId;
    if (!context) throw new Error("No context provided");
    const currentBindings = this.commandsService.commandsRepository[context];
    options.keyBindings = currentBindings;
    const mode = this.vimState.mode;
    let finalCommand = this.keyMappingService.prepareCommandV2(
      keyData.composite,
      mode,
      options,
    );
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("command", finalCommand);
    let finalPressedKey = keyData.key;
    const hasQueuedKeys = this.keyMappingService.queuedKeys.length;
    if (finalCommand && !hasQueuedKeys) {
      const globalBindings =
        this.commandsService.commandsRepository[VIM_ID_MAP.global];
      if (options?.keyBindings) options.keyBindings = globalBindings;
      const globalCommand = this.keyMappingService.prepareCommandV2(
        keyData.composite,
        mode,
        options,
      );
      finalCommand = globalCommand;
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
      if (!finalCommand) return;
      this.keyMappingService.setLastCommand(finalCommand);
    }

    return finalCommand;
  }

  private async executeCommand(
    command: VimCommand | undefined,
    keyData: IKeyData,
    options: VimOptions,
  ) {
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([,,2])) console.log("[] Start of command execution");
    let preventDefault = false;
    let vimState: IVimState | undefined = this.vimState;
    const mode = this.vimState.mode;
    const finalPressedKey = keyData.key;
    const finalKeyWithModifier = keyData.composite;
    const commandSequence = command?.sequence;
    const allowHook = mode !== VimMode.INSERT && !isEnter(finalPressedKey);
    if (command?.execute) {
      const response = await command.execute(mode, vimState, this.vimCore);
      if (typeof response === "boolean") {
        preventDefault = response;
      }

      if (options?.hooks?.commandListener && allowHook)
        options.hooks.commandListener({
          vimState: this.vimCore.getVimState(),
          targetCommand: VIM_COMMAND[command.command ?? "nothing"],
          targetCommandFull: command,
          keys: finalKeyWithModifier,
        });
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
  }

  private updateVimState(vimState: IVimState) {
    this.vimUi.updateV2(vimState);
  }

  private convertTextareaTextToVimState(): void {
    const lines = this.textValue.split("\n");
    /*prettier-ignore*/ console.log("[khong-a-page.ts,334] lines: ", lines);
    this.vimState.lines = lines.map((text) => ({ text }));
  }

  private convertVimStateToTextareaText(): void {
    this.textValue =
      this.vimState.lines?.map((line) => line.text).join("\n") ?? "";
  }
}
