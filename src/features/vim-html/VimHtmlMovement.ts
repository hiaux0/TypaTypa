import { getIsInputActive } from "../../common/modules/htmlElements";
import { MyNode } from "../../domain/entities/myNode";
import { VimMode } from "../vim/vim-types";
import {
  NormalHtmlMovement,
  VisualHtmlMovement,
  InsertHtmlMovement,
} from "./vim-html-movement";
import { ACTIVE_CLASS } from "./vim-html-movement/constants";

interface VimHtmlMovementOptions {
  onKeyPressed?: (
    keys: string,
    activeElement: Element | HTMLElement | null,
    options: { mode: VimMode },
  ) => void;
}

/**
 * Background: When trying out initVim for html, there was too much code in the main component.
 * This aims to abstract it away.
 */
export class VimHtmlMovement {
  container: HTMLElement;
  nodes: MyNode[] = [];
  activeIndex: number;
  childSelector: string;

  private mode: VimMode | undefined = VimMode.NORMAL;
  private vimHtmlMode:
    | NormalHtmlMovement
    | VisualHtmlMovement
    | InsertHtmlMovement = new NormalHtmlMovement();
  currentVimHtmlId: string | undefined;
  private currentActive: HTMLElement;

  // private get currentActive(): Element | null {
  //   if (!this.container?.children?.length) return null;

  //   const active = Array.from(this.container.children)[this.activeIndex];

  //   return active;
  // }

  init(container: HTMLElement, options: VimHtmlMovementOptions = {}) {
    const { onKeyPressed } = options;
    this.container = container;

    // initVim({
    //   container,
    //   modeChanged: (_, mode) => {
    //     // if (this.prevent()) return;

    //     this.vimHtmlMode = this.getMode(mode);
    //     this.mode = mode;
    //     const isInputActive = getIsInputActive();
    //     if (this.mode === VimMode.NORMAL && isInputActive) {
    //       window.setTimeout(() => {
    //         this.currentActive.blur();
    //       }, 100);
    //       document.body.focus();
    //     }

    //     /** If insert in input, then put focus on input */
    //     if (this.currentActive.nodeName === "INPUT") {
    //       this.currentActive.focus();
    //     }
    //   },
    //   commandListener: (result, inputData) => {
    //     if (this.prevent()) return;
    //     // console.clear();

    //     // VisualHtmlMovement
    //     if (this.vimHtmlMode instanceof VisualHtmlMovement) {
    //       this.vimHtmlMode.setElementToMove(this.currentActive);
    //       const commandResult = this.vimHtmlMode.handleCommand(
    //         result.targetCommand,
    //       );
    //       if (!commandResult) return;
    //       const { activeIndex } = commandResult;
    //       this.setActiveIndex(activeIndex);
    //       return;
    //     } else if (this.vimHtmlMode instanceof InsertHtmlMovement) {
    //       // InsertHtmlMovement
    //     } else if (this.vimHtmlMode instanceof NormalHtmlMovement) {
    //       NormalHtmlMovement;
    //       const { currentElement, nextElement } =
    //         this.vimHtmlMode.handleCommand(result.targetCommand);
    //       if (!currentElement) return;
    //       if (!nextElement) return;

    //       if (this.getVimHtmlId(nextElement)) {
    //         this.currentVimHtmlId = this.getVimHtmlId(nextElement);
    //       }

    //       /**
    //        * If just any HTML element, then do general highlighl
    //        */
    //       if (!nextElement.classList.contains(this.childSelector)) {
    //         currentElement.classList.remove(ACTIVE_CLASS);
    //         nextElement.classList.add(ACTIVE_CLASS);
    //       }

    //       const elementIndex = this.getIndexOfElement(nextElement);
    //       this.setActiveIndex(elementIndex);

    //       const currentActive =
    //         this.vimHtmlMode.getCurrentActive() as HTMLElement;
    //       if (currentActive) {
    //         this.currentActive = currentActive;
    //       }
    //     }

    //     this.currentActive;
    //     if (!onKeyPressed) return;
    //     if (!inputData) return;
    //     if (!this.mode) return;

    //     const keys = inputData.modifiersText + inputData.pressedKey;
    //     onKeyPressed(keys, this.currentActive, { mode: this.mode });
    //   },
    // });
  }

  private getVimHtmlId(nextElement: HTMLElement): string | undefined {
    return nextElement.dataset.vimHtmlId;
  }

  private getMode<Mode extends VimMode>(
    mode: Mode | undefined,
  ): Mode extends VimMode.NORMAL
    ? NormalHtmlMovement
    : Mode extends VimMode.INSERT
    ? InsertHtmlMovement
    : Mode extends VimMode.VISUAL
    ? VisualHtmlMovement
    : never {
    let finalMode;
    switch (mode) {
      case VimMode.NORMAL: {
        finalMode = new NormalHtmlMovement();
        break;
      }
      case VimMode.INSERT: {
        finalMode = new InsertHtmlMovement();
        break;
      }
      case VimMode.VISUAL: {
        finalMode = new VisualHtmlMovement(this.nodes, this.container);
        break;
      }
    }

    // @ts-ignore
    return finalMode;
  }

  private prevent() {
    this.currentVimHtmlId = "first";
    // const target = 'second';
    // const shouldPrevent = this.element.dataset.vimHtmlId !== target;
    // const shouldPrevent = this.id !== this.currentVimHtmlId;
    const shouldPrevent = false;
    return shouldPrevent;
  }

  private setActiveIndex(newIndex: number | undefined): void {
    if (newIndex === undefined) return;

    /**
     * Was last element? Then highlight the new last one
     */
    if (this.nodes.length === newIndex) {
      let updatedIndex = newIndex - 1;
      if (updatedIndex < 0) {
        updatedIndex = 0;
      }

      this.activeIndex = updatedIndex;
      return;
    }

    // if (newIndex < 0) {
    //   /**
    //    * Fallback to 0
    //    */
    //   this.activeIndex = 0;
    //   return;
    // }

    this.activeIndex = newIndex;
  }

  private getIndexOfElement(element: Element | HTMLElement): number {
    const index = Array.from(this.container?.children).findIndex(
      (child) => child === element,
    );
    return index;
  }
}
