import { Logger } from "../../../common/logging/logging";
import { getCssVar } from "../../../common/modules/css/css-variables";
import { debugFlags } from "../../../common/modules/debug/debugFlags";
import { HtmlService } from "../../../common/services/HtmlService";
import { QuerySelectorService } from "../../../common/services/QuerySelectorService";
import { SelectionService } from "../../../common/services/SelectionService";
import {
  VimMode,
  VimEditorOptions,
  Cursor,
  VimLine,
  IVimState,
  FoldMap,
} from "../vim-types";

/* eslint-disable @typescript-eslint/no-unused-vars */
const logger = new Logger("VimUi");
type Direction = "up" | "down" | "left" | "right" | "none";

/**
 * - Update cursor in normal mode
 * - Update lines from insert mode to vimState lines
 * - Translate Cursor location to browser input cursor
 * - Handle focus of Insert mode inputs
 */
export class VimUi {
  public mode: VimMode;

  private readonly container: HTMLElement | undefined;
  private caret: HTMLElement | undefined;
  private readonly childSelector: string | undefined;
  private readonly caretWidth: number;
  private readonly caretHeight: number;
  private _currentLineNumber = 0;
  private querySelectorService: QuerySelectorService;

  private get currentLineNumber(): number {
    return this._currentLineNumber;
  }
  private set currentLineNumber(value: number) {
    this._currentLineNumber = value;
  }
  private currentCaretCol = 0;

  constructor(public vimState: IVimState, public options?: VimEditorOptions) {
    if (options) {
      this.container = options.container;
      this.caret = options.caret;
      this.childSelector = options.childSelector;
      this.querySelectorService = new QuerySelectorService(
        this.container,
        this.childSelector,
      );
    }

    this.caretWidth = getCssVar("--caret-size-width");
    this.caretHeight = getCssVar("--caret-size-height");

    if (!this.caret) {
      this.createCaret();
    }
    if (!this.container) return;
    this.update(vimState);
  }

  private createCaret() {
    const $caret = document.createElement("div");
    $caret.id = "caret";
    const grandParent = this.container?.parentElement;
    grandParent?.appendChild($caret);
    this.caret = $caret;
  }

  public update(vimState: IVimState): void {
    if (!vimState) return
    this.setCursorMovement(vimState.cursor);
  }

  private setCursorMovement(newCursor?: Cursor) {
    if (!this.caret) return;

    //
    let newCursorLine: number;
    let newCursorCol: number;

    if (newCursor) {
      newCursorLine = newCursor.line;
      newCursorCol = newCursor.col;
    } else {
      // just use old values
      newCursorLine = this.currentLineNumber;
      newCursorCol = this.currentCaretCol;
    }

    this.commenKeyFunctionality();
    const lineOffsetLeft = this.getLineRectOffsetLeft();
    if (lineOffsetLeft == null) return;

    const vertDirection =
      this.currentLineNumber > newCursorLine ? "up" : "down";
    const vertSame = this.currentLineNumber === newCursorLine;
    const vertDelta = Math.abs(this.currentLineNumber - newCursorLine);

    // adjust lines with fold map
    if (vertDirection === "down") {
      newCursorLine = getAdjustedCursorLineWithFoldmap(
        this.vimState.foldMap,
        this.vimState.cursor,
        Math.abs(this.currentLineNumber - newCursorLine),
      );
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: VimUi.ts:106 ~ newCursorLine:', newCursorLine);
    }

    const horiDirection =
      this.currentCaretCol > newCursorCol ? "left" : "right";
    const horiSame = this.currentCaretCol === newCursorCol;
    const horiDelta = Math.abs(this.currentCaretCol - newCursorCol);

    let direction: Direction = "none";
    let delta = 0;
    if (!horiSame) {
      direction = horiDirection;
      delta = horiDelta;
    } else if (!vertSame) {
      direction = vertDirection;
      delta = vertDelta;
    }

    this.currentLineNumber = newCursorLine;
    this.currentCaretCol = newCursorCol;

    const newTop = newCursorLine * this.caretHeight;
    this.caret.style.top = `${newTop}px`;
    const newLeft = newCursorCol * this.caretWidth;
    this.caret.style.left = `${lineOffsetLeft + newLeft}px`;

    if (debugFlags.vimUi.enableScrollEditor) {
      this.scrollEditor(direction, delta);
    }
  }

