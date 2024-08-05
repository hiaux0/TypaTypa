export function getIsInputActive(): boolean | null {
  const isInputActive = ["INPUT", "TEXTAREA"].includes(
    document.activeElement?.nodeName ?? "",
  );

  return isInputActive;
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
