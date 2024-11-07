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
    // /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'orange'}`);
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-editor.ts:60 ~ this.vimState:', this.vimState);
    // this.vimState.mode = VimMode.INSERT;

    const options: VimOptions = {
      vimState: this.vimState,
      vimId: this.vimState.id,
      container: this.inputContainerRef,
      childSelector: "inputLine",
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
          if (!result.vimState) return;

          this.setVimState(result.vimState);

          if (!this.vimEditorHooks?.commandListener) return;
          this.vimEditorHooks.commandListener(result);
        },
        vimStateUpdated: (vimState) => {
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
      },
    };
    // /*prettier-ignore*/ console.log("[vim-editor.ts,82] this.mappingByModes: ", this.mappingByMode);
    this.vimInit.init(options, this.mappingByKey, this.mappingByMode);
    this.vimInputHandlerV2.registerAndInit(options, this.mappingByMode);

    this.initVimEditorHooks();
  }

  detaching() {
    this.vimInit.clear();
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
