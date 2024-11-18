import { bindable, resolve } from "aurelia";
import { watch } from "@aurelia/runtime-html";
import {
  IVimState,
  KeyBindingModes,
  VimHooks,
  VimMode,
  VimOptions,
} from "../../../features/vim/vim-types";
import { VimInit } from "../../../features/vim/VimInit";
import { debugFlags } from "../../../common/modules/debug/debugFlags";
import { IKeyMappingMapping } from "../../../types";
import { VIM_COMMAND } from "../../../features/vim/vim-commands-repository";
import { IVimInputHandlerV2 } from "../../../features/vim/VimInputHandlerV2";
import { isEnter } from "../../../features/vim/key-bindings";
import { getTextNodeToFocus } from "../../../common/modules/htmlElements";
import { SelectionService } from "../../../common/services/SelectionService";
import { Logger } from "../../../common/logging/logging";

const l = new Logger('VimEditor')

export class VimEditor {
  @bindable public vimState: IVimState;
  @bindable public vimEditorHooks: VimHooks;
  @bindable public showLineNumbers = true;
  @bindable public debug = false;
  @bindable public value = "";
  @bindable public mappingByKey: IKeyMappingMapping;
  @bindable public mappingByMode: KeyBindingModes;

  private debugFlags = debugFlags.vimEditor;
  public isContentEditable = false;

  @watch((editor) => editor?.vimState?.id)
  vimIdChanged() {
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-editor.ts:20 ~ this.vimState.id:', this.vimState.id);
    this.vimInit.reload(this.vimState);
  }

  private inputContainerRef: HTMLInputElement;

  get contenteditable() {
    if (!this.vimState) return false;
    const is = this.vimState.mode === VimMode.INSERT;
    return is;
  }

  constructor(
    private vimInit: VimInit = resolve(VimInit),
    private vimInputHandlerV2: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
  ) {}

  async attached() {
    // @ts-ignore
    window.ve = this;
    // /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'orange'}`);
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-editor.ts:60 ~ this.vimState:', this.vimState);
    // this.vimState.mode = VimMode.INSERT;

    const options: VimOptions = {
      vimState: this.vimState,
      vimId: this.vimState.id + "-vim-editor",
      container: this.inputContainerRef,
      childSelector: "vim-line",
      hooks: {
        afterInit: (vim) => {
          // console.clear();
          // const result = vim.executeCommandSequence("za");
          // this.vimInit.reload(result!);
          // console.clear();
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
          // /*prettier-ignore*/ console.trace("[vim-editor.ts,79] vimStateUpdated: ", );
          // const logtext = vimState.lines[0].text
          // /*prettier-ignore*/ console.log("[vim-editor.ts,82] logtext: ", logtext);
          this.setVimState(vimState);

          const text = vimState.lines.map((l) => l.text).join(" ");
          // /*prettier-ignore*/ console.log(">>>> [vim-editor.ts,63] text: ", text);
          this.value = text;

          if (!this.vimEditorHooks?.vimStateUpdated) return;
          this.vimEditorHooks.vimStateUpdated(vimState);
        },
        modeChanged: ({ vimState }) => {
          if (!vimState) return;
          this.setVimState(vimState);
        },
        onInsertInput: (key) => {
          /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("onInsertInput:", );
          const vimState = this.vimInit.vimCore.getVimState();
          if (this.handleEnter(key, vimState)) return true;
        },
      },
    };
    // /*prettier-ignore*/ console.log("[vim-editor.ts,82] this.mappingByModes: ", this.mappingByMode);
    this.vimInputHandlerV2.registerAndInit(options, this.mappingByMode, {
      reInit: true,
    });
    this.vimInit.init(options, this.mappingByKey, this.mappingByMode);

    this.initVimEditorHooks();
  }

  detaching() {
    this.vimInit.clear();
  }

  private handleEnter(key: string, vimState: IVimState): boolean {
    if (!isEnter(key)) return;

    const $lines = this.inputContainerRef.querySelectorAll(".vim-line");
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const cursor = range.startOffset;
    const currentLine = vimState.cursor.line;
    const $currentLine = Array.from($lines)[currentLine] as HTMLElement;
    const text = $currentLine.innerText;
    const beforeText = text.slice(0, cursor);
    const afterText = text.slice(cursor);
    vimState.lines[vimState.cursor.line] = { text: beforeText };
    vimState.lines.splice(currentLine + 1, 0, { text: afterText });
    this.vimInit.vimCore.setVimState(vimState);

    window.requestAnimationFrame(() => {
      const nextLine = currentLine + 1;
      const $updatedLines =
        this.inputContainerRef.querySelectorAll(".vim-line");
      const $nextLine = Array.from($updatedLines)[nextLine] as HTMLElement;
      /*prettier-ignore*/ console.log("[vim-editor.ts,142] nextLine: ", $nextLine);
      const cursor = { ...vimState.cursor };
      cursor.line = nextLine;
      cursor.col = 0;
      const { textNode, newCursor } = getTextNodeToFocus($nextLine, cursor);
      const range = SelectionService.createRange(textNode, newCursor);
      // /*prettier-ignore*/ console.log("[VimUi.ts,284] range: ", range);
      SelectionService.setSingleRange(range);
    });

    return true;
  }

  private initVimEditorHooks() {
    // this.vimEditorHooks = {};
  }

  private setVimState(vimState: IVimState | undefined): void {
    // /*prettier-ignore*/ console.trace("[vim-editor.ts,82] vimState.lines.length: ", vimState.lines.length);
    // /*prettier-ignore*/ console.log("[vim-editor.ts,82] vimState.lines.length: ", vimState.lines.length);
    if (!vimState) return;
    this.vimState = vimState;
    this.vimState.lines;
    // /*prettier-ignore*/ console.log("[vim-editor.ts,85] this.vimState.lines: ", this.vimState.lines);
    this.vimState.lines.length;
    // /*prettier-ignore*/ console.log("[vim-editor.ts,86] this.vimState.lines.length: ", this.vimState.lines.length);
  }
}
