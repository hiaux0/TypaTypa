import { ISignaler, resolve } from "aurelia";
import { VimInit } from "../../../features/vim/VimInit";
import { isEnter, isEscape } from "../../../features/vim/key-bindings";
import { VimStateClass } from "../../../features/vim/vim-state";
import {
  IVimState,
  VimLine,
  VimOptions,
} from "../../../features/vim/vim-types";
import "./khong-a-page.scss";
import { IVimInputHandlerV2 } from "../../../features/vim/VimInputHandlerV2";
import { Logger } from "../../../common/logging/logging";
import { debugFlags } from "../../../common/modules/debug/debugFlags";

const l = new Logger("KhongAPage");

const titleQuestions = [
  "What do you want to denied of today?",
  "No is no, yes is no",
];

enum LifeAreas {
  "Relationships",
  "Career",
  "Health",
  "Wealth",
  "Personal Growth",
  "Family",
  "Social Life",
  "Hobbies",
  "Spirituality",
}

const possibleQuestions = [
  "Should I",
  "Can I",
  "Will I",
  "Is it a good idea to",
  "Is it possible to",
  "Is it a good time to",
  "Is it a good time for me to",
  "Are there any reasons for me to",
  "Are there any reasons not to",
];

const possibleNos = [
  "No.",
  "No!",
  "Nooooo",
  "Absolutely no.",
  "Ye.., No.",
  "Nope",
  "Nope.",
  "Nope!",
  "Hmm, no.",
  "Let me think... No.",
  "Let's count the leaves on the tree. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. No.",
  "Ok, let's see. No.",
  "Well considering the circumstances, no.",
];

export class KhongAPage {
  public containerRef: HTMLElement;
  public vimState: IVimState;
  public debugFlags = debugFlags;

  constructor(
    private vimInit: VimInit = resolve(VimInit),
    private vimInputHandler: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
    readonly signaler: ISignaler = resolve(ISignaler),
  ) {}

  attached(): void {
    const vimState = VimStateClass.createEmpty();
    vimState.id = "bruh";
    vimState.lines = [{ text: "01234 6789" }, { text: "abcd fghifkl" }];
    vimState.cursor = { line: 1, col: 2 };
    //const options: VimOptions = {
    //  vimState,
    //  vimId: vimState.id,
    //  container: this.containerRef,
    //  childSelector: "vim-line",
    //  hooks: {
    //    vimStateUpdated: (vimState: IVimState) => {
    //      this.vimState = vimState;
    //    },
    //  },
    //};
    // this.vimInit.init(options);
    // this.vimInputHandler.registerAndInit(options);
    this.vimState = vimState;
    // this.initEvents();
  }

  private initEvents() {
    this.containerRef.addEventListener("keydown", (event) => {
      console.clear();
      const key = event.key;
      /*prettier-ignore*/ console.log("[khong-a-page.ts,90] key: ", key);
      const $lines = this.containerRef.querySelectorAll(".vim-line");
      //if (key === "i") {
      //  this.containerRef.contentEditable = "true";
      //  this.containerRef.focus();
      //  return;
      //}
      // if (!isEscape(key)) return;
      if (isEnter(key)) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursor = range.startOffset;
        const $currentLine = Array.from($lines)[
          this.vimState.cursor.line
        ] as HTMLElement;
        const text = $currentLine.innerText;

        const beforeText = text.slice(0, cursor);
        const afterText = text.slice(cursor);

        $currentLine.innerText = beforeText;
        this.vimState.lines[this.vimState.cursor.line] = { text: beforeText };
        this.vimState.lines.push({ text: afterText });
        event.preventDefault();
        this.vimInit.vimCore.setVimState(this.vimState);
        return;
      }

      //window.requestAnimationFrame(() => {
      //  // this.containerRef.contentEditable = "false";
      //  const lines = Array.from($text).map((line) => {
      //    return { text: (line as HTMLElement).innerText };
      //  });
      //
      //  //const text = this.containerRef.innerText;
      //  //const fixEmptyNewLines = text.replace(/\n\n/g, "\n");
      //  //const asLines = fixEmptyNewLines.split("\n");
      //  //// const asLines = fixEmptyNewLines.split(/(?<=[\n|\r\n])/);
      //  //// const asLines = text.split(/\s*(\n|\r\n)\s*/);
      //  ////const splitResult = inputString
      //  ////.split("\n");
      //  //
      //  ///*                                                                                           prettier-ignore*/ if(l.shouldLog([,1])) console.log("asLines", asLines);
      //  ///*prettier-ignore*/ console.log("[khong-a-page.ts,68] asLines: ", asLines);
      //  this.lines = [];
      //  /*prettier-ignore*/ console.log("[khong-a-page.ts,117] lines: ", [...lines]);
      //  this.lines = lines;
      //  //this.signaler.dispatchSignal("refresh-lines");
      //  /*                                                                                           prettier-ignore*/ if(l.shouldLog([,1])) console.log("this.lines", this.lines);
      //});
    });
  }
}
