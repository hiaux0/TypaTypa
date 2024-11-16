import { Cursor } from "../../features/vim/vim-types";
import { getValueFromPixelString } from "./strings";

export function getIsInputActive(): boolean | null {
  const element = document.activeElement as HTMLElement;
  if (!element) return null;
  const isInputActive = ["INPUT", "TEXTAREA"].includes(element.nodeName ?? "");
  const isContentEditable = element.contentEditable === "true";
  const isActive = isInputActive || isContentEditable;
  return isActive;
}

export function onOutsideClick(
  element: HTMLElement,
  callback: () => void,
  okayElements?: HTMLElement[],
  ignoreElementOrSelectors?: (string | HTMLElement)[],
) {
  if (!element) return;
  function onClickCallback(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isOkayElementClicked = okayElements?.some((okayElement) => {
      return okayElement.contains(target);
    });
    const isIgnoreElementClicked = ignoreElementOrSelectors?.some(
      (ignoreElementOrSelector) => {
        if (typeof ignoreElementOrSelector === "string") {
          const matched = target.matches(ignoreElementOrSelector);
          return matched;
        }
        return ignoreElementOrSelector.contains(target);
      },
    );
    const isClickInside = isInsideElement(target, element);
    const invokeCallback =
      !isClickInside && !isOkayElementClicked && !isIgnoreElementClicked;
    if (invokeCallback) {
      callback();
      // document.removeEventListener("click", onClickCallback);
    }
  }

  document.addEventListener("click", onClickCallback);
}

export function isInsideElement(
  start: HTMLElement,
  parent: HTMLElement,
): boolean {
  if (start === parent) return true;
  let parentOfStart = start.parentElement;
  while (parentOfStart != null) {
    const condition = parent === parentOfStart;
    if (condition) {
      return true;
    }
    parentOfStart = parentOfStart.parentElement;
  }

  return false; // no matching parent found
}

export function findParentElement(
  startingElement: HTMLElement,
  selectorOrPredicateOrElement:
    | string
    | HTMLElement
    | ((parent: HTMLElement) => boolean),
): HTMLElement | null {
  if (startingElement === selectorOrPredicateOrElement) return startingElement;

  let parent = startingElement.parentElement;
  while (parent != null) {
    let condition: boolean;
    if (typeof selectorOrPredicateOrElement === "string") {
      condition = parent.matches(selectorOrPredicateOrElement);
    } else if (typeof selectorOrPredicateOrElement === "function") {
      condition = selectorOrPredicateOrElement(parent);
    } else {
      condition = parent === selectorOrPredicateOrElement;
    }
    if (condition) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null; // no matching parent found
}

export function getElementPositionAsNumber(
  element: HTMLElement,
  position: string = "left",
): number {
  const leftString = window.getComputedStyle(element)[position];
  const result = getValueFromPixelString(leftString);
  return result;
}

export function getElementStyleAsNumber(
  element: HTMLElement,
  style: keyof CSSStyleDeclaration,
): number {
  const styleString = window.getComputedStyle(element)[style] as string;
  const result = getValueFromPixelString(styleString);
  return result;
}

export function getRelativePosition(parent: HTMLElement, inner: HTMLElement) {
  const parentRect = parent.getBoundingClientRect();
  const innerRect = inner.getBoundingClientRect();

  const relativeLeft = innerRect.left - parentRect.left + parent.scrollLeft;
  const relativeTop = innerRect.top - parentRect.top + parent.scrollTop;

  return {
    left: relativeLeft,
    top: relativeTop,
  };
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
export function getTextNodeToFocus(
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