  private readonly scrollEditor = (
    direction: Direction,
    delta: number,
  ): void => {
    const cursor = this.caret;
    if (!cursor) return;
    const editor = this.container;
    if (!editor) return;
    const containerRect = editor.getBoundingClientRect();

    /** Relative to container */
    const cursorRect = cursor.getBoundingClientRect();
    const lineHeight = this.caretHeight;
    const cursorWidth = cursorRect.width;
    const relCursorTop = cursorRect.top; // - containerRect.top;
    const relCursorLeft = cursorRect.left; // - containerRect.top;
    const relCursorBottom = cursorRect.bottom; //  - containerRect.top;
    const relCursorRight = cursorRect.right; //  - containerRect.top;

    const THRESHOLD_VALUE = 40; // - 40: 40 away from <direction>, then should scroll
    // bottom = right, up = left

    const bottomThreshold = containerRect.bottom - THRESHOLD_VALUE;
    const shouldScrollDown = relCursorBottom > bottomThreshold;
    const topThreshold = containerRect.top + THRESHOLD_VALUE;
    const shouldScrollUp = relCursorTop < topThreshold;

    const rightThreshold = containerRect.right - THRESHOLD_VALUE;
    const shouldScrollRight = relCursorRight > rightThreshold;
    const leftThreshold = containerRect.left + THRESHOLD_VALUE;
    const shouldScrollLeft = relCursorLeft < leftThreshold;

    const horiChange = delta * lineHeight;
    const vertiChange = delta * cursorWidth;
    switch (direction) {
      case "up":
        if (shouldScrollUp) {
          editor.scrollTop -= horiChange;
        }
        break;
      case "down":
        if (shouldScrollDown) {
          editor.scrollTop += horiChange;
        }
        break;
      case "left":
        if (shouldScrollLeft) {
          editor.scrollLeft -= vertiChange;
        }
        break;
      case "right":
        if (shouldScrollRight) {
          editor.scrollLeft += vertiChange;
        }
        break;
      default: {
        break;
      }
    }

    // cursor.scrollIntoView({
    //   behavior: 'smooth',
    //   block: 'nearest',
    //   inline: 'nearest',
    // });
  };

  private getLineRectOffsetLeft() {
    if (!this.childSelector) return;
    const children = this.querySelectorService.getInputContainerChildren();
    if (!children) return;
    const currentChild = children[this.currentLineNumber];
    let childOffsetLeft = 0;
    if (currentChild != null) {
      childOffsetLeft = currentChild.offsetLeft;
    }

    // logger.debug(['Child offset: %d', childOffsetLeft]);

    return childOffsetLeft;
  }

  private commenKeyFunctionality() {
    this.resetCaretBlinking();
  }

  private resetCaretBlinking() {
    if (!this.caret) return;

    this.caret.classList.remove("caret-blinking");
    /**
     * Needed to restart the animation
     * https://css-tricks.com/restart-css-animation/
     */
    void this.caret.offsetWidth;
    this.caret.classList.add("caret-blinking");
  }

  public enterInsertMode(cursor: Cursor | undefined) {
    /**
     * Need else, contenteditable element gets not focused correctly.
     * Relates to Aurelia binding to `contenteditable` in the view
     */
    window.requestAnimationFrame(() => {
      this.focusContainer();
      this.setCursorInInsert(cursor);
    });
  }

  private setCursorInInsert(cursor?: Cursor) {
    if (!cursor) return;

    const children = this.querySelectorService.getInputContainerChildren();
    if (!children) return;
    const $childToFocus = children[cursor.line];
    if (!$childToFocus) return;

    /** */
    const { textNode, newCursor } = getTextNodeToFocus($childToFocus, cursor);
    /** */

    /**
     * Make sure, there is a text node.
     */
    // const textNode = document.createTextNode($childToFocus.textContent);
    const range = SelectionService.createRange(textNode, newCursor);
    SelectionService.setSingleRange(range);
  }

  private focusContainer() {
    this.container?.focus();
  }

