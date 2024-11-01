/**
 * Note: In firefox, have to enable
 * dom.events.asyncClipboard.readText -> true
 * dom.events.testing.asyncClipboard -> true
 */
export async function getClipboardContent(): Promise<string> {
  const text = await navigator.clipboard.readText();
  return text;
}

export async function setClipboardContent(text: string): Promise<void> {
  // await navigator.clipboard.writeText(text);

  // @ts-ignore
  if (window.clipboardData && window.clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
    // @ts-ignore
    return window.clipboardData.setData("Text", text);
  } else if (
    document.queryCommandSupported &&
    document.queryCommandSupported("copy")
  ) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      // @ts-ignore
      return document.execCommand("copy"); // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      // @ts-ignore
      return prompt("Copy to clipboard: Ctrl+C, Enter", text);
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
