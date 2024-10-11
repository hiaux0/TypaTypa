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
  await navigator.clipboard.writeText(text);
}