  /**
   * 1. When using <input> from html, translate text content back on VIM
   * 2. When pasting
   * ```html
   * ```
   *
   * How content looks like
   *
   * A. Normal typing
   * ```html
   * <div class="inputLine">
   *   pasted
   *   <br>
   * </div>
   * ```
   * B. Pasting
   *
   *   i. One line (same as A.)
   *   ```html
   *   <div class="inputLine">
   *     pasted
   *     <br>
   *   </div>
   *   ```
   *   ii. Multi line (text only (ctrl-shift-v))
   *   ```html
   *   <div class="inputLine">
   *     first line
   *     <br>
   *     second line
   *   </div>
   *   ```
   *   iii. With HTML
   *   ```html
   *   <div class="inputLine">
   *     <div style="...">
   *       <div><span style="color: #6a9955">
   *         * B. Pasting
   *       </span></div>
   *     </div>
   *   </div>
   *   ```
   */
  public getTextFromHtml(): VimLine[] {
    const $children = this.querySelectorService.getInputContainerChildrenText();
    const lines: VimLine[] = [];

    $children?.forEach((child) => {
      /* 0. just empty line */
      const { childNodes } = child;
      if (!childNodes) return;

      const [first, second, third, ...others] = childNodes;

      const firstIsText = HtmlService.isTextNode(first);
      const secondIsBr = HtmlService.isBr(second);
      const thirdIsEmpty =
        HtmlService.isTextNode(third) && third.nodeValue === "";

      /** A. */
      /** B.i */
      const onlyOneNode = childNodes.length === 1 && firstIsText;
      const onlyOneNodeWithBr =
        childNodes.length === 2 && firstIsText && secondIsBr;
      const simpleCase = onlyOneNode && onlyOneNodeWithBr && thirdIsEmpty;
      if (simpleCase) {
        if (!child.textContent) return;
        lines.push({ text: child.textContent });
        return;
      }

      /** B.ii */
      const moreThan3ChildNodes = childNodes.length > 2;
      const isTextOnlyMultiLinePaste = moreThan3ChildNodes && !thirdIsEmpty;
      if (isTextOnlyMultiLinePaste) {
        const textNodes = getTextNodes(child);
        textNodes.forEach((textNode) => {
          if (!textNode.nodeValue) return;
          lines.push({ text: textNode.nodeValue });
        });
        return;
      }

      /** B.iii */
      const firstIsDiv = HtmlService.isTag(first, "div");
      if (firstIsDiv) {
        const childrenOfDivs = Array.from((first as Element).children);
        childrenOfDivs.forEach((child) => {
          if (!child.textContent) return;
          lines.push({ text: child.textContent });
        });
        return;
      }

      /** Rest is okay */
      if (!child.textContent) return;
      lines.push({ text: child.textContent });
    });
    return lines;
  }

  /**
   * [[W1]] Workaround for html issue, where when we enter a new line
   * in insert, then escape, then in the HTML, the generated one
   * still stays PLUS the newly added lines.
   *
   * Assumption
   * - all inserted ones have a <br> as child, thus check for those and remove them
   */
  public removeHtmlGeneratedNewLines(): void {
    const $children = this.querySelectorService.getInputContainerChildren();
    if (!$children) return;

    $children.forEach((child) => {
      const hasBr = !!child.querySelector("br");
      if (hasBr) {
        child.remove();
      }
    });
  }
}

function getTextNodes($childToFocus: Element) {
  const iter = document.createNodeIterator($childToFocus, NodeFilter.SHOW_TEXT);
  let textNode: Node | null;
  const resultNodes: Node[] = [];

  while ((textNode = iter.nextNode())) {
    resultNodes.push(textNode);
  }

  return resultNodes;
}

/**
 * [[B1]]
 *
 * Text nodes:
 * [0]|[12345]
 *
 * 1. Iterate over each node
 * 2. Keep track of iteration index "|"
 * 3. Return len of previous nodes for setting cursor
 */
function getTextNodeToFocus(
  $childToFocus: Element,
  cursor: Cursor,
): { textNode: Node; newCursor: Cursor } {
  const col = cursor.col;
  const iter = document.createNodeIterator($childToFocus, NodeFilter.SHOW_TEXT);
  let textNode: Node | null;

  let iterIndex = 0;
  let previousIterIndex = 0;
  do {
    textNode = iter.nextNode();
    if (!textNode) {
      textNode = document.createTextNode("");
      $childToFocus.appendChild(textNode);
      break;
    }

    const text = textNode.textContent;
    if (text) {
      const len = text.length;
      previousIterIndex = iterIndex;
      iterIndex += len;
    }
  } while (col > iterIndex);

  const newCursor = {
    ...cursor,
    col: col - previousIterIndex,
  };
  return { textNode, newCursor };
}

/**
 * When lines are folded, then it affects the cursor vertical movement
 */
function getAdjustedCursorLineWithFoldmap(
  foldMap: FoldMap | undefined,
  cursor: Cursor | undefined,
  unadjustedNewCusorLine: number,
): number {
  /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'darkblue'}`);
  if (!foldMap) return unadjustedNewCusorLine;
  if (!cursor) return unadjustedNewCusorLine;
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: VimUi.ts:459 ~ foldMap:', foldMap);
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: VimUi.ts:459 ~ unadjustedNewCusorLine:', unadjustedNewCusorLine);

  let stopper = 0;
  let adjusted = unadjustedNewCusorLine;
  while (foldMap[adjusted] === true && stopper < 20) {
    adjusted -= 1;
    stopper++;
  }

  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: VimUi.ts:474 ~ adjusted:', adjusted);
  return adjusted;
}