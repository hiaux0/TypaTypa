import { bindable } from "aurelia";
import { watch } from "@aurelia/runtime-html";
import {
  IVimState,
  VimHooks,
  VimMode,
  VimOptions,
} from "../../../features/vim/vim-types";
import { VimInit } from "../../../features/vim/VimInit";
import { debugFlags } from "../../../common/modules/debug/debugFlags";

export class VimEditor {
  @bindable public vimState: IVimState;
  @bindable public vimEditorHooks: VimHooks;
  @bindable public showLineNumbers = true;
  @bindable public debug = false;

  private vimInit: VimInit;
  private debugFlags = debugFlags.vimEditor;

  @watch((editor) => editor.vimState.id)
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

  async attached() {
    // /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'orange'}`);
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-editor.ts:60 ~ this.vimState:', this.vimState);
    // this.vimState.mode = VimMode.INSERT;

    const options: VimOptions = {
      vimState: this.vimState,
      container: this.inputContainerRef,
      childSelector: "inputLine",
      hooks: {
        afterInit: (vim) => {
          // console.clear();
          // const result = vim.executeCommandSequence("za");
          // this.vimInit.reload(result!);
          // console.clear();
        },
        commandListener: (result) => {
          if (!result.vimState) return;

          this.setVimState(result.vimState);

          if (!this.vimEditorHooks?.commandListener) return;
          this.vimEditorHooks.commandListener(result);
        },
        vimStateUpdated: (vimState) => {
          this.setVimState(vimState);

          if (!this.vimEditorHooks?.vimStateUpdated) return;
          this.vimEditorHooks.vimStateUpdated(vimState);
        },
        modeChanged: ({ vimState }) => {
          if (!vimState) return;
          this.setVimState(vimState);
        },
      },
    };
    this.vimInit = new VimInit();
    this.vimInit.init(options);

    this.initVimEditorHooks();
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
