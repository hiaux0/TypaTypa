import { ShortcutService } from "../../common/services/ShortcutService";
import { IVimState, VimOptions } from "./vim-types";
import { KeyMappingService } from "./vimCore/commands/KeyMappingService";
import { VimHelper } from "./VimHelper";
import { VimUi } from "./vim-ui/VimUi";
import { VimCore } from "./vimCore/VimCore";
import { SelectionService } from "../../common/services/SelectionService";
import { getIsInputActive } from "../../common/modules/htmlElements";

import { CursorUtils } from "../../common/modules/cursor/cursor-utils";
import { SPACE } from "../../common/modules/keybindings/app-keys";
import { VIM_COMMAND } from "./vim-commands-repository";
import { cursorAllModes } from "./key-bindings";

/**
 * - Takes in input from user
 * - redirects them to
 *   - VimCore
 *   - and VimUi
 */
export class VimInputHandler {
  private vimCore: VimCore;
  private vimUi: VimUi;
  private options?: VimOptions;
  private eventListeners: any[] = [];

  public init(options?: VimOptions) {
    this.options = options;

    const vimCore = VimCore.create({
      ...this.options,
      hooks: {
        ...this.options?.hooks,
        modeChanged: (...args) => {
          const { vimState } = args[0];
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
              if (!this.options?.container) return;
              /** Cursor */
              const cursor = SelectionService.getCursorFromSelection(
                this.options.container,
              );
              if (!cursor) return;
              if (cursor.line !== -1) {
                newVimState.cursor = cursor;
              }

              /** Lines */
              const lines = this.vimUi.getTextFromHtml();
              newVimState.lines = lines;

              // this.vimUi.removeHtmlGeneratedNewLines(this.options);

              this.options.container.blur();
            },
          });

          if (this.options?.hooks?.modeChanged) {
            this.options.hooks.modeChanged(...args);
          }

          this.vimCore.setVimState(vimState);
          this.vimUi.update(vimState);
        },
      },
    });
    vimCore.init();

    this.vimUi = new VimUi(vimCore.getVimState(), this.options);

    this.vimCore = vimCore;
    if (this.options?.hooks?.afterInit)
      this.options.hooks.afterInit(this.vimCore);

    this.initKeyboard();
    this.initMouseListeners();
    this.initFocus();
  }

  public executeCommandSequence(sequence: string): void {
    this.vimCore.executeCommandSequence(sequence);
  }

  public executeCommand(
    commandName: VIM_COMMAND,
    inputForCommand: string,
  ): void {
    this.vimCore.executeCommand(commandName, inputForCommand);
  }

  public reload(vimState: IVimState) {
    this.updateVimState(vimState);
    this.vimCore.setVimState(vimState);
    this.clearKeybord();
    this.initKeyboard();
  }

  private updateVimState(vimState: IVimState) {
    this.vimUi.update(vimState);
  }

  public initKeyboard() {
    document.addEventListener("keydown", this.handleKeydown);
  }

  private initMouseListeners() {
    const { container } = this.options ?? {};
    if (!container) return;

    container.addEventListener("click", () => {
      // console.clear();
      const vimState = this.vimCore.getVimState();
      const updatedWithCursor = this.updateCursor(vimState);
      if (!updatedWithCursor) return;

      this.vimCore.setVimState(updatedWithCursor);
      this.vimUi.update(updatedWithCursor);

      if (this.options?.hooks?.vimStateUpdated) {
        this.options.hooks.vimStateUpdated(updatedWithCursor);
      }
    });
  }

  private clearKeybord() {
    document.removeEventListener("keydown", this.handleKeydown);
  }

  private handleKeydown = (event: KeyboardEvent) => {
    // /*prettier-ignore*/ console.log("[VimInputHandler.ts,144] event: ", event);
    // console.clear();
    if (getIsInputActive()) return;

    const mode = this.vimCore.getVimState().mode;
    // /*prettier-ignore*/ console.log("[VimInputHandler.ts,149] mode: ", mode);
    if (!mode) return;
    const finalKey = KeyMappingService.getKeyFromEvent(event);
    // /*prettier-ignore*/ console.log("[VimInputHandler.ts,152] finalKey: ", finalKey);
    const { command, commandName, commandSequence } =
      KeyMappingService.prepareCommand(finalKey, mode) ?? {};
    const pressedKey = ShortcutService.getPressedKey(event);
    // /*prettier-ignore*/ console.log("[VimInputHandler.ts,156] pressedKey: ", pressedKey);

    let finalCommand = command;
    // /*prettier-ignore*/ console.log("[VimInputHandler.ts,159] finalCommand: ", finalCommand);
    let finalPressedKey = pressedKey;
    if (commandName === VIM_COMMAND.repeatLastCommand) {
      finalCommand = KeyMappingService.getLastCommand();
      finalPressedKey = KeyMappingService.getLastKey();
    }

    let preventDefault = false;
    if (finalCommand?.execute) {
      const response = finalCommand.execute();
      if (typeof response === "boolean") {
        preventDefault = response;
      }
    } else if (commandSequence) {
      const vimState = this.vimCore.executeCommandSequence(commandSequence);
      if (!vimState) return;
      this.updateVimState(vimState);
    } else if (finalCommand?.command) {
      const vimState = this.vimCore.executeCommand(
        VIM_COMMAND[finalCommand.command],
        finalPressedKey,
      );
      // /*prettier-ignore*/ console.log("[VimInputHandler.ts,179] vimState: ", vimState);
      // if (!vimState) return; // issue: space in insert got too early returned

      if (vimState) {
        this.updateVimState(vimState);

        if (this.options?.hooks?.commandListener)
          this.options.hooks.commandListener({
            vimState,
            targetCommand: VIM_COMMAND[finalCommand.command],
            keys: finalKey,
          });
      }
    }

    VimHelper.switchModes(mode, {
      insert: () => {
        if (commandName) {
          // /*prettier-ignore*/ console.log("[VimInputHandler.ts,200] commandName: ", commandName);
          if (!preventDefault) return;
          // /*prettier-ignore*/ console.log("[VimInputHandler.ts,202] preventDefault: ", preventDefault);
          event.preventDefault();
        }

        if (!this.options.hooks.onInsertInput) return; // mostly for custom insert mode, do this early return. In normal vim editor, insert should just be inside input/textarea thing
        const isCursorMovementCommand = cursorAllModes.find(
          (command) => command.command === finalCommand?.command,
        );
        if (
          finalCommand &&
          finalCommand?.command !== VIM_COMMAND["space"] &&
          !isCursorMovementCommand
        )
          return;
        const response = this.options.hooks.onInsertInput(finalPressedKey);
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
      KeyMappingService.setLastKey(finalKey);
      KeyMappingService.setLastCommand(command);
    }
  };

  /**
   * Move to VimUi?
   */
  initFocus() {
    const { container } = this.options ?? {};
    if (!container) return;
    const vimState = this.vimCore.getVimState();

    const cursor = vimState.cursor;
    if (!cursor) return;
    const selector = `.inputLine`;
    const children = container.querySelectorAll(selector);
    const $childToFocus = children[cursor.line];
    if (!$childToFocus) return;

    const textNode = $childToFocus.childNodes[0];
    if (!textNode) return;

    const selection = window.getSelection();
    const range = document.createRange();
    try {
      range.setStart(textNode, cursor.col);
    } catch (error) {
      range.setStart(textNode, 0);
    }
    // range.setEnd(textNode, 3);
    selection?.addRange(range);

    container.focus();
  }

  private updateCursor(vimState: IVimState) {
    const newVimMode = structuredClone(vimState);
    const selection = document.getSelection();
    if (!selection) return;
    if (!this.options?.container) return;
    for (let rangeIndex = 0; rangeIndex < selection.rangeCount; rangeIndex++) {
      const range = selection.getRangeAt(rangeIndex);
      range.startContainer;
      const col = range.startOffset;
      const line = SelectionService.getLineIndex(
        this.options.container,
        range.startContainer,
      );
      const updatedVimState = CursorUtils.updateCursor(vimState, {
        line,
        col,
      });
      newVimMode.cursor = updatedVimState.cursor;
    }

    return newVimMode;
  }
}
