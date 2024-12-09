// import * as Rangy from "rangy";
import Rangy from "rangy";
const { createRangyRange } = Rangy;
import { Cursor } from "../../features/vim/vim-types";

type RangyRange = ReturnType<typeof createRangyRange>;

export class SelectionService {
  static getSelection() {
    const sel = getSelection();
    return sel;
  }

  static getSingleRange() {
    const selection = document.getSelection();
    if (!selection) return;

    const rangeCount = selection.rangeCount;
    if (rangeCount > 1) {
      throw new Error("unsupported");
    }

    const targetRange = selection.getRangeAt(0);
    return targetRange;
  }

  static createRange(node: Node, cursor: Cursor) {
    const range = Rangy.createRangyRange();

    // Col
    range.setStart(node, cursor.col);
    range.setEnd(node, cursor.col);

    // Line
    // hanlded by the `node` arg

    return range;
  }

  static setSingleRange(range: RangyRange) {
    Rangy.getSelection().setSingleRange(range);
    // const range: Range = document.createRange();

    // // Col
    // range.setStart(node, cursor.col);
    // range.setEnd(node, cursor.col);

    // // Line
    // // hanlded by the `node` arg

    // document.getSelection().addRange(range);
  }

  static getOffsetFromTextarea(element: HTMLTextAreaElement): number {
    const selection = element.selectionStart;
    return selection;
  }

  static getCursorFromSelection(element: HTMLElement): Cursor | undefined {
    const selection = document.getSelection();
    if (!selection) return;

    for (let rangeIndex = 0; rangeIndex < selection.rangeCount; rangeIndex++) {
      const range = selection.getRangeAt(rangeIndex);
      const col = range.startOffset;
      const line = this.getLineIndex(element, range.startContainer);
      if (line == null) return;

      const cursor = { col, line };
      return cursor;
    }
  }

  static getLineIndex(parent: Element, textNode: Node): number | undefined {
    const parentOfTextNode = textNode.parentElement;
    if (!parentOfTextNode) return;
    /** Assumption: There may be other divs in the container, but we want to limit to node like parent nodes of text */
    const rawParentNodeClasses = Array.from(parentOfTextNode.classList);
    if (!rawParentNodeClasses.length) return;

    const parentNodeClasses = `.${rawParentNodeClasses.join(".")}`;

    try {
      const limitToParentTextNodeClasses = Array.from(
        parent.querySelectorAll(parentNodeClasses),
      );
      const positionIndex =
        limitToParentTextNodeClasses.indexOf(parentOfTextNode);
      return positionIndex;
    } catch {
      /** */
    }
  }
}
