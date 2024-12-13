import { VimStateClass } from "../../../features/vim/vim-state";
import {
  IVimState,
  KeyBindingModes,
  VimHooks,
  VimMode,
  VimOptions,
} from "../../../features/vim/vim-types";
import "./vim-editor-vtwo.scss";
import { Logger } from "../../../common/logging/logging";
import { debugFlags } from "../../../common/modules/debug/debugFlags";
import { ShortcutService } from "../../../common/services/ShortcutService";
import { ICommandsService } from "../../../common/services/CommandsService";
import { bindable, resolve } from "aurelia";
import { VIM_ID_MAP } from "../../../common/modules/constants";
import {
  IKeyMappingService,
  overwriteKeybindingsV2,
} from "../../../features/vim/vimCore/commands/KeyMappingService";
import {
  VIM_COMMAND,
  VimCommand,
} from "../../../features/vim/vim-commands-repository";
import { VimHelper } from "../../../features/vim/VimHelper";
import { isEnter, keyBindings } from "../../../features/vim/key-bindings";
import { VimCore } from "../../../features/vim/vimCore/VimCore";
import { VimUi } from "../../../features/vim/vim-ui/VimUi";
import { SelectionService } from "../../../common/services/SelectionService";
import { VimInit } from "../../../features/vim/VimInit";
import { SPACE } from "../../../common/modules/keybindings/app-keys";
import {
  IVimInputHandlerV2,
  VimInputHandlerV2,
} from "../../../features/vim/VimInputHandlerV2";

const l = new Logger("VimEditorVtwo");

export class VimEditorVtwo {
  @bindable public vimState: IVimState;
  @bindable public vimEditorHooks: VimHooks;
  @bindable public showLineNumbers = true;
  @bindable public debug = false;
  @bindable public value = "";
  @bindable public mappingByMode: KeyBindingModes;

  public containerRef: HTMLElement;
  public textareaTextContainerRef: HTMLElement;
  public textareaRef: HTMLTextAreaElement;
  public cursorRef: HTMLElement;
  public textValue = "Hello world\n\nokayyy";
  public debugFlags = debugFlags;

  private vimUi: VimUi;
  private vimCore: VimCore;

  public get showTextarea(): boolean {
    if (!this.vimState) return false;
    const is = this.vimState.mode === VimMode.INSERT;
    return is;
  }

  constructor(
    private vimInit: VimInit = resolve(VimInit),
    private vimInputHandlerV2: VimInputHandlerV2 = resolve(IVimInputHandlerV2),
    private commandsService = resolve(ICommandsService),
    private keyMappingService = resolve(IKeyMappingService),
  ) {}

  attached(): void {
    this.convertVimStateToTextareaText();
    const options: VimOptions = {
      vimId: VIM_ID_MAP.vimEditorVtwo,
      vimState: this.vimState,
      container: this.textareaTextContainerRef,
      inputElement: this.textareaRef,
      childSelector: "vim-line",
      hooks: {
        afterInit: (vim) => {
          if (!this.vimEditorHooks?.afterInit) return;
          this.vimEditorHooks.afterInit(vim);
        },
        commandListener: (result) => {
          /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("commandListener:");
          if (!result.vimState) return;
          if (result.vimState.mode === VimMode.INSERT) return;

          this.setVimState(result.vimState);

          if (!this.vimEditorHooks?.commandListener) return;
          this.vimEditorHooks.commandListener(result);
        },
        vimStateUpdated: (vimState) => {
          /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("vimStateUpdated:");
          // VimHelper.debugLog(vimState);
          this.setVimState(vimState);
          this.vimUi.update(vimState);
          this.convertVimStateToTextareaText();

          if (!this.vimEditorHooks?.vimStateUpdated) return;
          this.vimEditorHooks.vimStateUpdated(vimState);
        },
        modeChanged: (...args) => {
          const { vimState } = args[0];
          const newVimState = vimState;
          if (!newVimState) return;
          if (!newVimState.mode) return;
          // For now: early return when same mode
          //const isSameMode = !VimHelper.hasModeChanged(
          //  this.vimCore.getVimState().mode,
          //  newVimState.mode,
          //);
          // if (isSameMode) return;

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
      },
    };
    const vimCore = new VimCore(options);
    this.vimCore = vimCore;
    this.vimUi = new VimUi(vimCore.getVimState(), {
      ...options,
      caret: this.cursorRef,
    });
    this.vimInputHandlerV2.registerAndInit(options);
    const merged = overwriteKeybindingsV2(keyBindings, this.mappingByMode);
    this.commandsService.registerCommands(options.vimId, merged);
  }

  detaching() {
    this.vimInit.clear();
  }

  public focusTextarea() {
    this.textareaRef.focus();
    this.textareaRef.setSelectionRange(2, 2);
  }

  private updateVimState(vimState: IVimState) {
    this.vimUi.updateV2(vimState);
  }

  private convertVimStateToTextareaText(): void {
    this.textValue =
      this.vimState.lines?.map((line) => line.text).join("\n") ?? "";
  }

  private setVimState(vimState: IVimState | undefined): void {
    if (!vimState) return;
    this.vimState = vimState;
  }
}
