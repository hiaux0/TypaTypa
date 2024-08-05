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
) {
  function onClickCallback(event: MouseEvent) {
    const isOkayElementClicked = okayElements?.some((okayElement) => {
      return okayElement.contains(event.target as HTMLElement);
    });
    const isClickInside = element?.contains(event.target as HTMLElement);
    const outside = !isClickInside && !isOkayElementClicked;
    if (outside) {
      callback();
      // document.removeEventListener("click", onClickCallback);
    }
  }

  document.addEventListener("click", onClickCallback);
}
