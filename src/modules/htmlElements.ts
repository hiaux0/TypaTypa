export function getIsInputActive(): boolean | null {
  const isInputActive = ["INPUT", "TEXTAREA"].includes(
    document.activeElement?.nodeName ?? "",
  );

  return isInputActive;
}
